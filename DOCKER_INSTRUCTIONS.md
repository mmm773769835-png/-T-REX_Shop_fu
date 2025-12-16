# تشغيل مشروع T-REX Shop باستخدام Docker

## المتطلبات الأساسية
1. تثبيت Docker على جهازك من [https://docker.com/get-started/](https://docker.com/get-started/)

## خطوات التشغيل

### الطريقة 1: استخدام Docker مباشرة

1. بناء صورة Docker:
   ```bash
   docker build -t trex-shop-app .
   ```

2. تشغيل الحاوية:
   ```bash
   docker run -it --rm -p 8081:8081 trex-shop-app
   ```

### الطريقة 2: استخدام Docker Compose (مُوصى بها)

1. تشغيل المشروع:
   ```bash
   docker-compose up
   ```

2. إيقاف المشروع:
   ```bash
   docker-compose down
   ```

## الوصول إلى التطبيق
بعد تشغيل الحاوية، يمكنك الوصول إلى التطبيق من خلال المتصفح على العنوان:
[http://localhost:8081](http://localhost:8081)

## ملاحظات مهمة
- يتم تحميل ملفات المشروع تلقائيًا إلى الحاوية
- أي تغييرات تحدث على الملفات المحلية سيتم تحديثها تلقائيًا في الحاوية
- يتم تشغيل تطبيق Expo في وضع التطوير