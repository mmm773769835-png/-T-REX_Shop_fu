const bcrypt = require('bcrypt');

bcrypt.hash('773769835As', 10)
  .then(hash => {
    console.log('\n=== Hash Generated ===');
    console.log(hash);
    console.log('\n=== Copy this to .env as ADMIN_HASH ===\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });


