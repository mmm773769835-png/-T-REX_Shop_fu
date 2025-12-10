const bcrypt = require('bcrypt');
(async ()=>{
  const pw = '773769835As';
  const hash = await bcrypt.hash(pw,10);
  console.log(hash);
})();
