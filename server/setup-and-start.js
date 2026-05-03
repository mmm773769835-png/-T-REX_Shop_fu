const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const password = '773769835As';
const envPath = path.join(__dirname, '.env');

console.log('🔧 Setting up server...\n');

// Generate hash
bcrypt.hash(password, 10)
  .then(hash => {
    console.log('✅ Hash generated successfully\n');
    
    // Check if .env exists
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('📄 Found existing .env file\n');
    } else {
      console.log('📄 Creating new .env file\n');
      envContent = `# Server Configuration
PORT=3000

# Admin Credentials
ADMIN_USER=owner
ADMIN_HASH=
# Run: node generate-hash.js to generate hash

# JWT Secret
JWT_SECRET=trex_shop_secret_key_change_in_production_2024

# Twilio Configuration (Optional - Server works in dev mode without it)
# TWILIO_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# TWILIO_WHATSAPP_FROM=
`;
    }
    
    // Update ADMIN_HASH if not set
    if (!envContent.includes('ADMIN_HASH=') || envContent.match(/ADMIN_HASH=\s*$/)) {
      envContent = envContent.replace(/ADMIN_HASH=.*/g, `ADMIN_HASH=${hash}`);
      console.log('✅ Updated ADMIN_HASH in .env\n');
    } else {
      console.log('ℹ️  ADMIN_HASH already set in .env\n');
    }
    
    // Write .env file
    try {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file ready!\n');
      console.log('📋 Hash generated:');
      console.log(hash);
      console.log('\n🚀 Starting server...\n');
      
      // Start server
      require('./index.js');
    } catch (err) {
      console.error('❌ Error writing .env:', err.message);
      console.log('\n📋 Please create .env manually with:');
      console.log(`ADMIN_HASH=${hash}\n`);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  });










