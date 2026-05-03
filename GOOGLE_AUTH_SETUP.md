# 🔐 إعداد Google Sign-In في Supabase

## الخطأ الحالي
```
Unable to exchange external code
```
هذا يعني أن Supabase لا يستطيع التحقق من Google.

## خطوات الحل

### 1️⃣ افتح Supabase Dashboard
https://app.supabase.com/project/udqnrsrwzifrzseixrcj/auth/providers

### 2️⃣ فعل Google Provider
- شغل زر **Google Enabled**

### 3️⃣ أدخل البيانات

**Client ID:**
```
37814615065-iep2r3fu72s69qmt0mtjlk265sbp7hs9.apps.googleusercontent.com
```

**Client Secret:**
```
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
```

**Redirect URL:** (موجود افتراضياً)
```
https://udqnrsrwzifrzseixrcj.supabase.co/auth/v1/callback
```

### 4️⃣ احفظ الإعدادات
اضغط **Save**

### 5️⃣ تحقق من URLs في Google Cloud Console
https://console.cloud.google.com/apis/credentials

تأكد أن **Authorized redirect URIs** يحتوي على:
```
https://udqnrsrwzifrzseixrcj.supabase.co/auth/v1/callback
```

### 6️⃣ اختبر مرة أخرى
https://trexshopmax.com

## ملاحظة مهمة
لا تقم أبداً برفع `client_secret` إلى GitHub. الملف `googleAuthConfig.js` يحتوي فقط على `client_id`، أما الـ `secret` فيبقى في Supabase Dashboard فقط.
