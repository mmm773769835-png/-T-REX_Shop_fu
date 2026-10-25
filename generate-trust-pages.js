const fs = require('fs');

const commonHead = (title, description, canonicalUrl) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="shortcut icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/favicon.png">

    <!-- OpenGraph & Twitter -->
    <meta property="og:type" content="website">
    <meta property="og:locale" content="ar_YE">
    <meta property="og:site_name" content="متجر T-REX SHOP الرسمي">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="https://trexshopmax.com/logo.png">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Google AdSense Official Script -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4708671001798951" crossorigin="anonymous"></script>
    <script>
        window.adsbygoogle = window.adsbygoogle || [];
    </script>

    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary: #FFD700;
            --primary-dark: #cca300;
            --secondary: #FF6B35;
            --dark: #0a0a0a;
            --darker: #050505;
            --card: #151515;
            --card-border: #262626;
            --text: #ffffff;
            --text-muted: #a0a0a0;
            --whatsapp: #25D366;
        }
        body {
            font-family: 'Cairo', sans-serif;
            background: var(--darker);
            color: var(--text);
            min-height: 100vh;
            line-height: 1.8;
            overflow-x: hidden;
        }
        a { text-decoration: none; color: inherit; }

        /* Top bar / Navigation */
        .header {
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--card-border);
            padding: 15px 0;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .header-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 20px;
            font-weight: 800;
            color: var(--primary);
        }
        .brand-logo img {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            border: 2px solid var(--primary);
            object-fit: contain;
            background: #000;
        }
        .nav-links {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .nav-links a {
            color: #d1d1d1;
            font-weight: 600;
            font-size: 15px;
            transition: color 0.2s;
        }
        .nav-links a:hover, .nav-links a.active {
            color: var(--primary);
        }
        .btn-store-cta {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000 !important;
            padding: 8px 18px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .btn-store-cta:hover {
            filter: brightness(1.15);
            transform: translateY(-2px);
        }

        /* Hero / Header Section */
        .hero-banner {
            background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, rgba(10, 10, 10, 0) 70%);
            padding: 60px 20px 40px;
            text-align: center;
            border-bottom: 1px solid var(--card-border);
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid var(--primary);
            color: var(--primary);
            padding: 6px 16px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .hero-title {
            font-size: 36px;
            font-weight: 900;
            color: var(--primary);
            margin-bottom: 15px;
        }
        .hero-subtitle {
            color: var(--text-muted);
            max-width: 700px;
            margin: 0 auto;
            font-size: 16px;
        }

        /* Container Layout */
        .container {
            max-width: 1000px;
            margin: 40px auto 60px;
            padding: 0 20px;
        }

        .content-card {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 18px;
            padding: 35px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .content-card h2 {
            font-size: 24px;
            color: var(--primary);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(255, 215, 0, 0.2);
            padding-bottom: 12px;
        }
        .content-card h3 {
            font-size: 19px;
            color: #fff;
            margin: 25px 0 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .content-card p {
            color: #d1d1d1;
            font-size: 16px;
            margin-bottom: 16px;
            line-height: 1.9;
        }
        .content-card ul, .content-card ol {
            padding-right: 25px;
            margin-bottom: 20px;
            color: #ccc;
        }
        .content-card li {
            margin-bottom: 10px;
            line-height: 1.8;
        }

        /* Grid stats / features */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-box {
            background: rgba(255, 215, 0, 0.04);
            border: 1px dashed rgba(255, 215, 0, 0.3);
            border-radius: 14px;
            padding: 20px;
            text-align: center;
        }
        .stat-box i {
            font-size: 32px;
            color: var(--primary);
            margin-bottom: 10px;
        }
        .stat-number {
            font-size: 28px;
            font-weight: 900;
            color: #fff;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            color: var(--text-muted);
        }

        /* AdSense Container */
        .ad-container {
            margin: 35px auto;
            padding: 12px;
            text-align: center;
            background: rgba(255, 255, 255, 0.02);
            border: 1px dashed rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            min-height: 100px;
        }
        .ad-label {
            font-size: 11px;
            color: var(--text-muted);
            margin-bottom: 8px;
            display: inline-block;
        }

        /* Footer */
        footer {
            background: #000;
            border-top: 1px solid var(--card-border);
            padding: 50px 20px 25px;
            margin-top: 60px;
            text-align: center;
            font-size: 14px;
            color: var(--text-muted);
        }
        .footer-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 25px;
            margin-bottom: 25px;
        }
        .footer-links a {
            color: #fff;
            font-weight: 600;
            transition: color 0.2s;
        }
        .footer-links a:hover {
            color: var(--primary);
        }
        .footer-info {
            max-width: 750px;
            margin: 0 auto 20px;
            font-size: 13px;
            line-height: 1.8;
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            .nav-links { display: none; }
            .hero-title { font-size: 28px; }
            .content-card { padding: 22px; }
            .container { padding: 0 15px; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-inner">
            <a href="/" class="brand-logo" title="متجر تي ريكس T-REX SHOP">
                <img src="/logo.png" alt="شعار متجر تي ريكس" onerror="this.src='https://trexshopmax.com/logo.png'">
                <span>متجر T-REX SHOP</span>
            </a>
            <nav class="nav-links">
                <a href="/">الرئيسية</a>
                <a href="/blog">المدونة المعرفية</a>
                <a href="/about-us">من نحن</a>
                <a href="/contact-us">اتصل بنا</a>
                <a href="/privacy-policy">الخصوصية</a>
            </nav>
            <a href="/" class="btn-store-cta">
                <i class="fas fa-shopping-bag"></i>
                <span>تصفح المتجر</span>
            </a>
        </div>
    </header>
`;

const commonFooter = `
    <!-- AdSense Display Unit -->
    <div class="container">
        <div class="ad-container">
            <span class="ad-label"><i class="fas fa-ad"></i> إعلان تجاري / Advertisement</span>
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-4708671001798951"
                 data-ad-slot="auto"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        </div>
    </div>

    <footer>
        <div class="footer-links">
            <a href="/">الرئيسية</a>
            <a href="/blog">مدونة تي ريكس</a>
            <a href="/about-us">من نحن</a>
            <a href="/contact-us">اتصل بنا</a>
            <a href="/privacy-policy">سياسة الخصوصية</a>
            <a href="/terms-of-use">شروط الاستخدام</a>
            <a href="/refund-policy">الشحن والاسترجاع</a>
        </div>
        <p class="footer-info">
            متجر تي ريكس (T-REX SHOP) المنصة الرسمية الرائدة للتسوق والتجارة الإلكترونية في الجمهورية اليمنية. نوفر العطور الأصلية الفاخرة، الساعات السويسرية والماركات العالمية، الأجهزة الإلكترونية ومعدات الطاقة، مع خدمة الدفع عند الاستلام والتوصيل السريع لكافة المناطق.
        </p>
        <p style="opacity: 0.6; font-size: 13px;">جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} T-REX SHOP (trexshopmax.com)</p>
    </footer>
</body>
</html>`;

// 1. Generate about-us.html
const aboutUsHtml = commonHead(
    "من نحن | متجر تي ريكس الرسمي للتسوق الإلكتروني T-REX SHOP",
    "تعرف على متجر تي ريكس (T-REX SHOP): المنصة الأولى الموثوقة للتسوق الإلكتروني في اليمن وصنعاء. رؤيتنا، قيمنا، معايير الجودة، وضمان المنتجات الأصلية 100%.",
    "https://trexshopmax.com/about-us"
) + `
    <section class="hero-banner">
        <div class="hero-badge"><i class="fas fa-award"></i> الشفافية والموثوقية الأولى في اليمن</div>
        <h1 class="hero-title">من نحن | متجر T-REX SHOP</h1>
        <p class="hero-subtitle">قصة انطلاقنا نحو إعادة تعريف تجربة التسوق الإلكتروني في الجمهورية اليمنية عبر تقديم أفضل المنتجات العالمية بجودة حقيقية وضمان كامل.</p>
    </section>

    <main class="container">
        <article class="content-card">
            <h2><i class="fas fa-landmark"></i> نبذة تعريفية عن متجر تي ريكس</h2>
            <p>
                انطلق <strong>متجر تي ريكس (T-REX SHOP)</strong> ليكون منصة التجارة والتسوق الإلكتروني الأولى في اليمن التي تجمع بين الفخامة، والمصداقية، وسرعة التوصيل. نسعى جاهدين لكسر الحواجز التقليدية التي واجهت المستهلك اليمني، من خلال توفير منتجات أصلية 100% مختارة بعناية فائقة تلبي أرقى معايير الجودة العالمية.
            </p>
            <p>
                نحن لسنا مجرد متجر إلكتروني عابر، بل مؤسسة تجارية واعية باحتياجات السوق المحلي في العاصمة صنعاء وبقية المحافظات اليمنية، نوفر تجربة شراء متكاملة تبدأ من التصفح السلس والشفاف للمنتجات، مروراً بالاستشارة الفورية عبر فريق خدمة العملاء المتخصص، وحتى وصول الشحنة إلى باب منزلك مع إمكانية الفحص الكامل قبل السداد عبر ميزة <strong>الدفع عند الاستلام</strong>.
            </p>

            <div class="stats-grid">
                <div class="stat-box">
                    <i class="fas fa-users"></i>
                    <div class="stat-number">+10,000</div>
                    <div class="stat-label">عميل يثقون بخدماتنا</div>
                </div>
                <div class="stat-box">
                    <i class="fas fa-certificate"></i>
                    <div class="stat-number">100%</div>
                    <div class="stat-label">منتجات أصلية ومضمونة</div>
                </div>
                <div class="stat-box">
                    <i class="fas fa-shipping-fast"></i>
                    <div class="stat-number">24 ساعة</div>
                    <div class="stat-label">توصيل سريع داخل صنعاء</div>
                </div>
                <div class="stat-box">
                    <i class="fas fa-headset"></i>
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">دعم فني واستشارات مجانية</div>
                </div>
            </div>

            <h2><i class="fas fa-compass"></i> رؤيتنا ورسالتنا</h2>
            <h3>رؤيتنا:</h3>
            <p>
                أن نكون الوجهة الرقمية المرجعية الموثوقة الأولى في اليمن لكل من يبحث عن الأناقة، التميز، والإلكترونيات الموثوقة، وأن نبني معايير تجارية تُضاهي كبرى المنصات الإقليمية والعالمية.
            </p>
            <h3>رسالتنا:</h3>
            <p>
                تسهيل وصول كل عميل يمني إلى أرقى المنتجات الحصرية (من عطور عالمية، ساعات راقية، وإلكترونيات موثوقة) بأنسب الأسعار التنافسية وبأعلى درجات الأمان والراحة.
            </p>

            <h2><i class="fas fa-shield-alt"></i> ركائز الجودة في T-REX SHOP</h2>
            <ul>
                <li><strong>الفحص والتحقق الصارم:</strong> تخضع كافة العطور والساعات والأجهزة لاختبارات جودة دقيقة قبل إدراجها وعرضها للمستهلك لضمان خلوها التام من أي عيوب مصنعية.</li>
                <li><strong>الشفافية المطلقة في الأسعار:</strong> أسعارنا مدروسة ومحدثة بالريال السعودي والريال اليمني والدولار، دون أي رسوم خفية أو مفاجآت عند الاستلام.</li>
                <li><strong>الضمان الحقيقي والاسترجاع السهل:</strong> نمنح عملاءنا حق فحص الطلب فور وصول المندوب، وسياسة استبدال واسترجاع مرنة وميسرة.</li>
                <li><strong>مركز المعرفة والمدونة التحريرية:</strong> نؤمن بأن العميل الواعي هو أفضل شركائنا؛ لذا نقدم مقالات وأدلة تسوق دورية عبر مدونتنا لمساعدتك على اتخاذ أفضل القرارات الشرائية.</li>
            </ul>

            <h2><i class="fas fa-map-marked-alt"></i> مقرنا والتواصل المباشر</h2>
            <p>
                يقع المقر الرئيسي لعمليات وإدارة متجر تي ريكس في: <strong>الجمهورية اليمنية - العاصمة صنعاء</strong>. 
                كما نوفر فريق دعم مخصص للرد الفوري على مدار الساعة عبر الواتساب والبريد الإلكتروني للرد على كافة الاستفسارات، تتبع الشحنات، وتقديم المشورة الفنية.
            </p>
        </article>
    </main>
` + commonFooter;

fs.writeFileSync('about-us.html', aboutUsHtml, 'utf8');
console.log('about-us.html created successfully.');

// 2. Generate contact-us.html
const contactUsHtml = commonHead(
    "اتصل بنا | متجر تي ريكس للتسوق الإلكتروني T-REX SHOP",
    "تواصل مع إدارة وخدمة عملاء متجر تي ريكس (T-REX SHOP). أرقام الهاتف، واتساب المبيعات والدعم الفني، البريد الإلكتروني، وعنوان المقر الرئيسي في صنعاء.",
    "https://trexshopmax.com/contact-us"
) + `
    <section class="hero-banner">
        <div class="hero-badge"><i class="fas fa-headset"></i> خدمة عملاء واستشارات متميزة</div>
        <h1 class="hero-title">تواصل معنا | نحن هنا لمساعدتك</h1>
        <p class="hero-subtitle">فريق متجر T-REX SHOP يسعد دائماً بالرد على استفساراتكم ومتابعة طلباتكم على مدار الساعة طوال أيام الأسبوع.</p>
    </section>

    <main class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 30px;">
            <div class="content-card" style="margin-bottom: 0;">
                <h2><i class="fas fa-address-book"></i> قنوات التواصل الرسمية</h2>
                <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(37, 211, 102, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--whatsapp);">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-muted);">واتساب المبيعات والاستفسارات:</div>
                            <a href="https://wa.me/967773769835" target="_blank" rel="noopener noreferrer" style="font-size: 18px; font-weight: 800; color: #fff; direction: ltr; display: inline-block;">+967 773 769 835</a>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(255, 215, 0, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--primary);">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-muted);">البريد الإلكتروني المباشر:</div>
                            <a href="mailto:trexshopmax@gmail.com" style="font-size: 17px; font-weight: 700; color: var(--primary);">trexshopmax@gmail.com</a>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(255, 107, 53, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--secondary);">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-muted);">الموقع والمقر الرئيسي:</div>
                            <div style="font-size: 16px; font-weight: 700; color: #fff;">الجمهورية اليمنية، صنعاء</div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--text-muted);">ساعات العمل واستقبال الطلبات:</div>
                            <div style="font-size: 15px; font-weight: 600; color: #fff;">يومياً من 9:00 صباحاً حتى 11:30 مساءً</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Interactive Contact Form -->
            <div class="content-card" style="margin-bottom: 0;">
                <h2><i class="fas fa-paper-plane"></i> أرسل رسالة سريعة</h2>
                <form id="contactForm" onsubmit="event.preventDefault(); submitContact();" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">الاسم الكريم *</label>
                        <input type="text" id="cName" required placeholder="أدخل اسمك الكامل" style="width: 100%; padding: 12px 14px; background: #0a0a0a; border: 1px solid var(--card-border); border-radius: 8px; color: #fff; font-family: inherit;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">رقم الهاتف أو الواتساب *</label>
                        <input type="tel" id="cPhone" required placeholder="مثال: 773769835" style="width: 100%; padding: 12px 14px; background: #0a0a0a; border: 1px solid var(--card-border); border-radius: 8px; color: #fff; font-family: inherit;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">موضوع الرسالة *</label>
                        <select id="cSubject" style="width: 100%; padding: 12px 14px; background: #0a0a0a; border: 1px solid var(--card-border); border-radius: 8px; color: #fff; font-family: inherit;">
                            <option value="استفسار عن منتج">استفسار عن منتج أو سعر</option>
                            <option value="متابعة طلب سابق">متابعة شحنة أو طلب سابق</option>
                            <option value="اقتراح أو شكوى">تقديم اقتراح أو شكوى</option>
                            <option value="استفسار شراكة أو إعلان">استفسار تجاري / شراكة</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">تفاصيل الرسالة *</label>
                        <textarea id="cMessage" rows="4" required placeholder="اكتب استفسارك بالتفصيل وسنقوم بالرد عليك في غضون دقائق..." style="width: 100%; padding: 12px 14px; background: #0a0a0a; border: 1px solid var(--card-border); border-radius: 8px; color: #fff; font-family: inherit; resize: vertical;"></textarea>
                    </div>
                    <button type="submit" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 14px; border: none; border-radius: 8px; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 5px;">
                        <i class="fas fa-paper-plane"></i> إرسال عبر الواتساب المباشر
                    </button>
                    <div id="contactSuccess" style="display: none; padding: 10px; background: rgba(37, 211, 102, 0.2); border: 1px solid var(--whatsapp); color: #fff; border-radius: 8px; text-align: center; font-size: 14px;">
                        جارٍ تحويل رسالتك إلى الدعم الفني...
                    </div>
                </form>
            </div>
        </div>
    </main>

    <script>
        function submitContact() {
            var name = document.getElementById('cName').value.trim();
            var phone = document.getElementById('cPhone').value.trim();
            var subject = document.getElementById('cSubject').value;
            var msg = document.getElementById('cMessage').value.trim();

            if (!name || !phone || !msg) return;

            var fullText = "مرحباً إدارة متجر T-REX SHOP 👋\\n" +
                           "📩 رسالة جديدة من نموذج الموقع:\\n" +
                           "👤 الاسم: " + name + "\\n" +
                           "📱 الهاتف: " + phone + "\\n" +
                           "📌 الموضوع: " + subject + "\\n" +
                           "📝 الرسالة: " + msg;

            var waUrl = "https://wa.me/967773769835?text=" + encodeURIComponent(fullText);
            document.getElementById('contactSuccess').style.display = 'block';
            setTimeout(function() {
                window.open(waUrl, '_blank');
            }, 600);
        }
    </script>
` + commonFooter;

fs.writeFileSync('contact-us.html', contactUsHtml, 'utf8');
console.log('contact-us.html created successfully.');

// 3. Generate refund-policy.html
const refundHtml = commonHead(
    "سياسة الشحن والاسترجاع والضمان | متجر T-REX SHOP",
    "تعرف على سياسة التوصيل والشحن السريع في اليمن، وضمان المنتجات، وشروط الاستبدال والاسترجاع الميسرة في متجر تي ريكس T-REX SHOP.",
    "https://trexshopmax.com/refund-policy"
) + `
    <section class="hero-banner">
        <div class="hero-badge"><i class="fas fa-truck-fast"></i> تسوق براحة واطمئنان تام</div>
        <h1 class="hero-title">سياسة الشحن والاسترجاع والضمان</h1>
        <p class="hero-subtitle">نضع راحة العميل وثقته على رأس أولوياتنا، ولهذا نوفر ضماناً حقيقياً وتوصيلاً سريعاً مع حق الفحص قبل الدفع.</p>
    </section>

    <main class="container">
        <article class="content-card">
            <h2><i class="fas fa-shield-check"></i> ضمان متجر T-REX SHOP</h2>
            <p>
                جميع المنتجات المعروضة في متجر تي ريكس (من عطور وساعات وأجهزة إلكترونية) تخضع لضمان أصالة وجودة 100%. نحرص على استيراد المنتجات من مصادرها المعتمدة ونوفر لعملائنا حق المعاينة المباشرة قبل دفع أي مبلغ مالي لمندوب التوصيل.
            </p>

            <h2><i class="fas fa-shipping-fast"></i> مواعيد ورسوم الشحن والتوصيل</h2>
            <ul>
                <li><strong>التوصيل داخل العاصمة صنعاء:</strong> يتم التوصيل خلال مدة قياسية تتراوح بين 2 إلى 24 ساعة فقط من وقت تأكيد الطلب.</li>
                <li><strong>الشحن إلى بقية المحافظات اليمنية:</strong> يتم الشحن عبر شبكات وشركات النقل الموثوقة والسريعة، وتصل الشحنة عادة خلال 24 إلى 72 ساعة كحد أقصى.</li>
                <li><strong>خدمة الدفع عند الاستلام (COD):</strong> متوفرة لجميع عملائنا لضمان الثقة التامة. يمكنك استلام الطلب، فتحه والتأكد من مطابقته قبل الدفع.</li>
            </ul>

            <h2><i class="fas fa-undo-alt"></i> شروط الاستبدال والاسترجاع (7 أيام)</h2>
            <p>نحرص على تسهيل إجراءات الاسترجاع والاستبدال وفق الشروط العادلة التالية:</p>
            <ol>
                <li>يحق للعميل طلب استبدال أو إرجاع المنتج خلال مدة <strong>7 أيام</strong> من تاريخ الاستلام في حال وجود أي عيب مصنعي أو اختلاف عن المواصفات المعروضة.</li>
                <li>يجب أن يكون المنتج في حالته الأصلية، بعبوته وتغليفه الأصلي غير تالف وبكامل ملحقاته.</li>
                <li>بالنسبة للعطور: يُرجى التأكد من عدم استخدام العبوة بشكل يضر بحالتها الأصلية إلا في حال ثبوت تلف البخاخ أو العبوة أثناء الشحن.</li>
                <li>في حال كان سبب الإرجاع عيباً مصنعياً، يتحمل المتجر كافة تكاليف إعادة الشحن أو الاستبدال مجاناً.</li>
            </ol>

            <h2><i class="fas fa-question-circle"></i> كيف تقدم طلب استرجاع أو استبدال؟</h2>
            <p>
                الأمر في غاية البساطة: تواصل مع فريق خدمة العملاء عبر الواتساب على الرقم 
                <a href="https://wa.me/967773769835" style="color: var(--primary); font-weight: 700;">+967 773 769 835</a> 
                أو راسلنا على البريد الإلكتروني 
                <a href="mailto:trexshopmax@gmail.com" style="color: var(--primary); font-weight: 700;">trexshopmax@gmail.com</a> 
                مع ذكر رقم الطلب أو صورة المنتج وسنقوم بحل المشكلة فوراً.
            </p>
        </article>
    </main>
` + commonFooter;

fs.writeFileSync('refund-policy.html', refundHtml, 'utf8');
console.log('refund-policy.html created successfully.');
