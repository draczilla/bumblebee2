const crypto = require('crypto');

/**
 * Generate a unique 6-character alphanumeric referral code
 * Uses crypto for secure random generation
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}

module.exports = { generateReferralCode };