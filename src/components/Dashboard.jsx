import React, { useState, useEffect } from 'react';

function Dashboard({ user, token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [upline, setUpline] = useState([]);
  const [downline, setDownline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile, upline, and downline data
      const [profileRes, uplineRes, downlineRes] = await Promise.all([
        fetch('https://web-production-e7748.up.railway.app/api/users/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch('https://web-production-e7748.up.railway.app/api/users/upline', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }),
        fetch('https://web-production-e7748.up.railway.app/api/users/downline', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
      ]);

      // Check if any requests failed
      if (!profileRes.ok || !uplineRes.ok || !downlineRes.ok) {
        throw new Error('Failed to fetch user data from server');
      }

      const [profileData, uplineData, downlineData] = await Promise.all([
        profileRes.json(),
        uplineRes.json(),
        downlineRes.json()
      ]);

      if (profileData.success) setProfile(profileData.data.user);
      if (uplineData.success) setUpline(uplineData.data.upline);
      if (downlineData.success) setDownline(downlineData.data.downline);

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div style={{ textAlign: 'center' }}>
            <div className="loading" style={{ margin: '2rem auto' }}></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="alert alert-error">{error}</div>
          <button onClick={fetchUserData} className="btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1>Welcome, {profile?.email}</h1>
            <p>Manage your MLM referral network</p>
          </div>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="user-info">
          <div className="info-card">
            <h3>Your Referral Code</h3>
            <p>{profile?.referralCode}</p>
          </div>
          <div className="info-card">
            <h3>Direct Referrals</h3>
            <p>{profile?.directReferralCount || 0}</p>
          </div>
          <div className="info-card">
            <h3>Total Network</h3>
            <p>{downline.length}</p>
          </div>
          <div className="info-card">
            <h3>Network Levels</h3>
            <p>{Math.max(...downline.map(d => d.level), 0)}</p>
          </div>
        </div>
      </div>

      {profile?.referredBy && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Your Sponsor</h2>
          <div className="info-card">
            <h3>Referred by</h3>
            <p>{profile.referredBy.email} ({profile.referredBy.referralCode})</p>
          </div>
        </div>
      )}

      {upline.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Your Upline ({upline.length} levels)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upline.map((ancestor, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                background: '#f8fafc', 
                borderRadius: '8px',
                borderLeft: '4px solid #667eea'
              }}>
                <strong>Level {ancestor.level}:</strong> {ancestor.email} ({ancestor.referral_code})
              </div>
            ))}
          </div>
        </div>
      )}

      {downline.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Your Downline ({downline.length} total)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {downline.map((descendant, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                background: '#f0fdf4', 
                borderRadius: '8px',
                borderLeft: '4px solid #16a34a'
              }}>
                <strong>Level {descendant.level}:</strong> {descendant.email} ({descendant.referral_code})
              </div>
            ))}
          </div>
        </div>
      )}

      {downline.length === 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Build Your Network</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Share your referral code <strong>{profile?.referralCode}</strong> to start building your downline!
          </p>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: '600' }}>
            {profile?.referralCode}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;