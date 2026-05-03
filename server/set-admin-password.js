/**
 * سكريبت لإنشاء bcrypt hash لكلمة مرور المدير
 * 
 * الاستخدام:
 * node set-admin-password.js "كلمة_المرور"
 * 
 * مثال:
 * node set-admin-password.js "Admin@123456"
 */

const bcrypt = require('bcrypt');

async function main() {
  const password = process.argv[2] || 'Admin@123456'; // كلمة مرور افتراضية
  
  console.log('\n🔐 جاري إنشاء الهاش لكلمة المرور...\n');
  
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ تم إنشاء الهاش بنجاح!\n');
    console.log('=' .repeat(70));
    console.log('أضف هذا السطر إلى ملف server/.env:\n');
    console.log(`ADMIN_HASH=${hash}`);
    console.log('=' .repeat(70));
    console.log(`\n📝 كلمة المرور المستخدمة: ${password}`);
    console.log('\n💡 ملاحظة: احفظ كلمة المرور في مكان آمن\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

main();
