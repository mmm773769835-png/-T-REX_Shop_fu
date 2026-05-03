/**
 * سكريبت سريع لإنشاء bcrypt hash لكلمة مرور المدير
 * 
 * الاستخدام:
 * node create-admin-hash.js "كلمة_المرور"
 * 
 * مثال:
 * node create-admin-hash.js "Admin@123456"
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

async function createHash() {
  const password = process.argv[2];
  
  if (!password) {
    // إذا لم يتم تقديم كلمة المرور، اطلبها من المستخدم
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\n🔐 أدخل كلمة مرور المدير الجديدة: ', async (answer) => {
      if (!answer || answer.length < 8) {
        console.log('\n❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        rl.close();
        return;
      }

      await generateAndDisplayHash(answer);
      rl.close();
    });
  } else {
    // استخدام كلمة المرور من command line
    if (password.length < 8) {
      console.log('\n❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    await generateAndDisplayHash(password);
  }
}

async function generateAndDisplayHash(password) {
  try {
    const saltRounds = 10;
    
    console.log('\n⏳ جاري إنشاء الهاش...');
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n✅ تم إنشاء الهاش بنجاح!\n');
    console.log('=' .repeat(70));
    console.log('أضف هذا السطر إلى ملف server/.env:\n');
    console.log(`ADMIN_HASH=${hash}`);
    console.log('=' .repeat(70));
    console.log('\n💡 ملاحظة: احفظ كلمة المرور في مكان آمن، لن تتمكن من استرجاعها');
    console.log('   لكن يمكنك تغييرها بإنشاء هاشر جديد\n');
    
  } catch (error) {
    console.error('\n❌ حدث خطأ:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت
createHash().catch(err => {
  console.error('\n❌ خطأ غير متوقع:', err.message);
  process.exit(1);
});
