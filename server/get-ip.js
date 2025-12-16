const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIP();
console.log('\n🌐 Your IP Address:', ip);
console.log(`📡 API URL should be: http://${ip}:3000\n`);
console.log('Copy this IP and update AuthService.js\n');

// Write to file for easy access
require('fs').writeFileSync('current-ip.txt', ip, 'utf8');
console.log('IP saved to current-ip.txt\n');




