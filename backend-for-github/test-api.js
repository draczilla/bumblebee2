const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'alice@example.com', password: 'password123', referralCode: 'ROOT01' },
  { email: 'bob@example.com', password: 'password123', referralCode: null }, // Will use Alice's code
  { email: 'charlie@example.com', password: 'password123', referralCode: null }, // Will use Bob's code
  { email: 'diana@example.com', password: 'password123', referralCode: null }, // Will use Alice's code
];

let userTokens = {};
let userCodes = {};

async function testAPI() {
  console.log('🚀 Starting MLM Referral Tracker API Tests\n');

  try {
    // 1. Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // 2. Register Users in Hierarchy
    console.log('2. Registering Users...');
    
    // Register Alice (referred by ROOT01)
    console.log('   Registering Alice...');
    const aliceResponse = await axios.post(`${API_BASE}/api/auth/register`, testUsers[0]);
    userTokens.alice = aliceResponse.data.data.token;
    userCodes.alice = aliceResponse.data.data.user.referralCode;
    console.log(`   ✅ Alice registered with code: ${userCodes.alice}`);

    // Register Bob (referred by Alice)
    console.log('   Registering Bob...');
    testUsers[1].referralCode = userCodes.alice;
    const bobResponse = await axios.post(`${API_BASE}/api/auth/register`, testUsers[1]);
    userTokens.bob = bobResponse.data.data.token;
    userCodes.bob = bobResponse.data.data.user.referralCode;
    console.log(`   ✅ Bob registered with code: ${userCodes.bob}`);

    // Register Charlie (referred by Bob)
    console.log('   Registering Charlie...');
    testUsers[2].referralCode = userCodes.bob;
    const charlieResponse = await axios.post(`${API_BASE}/api/auth/register`, testUsers[2]);
    userTokens.charlie = charlieResponse.data.data.token;
    userCodes.charlie = charlieResponse.data.data.user.referralCode;
    console.log(`   ✅ Charlie registered with code: ${userCodes.charlie}`);

    // Register Diana (referred by Alice)
    console.log('   Registering Diana...');
    testUsers[3].referralCode = userCodes.alice;
    const dianaResponse = await axios.post(`${API_BASE}/api/auth/register`, testUsers[3]);
    userTokens.diana = dianaResponse.data.data.token;
    userCodes.diana = dianaResponse.data.data.user.referralCode;
    console.log(`   ✅ Diana registered with code: ${userCodes.diana}`);
    console.log('');

    // 3. Test Login
    console.log('3. Testing Login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'alice@example.com',
      password: 'password123'
    });
    console.log('✅ Alice login successful');
    console.log('');

    // 4. Test User Profiles
    console.log('4. Testing User Profiles...');
    for (const [name, token] of Object.entries(userTokens)) {
      const profileResponse = await axios.get(`${API_BASE}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = profileResponse.data.data.user;
      console.log(`   ${name.charAt(0).toUpperCase() + name.slice(1)}: ${user.email} | Code: ${user.referralCode} | Direct Referrals: ${user.directReferralCount}`);
    }
    console.log('');

    // 5. Test Upline (Charlie should see Bob -> Alice -> Root)
    console.log('5. Testing Upline (Charlie\'s ancestors)...');
    const charlieUplineResponse = await axios.get(`${API_BASE}/api/users/upline`, {
      headers: { Authorization: `Bearer ${userTokens.charlie}` }
    });
    const upline = charlieUplineResponse.data.data.upline;
    console.log(`   Charlie's upline (${upline.length} levels):`);
    upline.forEach(ancestor => {
      console.log(`     Level ${ancestor.level}: ${ancestor.email} (${ancestor.referral_code})`);
    });
    console.log('');

    // 6. Test Downline (Alice should see Bob, Charlie, Diana)
    console.log('6. Testing Downline (Alice\'s descendants)...');
    const aliceDownlineResponse = await axios.get(`${API_BASE}/api/users/downline`, {
      headers: { Authorization: `Bearer ${userTokens.alice}` }
    });
    const downline = aliceDownlineResponse.data.data.downline;
    const levelStats = aliceDownlineResponse.data.data.levelStats;
    console.log(`   Alice's downline (${downline.length} total users):`);
    levelStats.forEach(stat => {
      console.log(`     Level ${stat.level}: ${stat.count} users`);
    });
    downline.forEach(descendant => {
      console.log(`     Level ${descendant.level}: ${descendant.email} (${descendant.referral_code})`);
    });
    console.log('');

    // 7. Test Error Cases
    console.log('7. Testing Error Cases...');
    
    // Invalid referral code
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: 'invalid@example.com',
        password: 'password123',
        referralCode: 'INVALID'
      });
    } catch (error) {
      console.log('   ✅ Invalid referral code rejected:', error.response.data.message);
    }

    // Duplicate email
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: 'alice@example.com',
        password: 'password123',
        referralCode: 'ROOT01'
      });
    } catch (error) {
      console.log('   ✅ Duplicate email rejected:', error.response.data.message);
    }

    // Invalid login
    try {
      await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'alice@example.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('   ✅ Invalid login rejected:', error.response.data.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Referral Tree Structure:');
    console.log('   Root User (admin@example.com)');
    console.log('   └── Alice (alice@example.com)');
    console.log('       ├── Bob (bob@example.com)');
    console.log('       │   └── Charlie (charlie@example.com)');
    console.log('       └── Diana (diana@example.com)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testAPI();