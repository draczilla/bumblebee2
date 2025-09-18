const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateReferralCode } = require('../utils/generateReferralCode');

/**
 * Generate JWT token for user
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Register new user with referral code
 */
async function register(req, res) {
  const { email, password, referralCode } = req.body;

  try {
    // Validate input
    if (!email || !password || !referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and referral code are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find the referrer user
    const { data: referrerResult, error: referrerError } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrerResult) {
      return res.status(400).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    const referrerId = referrerResult.id;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate unique referral code for new user
    let newReferralCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      newReferralCode = generateReferralCode();
      const { data: codeCheck } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', newReferralCode)
        .single();
      
      if (!codeCheck) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique referral code'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const { data: newUserResult, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        referral_code: newReferralCode,
        referred_by_id: referrerId
      })
      .select('id, public_id, email, referral_code, created_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    const newUser = newUserResult;

    // Generate JWT token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.public_id,
          email: newUser.email,
          referralCode: newUser.referral_code,
          createdAt: newUser.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Login user with email and password
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const { data: userResult, error: userError } = await supabase
      .from('users')
      .select('id, public_id, email, password_hash, referral_code, created_at')
      .eq('email', email)
      .single();

    if (userError || !userResult) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult;

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.public_id,
          email: user.email,
          referralCode: user.referral_code,
          createdAt: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = { register, login };