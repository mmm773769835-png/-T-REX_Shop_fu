// ==============================================================================
// T-REX SHOP - Advanced SEO & Google Indexing Generator
// Generates:
// 1. Static HTML product pages (/products/[id].html) for 100% crawlable Google indexing
// 2. Comprehensive Google Image Sitemap (/sitemap.xml)
// 3. Google Merchant Center Feed (/google-shopping-feed.xml) for Google Shopping
// ==============================================================================

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://udqnrsrwzifrzseixrcj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cNZtDBzqP3gGDMxJsvcvuA_iYOO-d4e';
const SITE_URL = 'https://trexshopmax.com';
const WHATSAPP_NUMBER = '967773769835';

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeJson(str) {
    if (!str) return '';
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

function cleanDescription(desc) {
    if (!desc) return '';
    return desc.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatPriceText(price, currency) {
    const cur = currency || 'SAR';
    if (cur === 'YER') return `${price} ر.ي`;
    if (cur === 'SAR') return `${price} ر.س`;
    if (cur === 'USD') return `$${price}`;
    return `${price} ${cur}`;
}

async function fetchProducts(retries = 5, delay = 2000) {
    console.log('Fetching products from Supabase...');
    const url = `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await globalThis.fetch(url, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_KEY
                }
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
            }
            const products = await res.json();
            console.log(`Successfully fetched ${products.length} products.`);
            return products;
        } catch (err) {
            console.warn(`Attempt ${attempt} failed (${err.message}). Retrying in ${delay}ms...`);
            if (attempt === retries) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

function getCategoryEditorialGuide(product) {
    const cat = String(product.category || '').trim();
    const name = String(product.name || '');
    const isPerfume = /عطر|لافيرن|عطور|جمال|عنبر|باكج/.test(cat + ' ' + name);
    const isCar = /سيارات|أندرويد|قير|شاشة/.test(cat + ' ' + name);
    const isElectronics = /إلكترونيات|مروحة|مكواة|بخار|طاقة|شحن|بطارية/.test(cat + ' ' + name);

    if (isPerfume) {
        return {
            title: 'دليل الاستخدام الاحترافي والحفاظ على ثبات العطر',
            tips: [
                'يُفضل رش العطر على نقاط النبض الدافئة (المعصمين والرقبة وخلف الأذنين) على بشرة مرطبة ليمتد الفوحان والثبات طوال اليوم.',
                'تجنّب فرك المعصمين معاً بعد الرش لأن الاحتكاك الحراري يكسر جزيئات القمة العطرية ويغيّر تدرج الرائحة.',
                'احفظ القنينة في خزانة مظلمة ومعتدلة الحرارة بعيداً عن أشعة الشمس المباشرة أو حرارة السيارة والرطوبة العالية.'
            ],
            articles: [
                { slug: 'guide-to-choosing-long-lasting-perfumes', label: 'دليل اختيار العطور الأكثر ثباتاً وفوحاناً' },
                { slug: 'how-to-store-perfumes-and-detect-originals', label: 'كيف تحفظ عطورك من التلف وتفحص جودة العبوة' }
            ]
        };
    }
    if (isCar) {
        return {
            title: 'دليل الفحص والتركيب الآمن لإكسسوارات السيارات',
            tips: [
                'لشاشات الأندرويد والإلكترونيات: يُنصح بالاعتماد على فيشة التوصيل المخصصة (Plug & Play) دون قص الأسلاك الأصلية للسيارة.',
                'احرص على معاينة المقاس والشكل والتوافق مع سنة صنع سيارتك قبل التركيب النهائي وتأكيد عمل جميع المنافذ.',
                'يتيح المتجر حق الفحص الأولي عند الاستلام لضمان خلو القطعة من أي خدوش أو عيوب نقل.'
            ],
            articles: [
                { slug: 'car-android-screens-and-accessories-guide', label: 'دليل اختيار شاشات الأندرويد للسيارات والمقصورة' },
                { slug: 'safe-online-shopping-guide-yemen', label: 'دليل التسوق الإلكتروني الآمن والدفع عند الاستلام في اليمن' }
            ]
        };
    }
    if (isElectronics) {
        return {
            title: 'إرشادات التشغيل الآمن وإطالة عمر الأجهزة الإلكترونية',
            tips: [
                'للأجهزة القابلة للشحن والمراوح الشمسية: اشحن الجهاز بالكامل في المرة الأولى ولا تترك البطارية فارغة حتى الصفر لفترات طويلة.',
                'في أجهزة مكواة البخار والسخانات: استخدم ماءً مفلترًا أو معبّأً قليل الأملاح وأفرغ الخزان بعد كل استخدام لمنع تكلس الفتحات.',
                'نوصي باستخدام منظم جهد أو شواحن أصلية مناسبة عند تذبذب التيار المنزلي لحماية الدوائر الداخلية.'
            ],
            articles: [
                { slug: 'power-banks-and-battery-maintenance-guide', label: 'دليل منظومات الطاقة البديلة وصيانة البطاريات' },
                { slug: 'home-appliances-steam-iron-maintenance-guide', label: 'دليل العناية بمكواة البخار والأجهزة المنزلية' }
            ]
        };
    }
    return {
        title: 'دليل اختيار وفحص الساعات والإكسسوارات قبل الارتداء',
        tips: [
            'احرص على وضع العطور ومستحضرات البشرة قبل ارتداء الساعات والإكسسوارات بدقيقتين لحماية طبقة الطلاء وبريق الزركون.',
            'في ساعات الكوارتز والستانلس ستيل: تأكد من إغلاق التاج (Crown) بإحكام وتجنب تعريض الساعة لبخار الماء الساخن.',
            'احفظ كل قطعة في علبة مبطنة منفصلة أو كيس مخملي بعد مسحها بقطعة قماش جافة ناعمة للحفاظ على لمعانها.'
        ],
        articles: [
            { slug: 'how-to-spot-authentic-vs-fake-watches', label: 'كيف تفرّق بين الساعات الأصلية والمقلدة؟ 8 علامات حاسمة' },
            { slug: 'essential-accessories-for-men-and-women', label: 'دليل الإكسسوارات والمجوهرات المطليّة التي لا يتغير لونها' }
        ]
    };
}

function generateProductHtml(product, allProducts) {
    const productId = product.id;
    const guide = getCategoryEditorialGuide(product);
    const title = `${escapeHtml(product.name)} | متجر تي ريكس T-REX SHOP`;
    const rawDesc = cleanDescription(product.description || product.name);
    const metaDesc = escapeHtml(`اشتري ${product.name} من متجر تي ريكس T-REX SHOP. السعر: ${formatPriceText(product.price, product.currency)}. تسوق اونلاين بأفضل سعر في اليمن مع خدمة التوصيل السريع.`);
    const imageUrl = product.image_url || `${SITE_URL}/logo.png`;
    const productCanonical = `${SITE_URL}/products/${productId}`;
    const shopDirectUrl = `${SITE_URL}/?product=${encodeURIComponent(productId)}`;
    const discount = (product.original_price && product.original_price > product.price) 
        ? Math.round((1 - product.price / product.original_price) * 100) 
        : 0;

    const whatsappMessage = encodeURIComponent(
        `مرحباً متجر T-REX SHOP 👋\nأريد طلب هذا المنتج:\n📌 الاسم: ${product.name}\n💰 السعر: ${formatPriceText(product.price, product.currency)}\n🔗 الرابط: ${productCanonical}`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    const ratingVal = (product.rating && Number(product.rating) > 0) ? Number(product.rating) : 5.0;
    const reviewCountVal = (product.reviews_count && Number(product.reviews_count) > 0) ? Number(product.reviews_count) : 15;

    // Schema.org Product (Google Rich Snippets & Merchant Center Compliant)
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": [ imageUrl ],
        "description": rawDesc,
        "sku": productId,
        "category": product.category || "عام",
        "brand": {
            "@type": "Brand",
            "name": "T-REX SHOP"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ratingVal,
            "reviewCount": reviewCountVal,
            "bestRating": "5",
            "worstRating": "1"
        },
        "offers": {
            "@type": "Offer",
            "url": productCanonical,
            "priceCurrency": product.currency || "SAR",
            "price": product.price,
            "priceValidUntil": "2027-12-31",
            "itemCondition": product.condition === 'used' ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "متجر T-REX SHOP الرسمي",
                "url": SITE_URL
            },
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "YE",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 7,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": product.currency || "SAR"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "YE"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "DAY"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 1,
                        "maxValue": 3,
                        "unitCode": "DAY"
                    }
                }
            }
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "الرئيسية",
                "item": SITE_URL
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": product.category || "منتجات متنوعة",
                "item": `${SITE_URL}/#products`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": productCanonical
            }
        ]
    };

    // Related products (pick up to 4 other products)
    const related = allProducts
        .filter(p => p.id !== productId)
        .slice(0, 4);

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <title>${title}</title>
    <meta name="description" content="${metaDesc}">
    <meta name="keywords" content="${escapeHtml(product.name)}, ${escapeHtml(product.category || '')}, متجر تي ريكس, تيركس شوب, تي ركس, T-REX SHOP, trex shop, trexshopmax, تسوق اليمن صنعاء">
    <link rel="canonical" href="${productCanonical}">

    <!-- Open Graph / Facebook / WhatsApp Preview -->
    <meta property="og:type" content="product">
    <meta property="og:locale" content="ar_YE">
    <meta property="og:site_name" content="متجر T-REX SHOP الرسمي">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:url" content="${productCanonical}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:alt" content="${escapeHtml(product.name)}">
    <meta property="product:price:amount" content="${product.price}">
    <meta property="product:price:currency" content="${product.currency || 'SAR'}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${metaDesc}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" type="image/png" href="/favicon.png">

    <!-- Structured Data (JSON-LD) for Google Rich Snippets -->
    <script type="application/ld+json">
    ${JSON.stringify(schemaData, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbSchema, null, 2)}
    </script>

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary: #FFD700;
            --primary-dark: #ccac00;
            --secondary: #FF6B35;
            --whatsapp: #25D366;
            --dark: #0a0a0a;
            --darker: #050505;
            --card: #151515;
            --card-border: #262626;
            --text: #ffffff;
            --text-muted: #999999;
        }
        body {
            font-family: 'Cairo', sans-serif;
            background: var(--darker);
            color: var(--text);
            min-height: 100vh;
            line-height: 1.6;
        }
        a { text-decoration: none; color: inherit; }
        
        /* Top Announcement Header */
        .top-bar {
            background: #000;
            border-bottom: 1px solid var(--card-border);
            padding: 12px 20px;
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .top-bar-inner {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
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
            object-fit: cover;
        }
        .nav-home-btn {
            background: rgba(255, 215, 0, 0.12);
            color: var(--primary);
            border: 1px solid var(--primary);
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .nav-home-btn:hover {
            background: var(--primary);
            color: #000;
        }

        /* Breadcrumbs */
        .breadcrumbs {
            max-width: 1200px;
            margin: 20px auto 10px;
            padding: 0 20px;
            font-size: 13px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }
        .breadcrumbs a { color: var(--primary); }
        .breadcrumbs span.sep { opacity: 0.5; }

        /* Main Product Layout */
        .product-wrapper {
            max-width: 1200px;
            margin: 10px auto 40px;
            padding: 0 20px;
            display: grid;
            grid-template-columns: 1fr 1.1fr;
            gap: 40px;
            align-items: start;
        }
        @media (max-width: 868px) {
            .product-wrapper {
                grid-template-columns: 1fr;
                gap: 25px;
            }
        }

        /* Image Section */
        .image-container {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 20px;
            text-align: center;
            position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .main-product-img {
            width: 100%;
            max-height: 520px;
            object-fit: contain;
            border-radius: 12px;
            display: block;
            margin: 0 auto;
        }
        .badge-list {
            position: absolute;
            top: 25px;
            right: 25px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 10;
        }
        .badge {
            padding: 6px 14px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 800;
            color: #000;
            background: var(--primary);
        }
        .badge.sale { background: #e50914; color: #fff; }
        .badge.used { background: #ff9800; color: #fff; }

        /* Info Section */
        .info-container {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
        .category-tag {
            color: var(--primary);
            font-size: 14px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        h1.product-title {
            font-size: 24px;
            font-weight: 800;
            line-height: 1.4;
            color: var(--text);
        }
        .price-box {
            display: flex;
            align-items: baseline;
            gap: 15px;
            padding: 15px;
            background: rgba(255, 215, 0, 0.05);
            border: 1px dashed var(--primary);
            border-radius: 12px;
        }
        .current-price {
            font-size: 32px;
            font-weight: 900;
            color: var(--primary);
        }
        .old-price {
            font-size: 18px;
            color: var(--text-muted);
            text-decoration: line-through;
        }
        .discount-pill {
            background: #e50914;
            color: #fff;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 800;
        }

        /* Action Buttons */
        .actions-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 10px;
        }
        .btn-whatsapp {
            background: var(--whatsapp);
            color: #fff;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 8px 25px rgba(37, 211, 102, 0.35);
            transition: all 0.2s;
        }
        .btn-whatsapp:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(37, 211, 102, 0.5);
        }
        .btn-shop {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 17px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.2s;
        }
        .btn-shop:hover {
            filter: brightness(1.1);
            transform: translateY(-2px);
        }
        
        /* Features / Trust */
        .trust-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 10px 0;
            padding: 15px 0;
            border-top: 1px solid var(--card-border);
            border-bottom: 1px solid var(--card-border);
        }
        .trust-item {
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
        }
        .trust-item i {
            display: block;
            font-size: 20px;
            color: var(--primary);
            margin-bottom: 6px;
        }

        /* Description */
        .desc-section h3 {
            font-size: 16px;
            color: var(--primary);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .desc-section p {
            color: #d1d1d1;
            font-size: 15px;
            white-space: pre-line;
            line-height: 1.8;
        }

        /* Related products */
        .related-section {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .section-header {
            font-size: 22px;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
        }
        .card-rel {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 14px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transition: transform 0.2s;
        }
        .card-rel:hover {
            transform: translateY(-4px);
            border-color: var(--primary);
        }
        .card-rel img {
            width: 100%;
            height: 180px;
            object-fit: contain;
            border-radius: 8px;
            background: #000;
        }
        .card-rel h4 {
            font-size: 14px;
            color: var(--text);
            height: 40px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .card-rel .rel-price {
            color: var(--primary);
            font-weight: 800;
            font-size: 16px;
        }

        /* Footer */
        footer {
            background: #000;
            border-top: 1px solid var(--card-border);
            padding: 40px 20px 20px;
            margin-top: 60px;
            text-align: center;
            font-size: 13px;
            color: var(--text-muted);
        }
        .footer-brand {
            font-size: 18px;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 10px;
        }
        .footer-seo {
            max-width: 800px;
            margin: 15px auto;
            font-size: 12px;
            line-height: 1.8;
            opacity: 0.7;
        }
        .spec-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            background: #101010;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #262626;
        }
        .spec-table th, .spec-table td {
            padding: 11px 14px;
            border-bottom: 1px solid #222;
            font-size: 14px;
            text-align: right;
        }
        .spec-table th {
            background: rgba(255, 215, 0, 0.08);
            color: var(--primary);
            width: 36%;
            font-weight: 700;
        }
        .buyer-guide-box {
            margin-top: 22px;
            padding: 18px 20px;
            background: rgba(255, 215, 0, 0.04);
            border: 1px solid #2a2a2a;
            border-right: 4px solid var(--primary);
            border-radius: 12px;
        }
        .buyer-guide-box h4 {
            color: var(--primary);
            font-size: 16px;
            margin-bottom: 10px;
        }
        .buyer-guide-box p, .buyer-guide-box li {
            font-size: 14px;
            color: #d0d0d0;
            line-height: 1.85;
            margin-bottom: 8px;
        }
        .buyer-guide-box ul { padding-right: 20px; }
    </style>
</head>
<body>

    <header class="top-bar">
        <div class="top-bar-inner">
            <a href="${SITE_URL}" class="brand-logo" title="متجر تي ريكس T-REX SHOP">
                <img src="/logo.png" alt="شعار متجر تي ريكس T-REX SHOP" onerror="this.src='https://trexshopmax.com/logo.png'">
                <span>متجر T-REX SHOP</span>
            </a>
            <a href="${SITE_URL}" class="nav-home-btn">
                <i class="fas fa-store"></i>
                <span>تصفح كافة المنتجات</span>
            </a>
        </div>
    </header>

    <nav class="breadcrumbs" aria-label="مسار التنقل">
        <a href="${SITE_URL}">الرئيسية</a>
        <span class="sep">&gt;</span>
        <a href="${SITE_URL}/#products">${escapeHtml(product.category || 'منتجات')}</a>
        <span class="sep">&gt;</span>
        <span>${escapeHtml(product.name)}</span>
    </nav>

    <main class="product-wrapper">
        <!-- Gallery / Image -->
        <div class="image-container">
            <div class="badge-list">
                ${discount > 0 ? `<span class="badge sale">خصم ${discount}%</span>` : ''}
                ${product.condition === 'used' ? `<span class="badge used">🏷️ مستعمل</span>` : ''}
            </div>
            <img src="${imageUrl}" 
                 alt="${escapeHtml(product.name)} - متجر تي ريكس T-REX SHOP" 
                 class="main-product-img"
                 loading="eager"
                 fetchpriority="high">
        </div>

        <!-- Details -->
        <div class="info-container">
            <div class="category-tag">
                <i class="fas fa-tag"></i> ${escapeHtml(product.category || 'عام')}
            </div>

            <h1 class="product-title">${escapeHtml(product.name)}</h1>

            <div class="price-box">
                <div class="current-price">${formatPriceText(product.price, product.currency)}</div>
                ${product.original_price && product.original_price > product.price ? `
                    <div class="old-price">${formatPriceText(product.original_price, product.currency)}</div>
                    <div class="discount-pill">وفّر ${discount}%</div>
                ` : ''}
            </div>

            <div class="actions-group">
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
                    <i class="fab fa-whatsapp" style="font-size: 24px;"></i>
                    <span>طلب فوري عبر الواتساب</span>
                </a>

                <a href="${shopDirectUrl}" class="btn-shop">
                    <i class="fas fa-shopping-cart"></i>
                    <span>فتح في المتجر التفاعلي وإتمام الشراء</span>
                </a>
            </div>

            <div class="trust-grid">
                <div class="trust-item">
                    <i class="fas fa-truck-fast"></i>
                    <span>توصيل سريع لكافة المناطق</span>
                </div>
                <div class="trust-item">
                    <i class="fas fa-shield-alt"></i>
                    <span>ضمان الجودة والمنتج الأصلي</span>
                </div>
                <div class="trust-item">
                    <i class="fas fa-headset"></i>
                    <span>خدمة عملاء على مدار الساعة</span>
                </div>
            </div>

            <div class="desc-section">
                <h3><i class="fas fa-align-right"></i> تفاصيل المنتج والمواصفات</h3>
                <p>${escapeHtml(product.description || product.name)}</p>

                <table class="spec-table">
                    <tbody>
                        <tr><th>القسم / الفئة</th><td>${escapeHtml(product.category || 'منتجات عامة')}</td></tr>
                        <tr><th>الحالة</th><td>${product.condition === 'used' ? 'مستعمل بحالة ممتازة' : 'جديد ومفحوص 100%'}</td></tr>
                        <tr><th>خيارات الدفع</th><td>الدفع عند الاستلام أو التحويل عبر المحافظ البنكية</td></tr>
                        <tr><th>الشحن داخل صنعاء</th><td>توصيل سريع خلال 2 إلى 24 ساعة مع حق المعاينة</td></tr>
                        <tr><th>الشحن للمحافظات</th><td>خلال 24 إلى 72 ساعة عبر شركات النقل المعتمدة</td></tr>
                        <tr><th>سياسة الاستبدال</th><td>ضمان استرجاع واستبدال خلال 7 أيام وفق الشروط المعتمدة</td></tr>
                        <tr><th>رمز الصنف (SKU)</th><td style="font-family: monospace; font-size: 12px;">${escapeHtml(productId)}</td></tr>
                    </tbody>
                </table>

                <div class="buyer-guide-box">
                    <h4><i class="fas fa-lightbulb"></i> ${guide.title}</h4>
                    <ul>
                        ${guide.tips.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                    <p style="margin-top: 12px; color: #fff; font-weight: 700;">أدلة شرائية مفيدة من مدونتنا:</p>
                    <ul>
                        ${guide.articles.map(a => `<li><a href="${SITE_URL}/articles/${a.slug}" style="color: var(--primary); text-decoration: underline;">${a.label}</a></li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    </main>

    ${related.length > 0 ? `
    <section class="related-section">
        <h2 class="section-header"><i class="fas fa-boxes-stacked"></i> منتجات أخرى من متجر تي ريكس</h2>
        <div class="related-grid">
            ${related.map(r => `
                <a href="${SITE_URL}/products/${r.id}" class="card-rel">
                    <img src="${r.image_url || imageUrl}" alt="${escapeHtml(r.name)}" loading="lazy">
                    <h4>${escapeHtml(r.name)}</h4>
                    <div class="rel-price">${formatPriceText(r.price, r.currency)}</div>
                </a>
            `).join('')}
        </div>
    </section>
    ` : ''}

    <footer>
        <div class="footer-brand">متجر T-REX SHOP الرسمي | متجر تي ريكس</div>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; margin: 15px 0;">
            <a href="${SITE_URL}/" style="color: var(--primary);">الرئيسية</a>
            <a href="${SITE_URL}/blog" style="color: #fff;">المدونة</a>
            <a href="${SITE_URL}/about-us" style="color: #fff;">من نحن</a>
            <a href="${SITE_URL}/contact-us" style="color: #fff;">اتصل بنا</a>
            <a href="${SITE_URL}/privacy-policy" style="color: #fff;">سياسة الخصوصية</a>
            <a href="${SITE_URL}/delete-account" style="color: #fff;">حذف الحساب</a>
            <a href="${SITE_URL}/terms-of-use" style="color: #fff;">شروط الاستخدام</a>
            <a href="${SITE_URL}/refund-policy" style="color: #fff;">الشحن والاسترجاع</a>
        </div>
        <p>تسوّق بثقة، نوصّل بسرعة | صنعاء، اليمن - هاتف: +967-773-769-835</p>
        <p class="footer-seo">
            متجر تي ريكس (T-REX SHOP) منصة التسوق الإلكتروني والأدلة الشرائية في اليمن. نوفر العطور الفاخرة، الساعات الأصلية، الأجهزة الإلكترونية، ومستلزمات العناية مع حق المعاينة قبل الدفع.
        </p>
        <p style="margin-top: 15px; opacity: 0.5;">جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} T-REX SHOP</p>
    </footer>

</body>
</html>`;
}

function generateSitemapXml(products) {
    const today = new Date().toISOString().split('T')[0];
    const articlesDir = path.join(__dirname, 'articles');
    const articleFiles = fs.existsSync(articlesDir)
        ? fs.readdirSync(articlesDir).filter(f => f.endsWith('.html')).sort()
        : [];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL}/terms-of-use</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about-us</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact-us</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/refund-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <!-- Editorial Knowledge Base Articles -->
${articleFiles.map(file => `  <url>
    <loc>${SITE_URL}/articles/${file.replace(/\.html$/, '')}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
`;

    for (const p of products) {
        const prodUrl = `${SITE_URL}/products/${p.id}`;
        const lastMod = (p.updated_at || p.created_at || today).split('T')[0];
        const imgUrl = p.image_url || `${SITE_URL}/logo.png`;
        const titleEscaped = escapeXml(p.name);
        const captionEscaped = escapeXml(`${p.name} - متجر تي ريكس T-REX SHOP`);

        xml += `  <!-- Product: ${titleEscaped} -->
  <url>
    <loc>${prodUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${titleEscaped}</image:title>
      <image:caption>${captionEscaped}</image:caption>
    </image:image>
  </url>
`;
    }

    xml += `</urlset>\n`;
    return xml;
}

function generateGoogleShoppingFeed(products) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>متجر T-REX SHOP الرسمي</title>
    <link>${SITE_URL}</link>
    <description>متجر T-REX SHOP الرسمي للتسوق الإلكتروني في اليمن - عطور، ساعات، إلكترونيات، مستلزمات</description>
`;

    for (const p of products) {
        const prodUrl = `${SITE_URL}/products/${p.id}`;
        const imgUrl = p.image_url || `${SITE_URL}/logo.png`;
        const titleEscaped = escapeXml(p.name);
        const descEscaped = escapeXml(cleanDescription(p.description || p.name));
        const condition = p.condition === 'used' ? 'used' : 'new';
        const currency = p.currency || 'SAR';
        const priceFormatted = `${p.price} ${currency}`;

        xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${titleEscaped}</g:title>
      <g:description>${descEscaped}</g:description>
      <g:link>${prodUrl}</g:link>
      <g:image_link>${imgUrl}</g:image_link>
      <g:condition>${condition}</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>T-REX SHOP</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
    </item>
`;
    }

    xml += `  </channel>
</rss>\n`;
    return xml;
}

function injectSsrIntoIndex(products) {
    const indexPath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(indexPath) || !Array.isArray(products) || products.length === 0) return;

    let html = fs.readFileSync(indexPath, 'utf-8');
    const featured = products.filter(p => p.is_featured === true || p.is_featured === 'true').slice(0, 8);
    const featuredItems = featured.length > 0 ? featured : products.slice(0, 6);

    const featuredHtml = featuredItems.map(p => `
        <div class="swiper-slide" style="cursor: pointer;">
            <a href="/products/${p.id}" style="text-decoration: none; color: inherit; display: block;">
                <img src="${p.image_url || `${SITE_URL}/logo.png`}" alt="${escapeHtml(p.name)}" loading="lazy">
                <div class="swiper-slide-content">
                    <h3 class="swiper-slide-title">${escapeHtml(p.name)}</h3>
                    <p class="swiper-slide-price">${formatPriceText(p.price, p.currency)}</p>
                </div>
            </a>
        </div>`).join('');

    const cardsHtml = products.slice(0, 24).map(p => {
        const hasDiscount = p.original_price && p.original_price > p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.price / p.original_price) * 100) : 0;
        const locationText = escapeHtml(p.address || p.country || 'اليمن 🇾🇪');
        return `
        <div class="product-card" data-product-id="${p.id}">
            ${hasDiscount ? `<span class="product-badge sale">-${discountPercent}%</span>` : ''}
            <a href="/products/${p.id}" style="text-decoration: none; color: inherit; display: block;">
                <img src="${p.image_url || `${SITE_URL}/logo.png`}" alt="${escapeHtml(p.name)}" class="product-image" loading="lazy">
            </a>
            <div class="product-info">
                <a href="/products/${p.id}" class="product-name-link" style="text-decoration: none; color: inherit; display: block;">
                    <h3 class="product-name">${escapeHtml(p.name)}</h3>
                </a>
                <p class="product-category">${escapeHtml(p.category || 'منتجات متنوعة')}</p>
                <p class="product-country-badge" style="font-size: 12px; color: #28a745; font-weight: bold; margin: 4px 0 6px 0;">
                    <i class="fas fa-map-marker-alt" style="color: #FFD700;"></i> متوفر في: ${locationText}
                </p>
                <p class="product-price">${formatPriceText(p.price, p.currency)}</p>
                <div class="card-actions">
                    <a href="/products/${p.id}" class="add-to-cart" style="text-decoration: none; text-align: center;">
                        <i class="fas fa-eye"></i> عرض التفاصيل والشراء
                    </a>
                </div>
            </div>
        </div>`;
    }).join('');

    html = html.replace(
        /<!-- SSR_FEATURED_START -->[\s\S]*?<!-- SSR_FEATURED_END -->/,
        `<!-- SSR_FEATURED_START -->${featuredHtml}\n            <!-- SSR_FEATURED_END -->`
    );
    html = html.replace(
        /<!-- SSR_PRODUCTS_START -->[\s\S]*?<!-- SSR_PRODUCTS_END -->/,
        `<!-- SSR_PRODUCTS_START -->${cardsHtml}\n        <!-- SSR_PRODUCTS_END -->`
    );
    html = html.replace(
        /<!-- SSR_COUNT_START -->[\s\S]*?<!-- SSR_COUNT_END -->/,
        `<!-- SSR_COUNT_START -->${products.length}<!-- SSR_COUNT_END -->`
    );
    html = html.replace(
        /<!-- SSR_RESULTS_START -->[\s\S]*?<!-- SSR_RESULTS_END -->/,
        `<!-- SSR_RESULTS_START -->${products.length} منتج<!-- SSR_RESULTS_END -->`
    );

    fs.writeFileSync(indexPath, html, 'utf-8');
    console.log(`Injected ${Math.min(products.length, 24)} SSR product cards into index.html.`);
}

async function main() {
    try {
        const products = await fetchProducts();

        // 1. Ensure /products directory exists
        const productsDir = path.join(__dirname, 'products');
        if (!fs.existsSync(productsDir)) {
            fs.mkdirSync(productsDir, { recursive: true });
        }

        // 2. Generate each product static HTML page
        console.log(`Generating ${products.length} static HTML product pages...`);
        for (const product of products) {
            const htmlContent = generateProductHtml(product, products);
            const filePath = path.join(productsDir, `${product.id}.html`);
            fs.writeFileSync(filePath, htmlContent, 'utf-8');
        }
        console.log(`Generated ${products.length} static pages in /products directory.`);

        // 3. Inject pre-rendered product catalog into index.html for instant Googlebot/AdSense indexing
        injectSsrIntoIndex(products);

        // 4. Generate sitemap.xml
        console.log('Generating sitemap.xml with image sitemaps...');
        const sitemapXml = generateSitemapXml(products);
        fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml, 'utf-8');
        console.log('Saved sitemap.xml');

        // 5. Generate google-shopping-feed.xml
        console.log('Generating Google Merchant Center Feed (google-shopping-feed.xml)...');
        const feedXml = generateGoogleShoppingFeed(products);
        fs.writeFileSync(path.join(__dirname, 'google-shopping-feed.xml'), feedXml, 'utf-8');
        console.log('Saved google-shopping-feed.xml');

        console.log('====================================================');
        console.log('SEO GENERATION COMPLETE SUCCESS!');
        console.log(`Total indexed products: ${products.length}`);
        console.log('Files generated:');
        console.log('- index.html (SSR pre-rendered catalog)');
        console.log('- sitemap.xml');
        console.log('- google-shopping-feed.xml');
        console.log(`- products/*.html (${products.length} files)`);
        console.log('====================================================');
    } catch (err) {
        console.error('Error during SEO generation:', err);
        process.exit(1);
    }
}

main();
