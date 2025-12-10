const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 T-REX Shop OTP Server Setup\n');
console.log('='.repeat(50));

const envPath = path.join(__dirname, '.env');
const password = '773769835As';

// Generate hash
console.log('\n📝 Generating password hash...');
bcrypt.hash(password, 10)
  .then(hash => {
    console.log('✅ Hash generated successfully!\n');
    
    // Create .env content
    const envContent = `# Server Configuration
PORT=3000

# Admin Credentials  
ADMIN_USER=owner
ADMIN_HASH=${hash}

# JWT Secret
JWT_SECRET=trex_shop_secret_key_change_in_production_2024

# Twilio Configuration (Optional - Server works in dev mode without it)
# TWILIO_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# TWILIO_WHATSAPP_FROM=
`;

    // Write .env file
    try {
      if (fs.existsSync(envPath)) {
        console.log('⚠️  .env file already exists');
        console.log('   Updating ADMIN_HASH...\n');
      } else {
        console.log('📄 Creating .env file...\n');
      }
      
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('✅ .env file created/updated successfully!\n');
      console.log('='.repeat(50));
      console.log('\n🚀 Starting OTP Server...\n');
      console.log('📡 Server will run on: http://localhost:3000');
      console.log('🔧 Dev Mode: OTP codes will appear in console');
      console.log('\n' + '='.repeat(50));
      console.log('\nPress Ctrl+C to stop the server\n');
      
      // Import and start server
      require('./index.js');
    } catch (err) {
      console.error('\n❌ Error creating .env file:', err.message);
      console.log('\n📋 Please create .env manually with this hash:');
      console.log(`ADMIN_HASH=${hash}\n`);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n❌ Error generating hash:', err);
    process.exit(1);
  });


