const { supabase } = require('../config/database');

/**
 * Get user's upline (ancestors) using recursive CTE
 */
async function getUpline(req, res) {
  try {
    const userId = req.user.id;

    // Get current user's referrer
    const { data: currentUser } = await supabase
      .from('users')
      .select('referred_by_id')
      .eq('id', userId)
      .single();

    if (!currentUser?.referred_by_id) {
      return res.json({
        success: true,
        message: 'Upline retrieved successfully',
        data: {
          upline: [],
          totalCount: 0
        }
      });
    }

    // Build upline manually (Supabase doesn't support recursive CTEs in client)
    const upline = [];
    let currentReferrerId = currentUser.referred_by_id;
    let level = 1;

    while (currentReferrerId && level <= 10) { // Limit to prevent infinite loops
      const { data: referrer } = await supabase
        .from('users')
        .select('id, public_id, email, referral_code, created_at, referred_by_id')
        .eq('id', currentReferrerId)
        .single();

      if (!referrer) break;

      upline.push({
        id: referrer.public_id,
        email: referrer.email,
        referral_code: referrer.referral_code,
        created_at: referrer.created_at,
        level
      });

      currentReferrerId = referrer.referred_by_id;
      level++;
    }

    res.json({
      success: true,
      message: 'Upline retrieved successfully',
      data: {
        upline,
        totalCount: upline.length
      }
    });

  } catch (error) {
    console.error('Get upline error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Get user's downline (descendants) using recursive CTE
 */
async function getDownline(req, res) {
  try {
    const userId = req.user.id;

    // Build downline manually using breadth-first approach
    const downline = [];
    const downlineByLevel = {};
    let currentLevel = [userId];
    let level = 1;

    while (currentLevel.length > 0 && level <= 10) { // Limit depth
      const nextLevel = [];
      
      for (const parentId of currentLevel) {
        const { data: children } = await supabase
          .from('users')
          .select('id, public_id, email, referral_code, created_at')
          .eq('referred_by_id', parentId)
          .order('created_at', { ascending: true });

        if (children) {
          for (const child of children) {
            const childData = {
              id: child.public_id,
              email: child.email,
              referral_code: child.referral_code,
              created_at: child.created_at,
              level
            };

            downline.push(childData);
            nextLevel.push(child.id);

            if (!downlineByLevel[level]) {
              downlineByLevel[level] = [];
            }
            downlineByLevel[level].push({
              id: child.public_id,
              email: child.email,
              referralCode: child.referral_code,
              createdAt: child.created_at
            });
          }
        }
      }

      currentLevel = nextLevel;
      level++;
    }


    res.json({
      success: true,
      message: 'Downline retrieved successfully',
      data: {
        downline,
        downlineByLevel,
        totalCount: downline.length,
        levelStats: Object.keys(downlineByLevel).map(level => ({
          level: parseInt(level),
          count: downlineByLevel[level].length
        }))
      }
    });

  } catch (error) {
    console.error('Get downline error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('public_id, email, referral_code, created_at, referred_by_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get referrer info if exists
    let referrerInfo = null;
    if (user.referred_by_id) {
      const { data: referrer } = await supabase
        .from('users')
        .select('email, referral_code')
        .eq('id', user.referred_by_id)
        .single();
      
      if (referrer) {
        referrerInfo = {
          email: referrer.email,
          referralCode: referrer.referral_code
        };
      }
    }

    // Get direct referral count
    const { count: referralCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by_id', userId);

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.public_id,
          email: user.email,
          referralCode: user.referral_code,
          createdAt: user.created_at,
          referredBy: referrerInfo,
          directReferralCount: referralCount || 0
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = { getUpline, getDownline, getProfile };