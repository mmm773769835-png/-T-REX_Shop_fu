const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://trexshopmax.com';

const articles = [
    {
        slug: 'guide-to-choosing-long-lasting-perfumes',
        title: 'دليل شامل: كيف تختار العطور الأكثر ثباتاً وفوحاناً؟ الفرق بين التركيزات والروائح',
        category: 'عطور وفخامة',
        categoryIcon: 'fa-spray-can-sparkles',
        readTime: '7 دقائق قراءة',
        date: '2026-10-20',
        author: 'خبير العطور في T-REX SHOP',
        summary: 'اكتشف الفرق الجوهري بين البارفان والتواليت، والمكونات القاعدية التي تمنح العطر ثباتاً يتجاوز 24 ساعة، وكيف تختار العطر المناسب لشخصيتك وبيئتك.',
        image: 'https://udqnrsrwzifrzseixrcj.supabase.co/storage/v1/object/public/products/1787102983138_1_IMG-20260819-WA0002.jpg.jpg',
        content: `
            <p class="lead-p">
                يعتبر اختيار العطر المناسب من أهم عناصر الأناقة والجاذبية الشخصية. فالعطر ليس مجرد رائحة زكية، بل هو بطاقة تعريف غير مرئية تترك انطباعاً لا يُنسى لدى كل من يلتقي بك. ومع تنوع العلامات التجارية وتباين الأسعار وادعاءات الثبات، يقع الكثير من المتسوقين في حيرة عند محاولة انتقاء العطر المثالي الذي يدوم طويلاً ويمنح فوحاناً مميزاً في المناخات الحارة والمعتدلة.
            </p>

            <h2>1. فهم الهرم العطري: كيف تتطور الرائحة على مدار اليوم؟</h2>
            <p>
                يتكون أي عطر متقن الصنع من تركيبة ثلاثية الأبعاد تُعرف بـ <strong>الهرم العطري (Fragrance Pyramid)</strong>، وتنقسم إلى:
            </p>
            <ul>
                <li><strong>القمة العطرية (Top Notes):</strong> هي الروائح الأولى التي تشمها فور رش العطر، وتستمر لمدة تتراوح بين 10 إلى 30 دقيقة فقط. غالباً ما تتكون من الحمضيات المنعشة (مثل البرغموت والليمون) أو النوتات المائية الخفيفة. لا تعتمد قرار شرائك على القمة فقط لأنها أسرع ما يتبخر!</li>
                <li><strong>قلب العطر (Heart/Middle Notes):</strong> تمثل شخصية العطر الحقيقية وتظهر بعد تلاشي القمة، وتدوم بين 2 إلى 4 ساعات. تشمل عادة التوابل الخفيفة (مثل القرفة والهيل)، أو الأزهار الراقية (كالياسمين والورد)، أو الفواكه الفاخرة.</li>
                <li><strong>قاعدة العطر (Base Notes):</strong> وهي الأساس المتين والسر وراء الثبات والفوحان الممتد. تدوم هذه النوتات من 8 ساعات وحتى أكثر من 24 ساعة على الملابس، وتتكون من جزيئات ثقيلة وبطيئة التبخر مثل خشب الصندل، العود، العنبر الملكي، والمسك، والباتشولي والفانيليا.</li>
            </ul>

            <h2>2. الفرق بين تركيزات العطور وتأثيرها على الثبات</h2>
            <p>
                تختلف العطور اختلافاً جذرياً بحسب نسبة الزيت العطري الخام النقي إلى الكحول في الزجاجة. إليك التصنيفات الرسمية المعتمدة عالمياً:
            </p>
            <ul>
                <li><strong>بارفان نقي (Parfum / Extrait de Parfum):</strong> يحتوي على أعلى تركيز من الزيت العطري (بين 20% إلى 40%). يتميز بثبات استثنائي يتجاوز في كثير من الأحيان 24 ساعة، ولكنه يكون أهدأ فوحاناً وأثقل حضوراً.</li>
                <li><strong>أو دو بارفان (Eau de Parfum - EDP):</strong> التركيز الأكثر شعبية وتوازناً (بين 15% إلى 20%). يمنحك ثباتاً ممتازاً يمتد من 8 إلى 12 ساعة مع فوحان ملحوظ وجذاب للغاية، وهو التركيز المثالي للمناسبات الرسمية والمسائية.</li>
                <li><strong>أو دو تواليت (Eau de Toilette - EDT):</strong> تركيز أخف (بين 5% إلى 15%)، يدوم من 3 إلى 6 ساعات، ويناسب الأجواء الصباحية، والنوادي الرياضية، والاستخدام اليومي الخفيف.</li>
                <li><strong>أو دو كولونيا (Eau de Cologne - EDC):</strong> تركيز منخفض جداً (بين 2% إلى 4%) يعطي شعوراً سريعاً بالانتعاش لمدة ساعة إلى ساعتين فقط.</li>
            </ul>

            <div class="tip-box">
                <h4><i class="fas fa-lightbulb"></i> نصيحة ذهبية لثبات العطر طوال اليوم:</h4>
                <p>رش العطر دائماً على نقاط النبض الدافئة (الرسغين، جانبي الرقبة، وخلف الأذنين) بعد ترطيب البشرة مباشرة بكريم أو مرطب غير معطر. البشرة الجافة تمتص الزيوت العطرية وتسرع تبخرها، بينما البشرة المرطبة تحبس جزيئات العطر لساعات مضاعفة!</p>
            </div>

            <h2>3. ما هي النوتات العطرية الأكثر ملاءمة للأجواء العربية واليمنية؟</h2>
            <p>
                نظراً لدفء الطقس وتنوع التضاريس في المنطقة العربية واليمن (بين حرارة الساحل واعتدال الجبال)، تحتاج إلى مراعاة الآتي:
            </p>
            <ol>
                <li><strong>للمناسبات واللقاءات الرسمية:</strong> اختر العطور الشرقية المطعمة بنوتات العنبر، العود المخفف، والجلود الفاخرة مثل روائح <em>Amber Royal</em> ومجموعات <em>Laverne</em> الفخمة التي تفرض حضورك بهيبة دون إزعاج.</li>
                <li><strong>لأوقات النهار والعمل والجامعة:</strong> اختر العطور الأروماتية الحارة الممزوجة بنفحات خشب الأرز ونجيل الهند (Vetiver) ونجيل الصندل التي تبعث على الحيوية والنشاط طوال ساعات الدوام.</li>
            </ol>

            <h2>4. خرافات شائعة في عالم العطور</h2>
            <p>
                <strong>خرافة فرك الرسغين معاً:</strong> من أشهر الأخطاء فرك معصميك بعد رش العطر؛ حيث يؤدي هذا الاحتكاك إلى توليد حرارة تكسر الروابط الكيميائية للقمة العطرية وتُشوّه تدرج النوتات! الصحيح هو الرش وتركه يجف طبيعياً.
            </p>
            <p>
                <strong>خرافة حفظ العطر في الحمام:</strong> حفظ العطور في الحمام يعرضها للرطوبة وتغير درجات الحرارة والضوء المستمر، مما يتسبب في تفكك الزيوت العطرية وتغير لونها ورائحتها. احفظ زجاجاتك دائماً في مكان مظلم وبارد كخزانة الملابس.
            </p>
        `
    },
    {
        slug: 'how-to-spot-authentic-vs-fake-watches',
        title: 'كيف تفرّق بين الساعات الأصلية والمقلدة؟ 8 علامات تكشف الساعات المقلدة فوراً',
        category: 'ساعات وإكسسوارات',
        categoryIcon: 'fa-clock',
        readTime: '6 دقائق قراءة',
        date: '2026-10-18',
        author: 'فريق الفحص الفني في T-REX SHOP',
        summary: 'دليل المستهلك الذكي لكشف الساعات المقلدة، من حركة عقرب الثواني وصوت الماكينة إلى دقة الحفر والوزن، لضمان استثمار أموالك في ساعات أصلية ومضمونة.',
        image: 'https://udqnrsrwzifrzseixrcj.supabase.co/storage/v1/object/public/products/1781656702968_1_IMG-20260616-WA0019.jpg.jpg',
        content: `
            <p class="lead-p">
                تعتبر الساعة اليدوية عنواناً للأناقة الشخصية والالتزام والدقة. ومع تطور تقنيات التصنيع، أصبحت الأسواق تعج بالساعات المقلدة (First Copy أو Replica) التي قد تبدو مطابقة للوهلة الأولى للساعات الأصلية، ولكنها تفتقر تماماً إلى الدقة، والتحمل، والمواد الفاخرة المقاومة للصدأ والتآكل. في هذا الدليل العملي، نستعرض معكم أهم العلامات الدقيقة التي تكشف الساعة الأصلية من المزيفة.
            </p>

            <h2>1. حركة عقرب الثواني وصوت الماكينة (The Ticking Sound)</h2>
            <p>
                في الساعات الأوتوماتيكية والميكانيكية السويسرية واليابانية الأصلية، يتحرك عقرب الثواني بانسيابية مذهلة (Sweeping Motion) دون قفزات ملحوظة أو اهتزازات. أما الساعات المقلدة الرخيصة، فإن عقرب الثواني يقفز ثانية بثانية مع صوت نقر عالٍ (Tick-Tock) يمكن سماعه بوضوح، مما يدل على استخدام محركات كوارتز رديئة جداً.
            </p>

            <h2>2. فحص الزجاج: الياقوت الأزرق (Sapphire Crystal) مقابل الزجاج العادي</h2>
            <p>
                تستخدم كبرى العلامات الأصلية زجاج الياقوت الصناعي المقاوم للخدوش حتى عند ملامسة المعادن أو المفاتيح. لاختبار ذلك:
            </p>
            <ul>
                <li><strong>اختبار قطرة الماء:</strong> ضع قطرة ماء صغيرة على سطح الزجاج؛ إذا بقيت القطرة متماسكة ومستديرة كحبة لؤلؤ فإن الزجاج ياقوت نقي (Sapphire). أما إذا تشتتت وسالت بشكل عشوائي، فهو زجاج معدني عادي (Mineral Glass) يُستخدم في الساعات المقلدة.</li>
                <li><strong>انعكاس الضوء:</strong> زجاج الياقوت الأصلي غالباً ما يحتوي على طلاء مضاد للانعكاس بلون أزرق أو بنفسجي خافت عند تعريضه للإضاءة بزاوية معينة.</li>
            </ul>

            <h2>3. دقة الحفر وجودة الشعارات والنصوص</h2>
            <p>
                الشركات العالمية تستخدم تقنية الحفر بالليزر عالي الدقة (Laser Engraving) على الغطاء الخلفي، التاج (Crown)، وقفل السوار. تكون الحروف حادة، متناسقة، وعميقة ومصقولة الملمس. في الساعات المقلدة، تجد الحروف مهزوزة، غير متساوية، أو مطبوعة بحبر يتلاشى مع التعرق والاستخدام المتكرر.
            </p>

            <div class="tip-box">
                <h4><i class="fas fa-balance-scale"></i> اختبار الوزن والخامات (Solid Stainless Steel):</h4>
                <p>الساعة الأصلية مصنوعة من الستانلس ستيل الخالص عيار 316L أو التيتانيوم، مما يمنحها وزناً ثقيلاً ومحسوساً في اليد يدل على متانة القطع الداخلية. الساعات المقلدة تكون مجوفة وخفيفة الوزن بشكل مريب لأنها مصنوعة من سبائك قصدير وزنك رخيصة مطلية بطبقة رقيقة تفقد بريقها بسرعة.</p>
            </div>

            <h2>4. نافذة التاريخ وتكبير العدسة (Cyclops Lens)</h2>
            <p>
                في الساعات التي تحتوي على عدسة مكبرة لتاريخ اليوم، توفر الساعة الأصلية تكبيراً حقيقياً بمقدار 2.5x يملأ النافذة بوضوح تام، بينما الساعات المقلدة تضع مجرد قطعة زجاجية مسطحة أو تكبير ضعيف جداً (1.5x) يظهر الأرقام صغيرة ومشوهة.
            </p>

            <h2>5. مقاومة الماء الحقيقية والضمان الرسمي</h2>
            <p>
                الساعة الأصلية تأتي بدرجة مقاومة ماء معتمدة (مثل 3ATM, 5ATM, أو 100M) وتخضع لاختبارات ضغط هوائي ومائي محكمة. في المقابل، قد يدخل الماء إلى الساعة المقلدة بمجرد الوضوء أو ملامسة رذاذ خفيف. احرص دائماً على الشراء من متاجر تقدم ضماناً حقيقياً وتتيح لك الفحص قبل السداد مثل <strong>متجر T-REX SHOP</strong>.
            </p>
        `
    },
    {
        slug: 'power-banks-and-battery-maintenance-guide',
        title: 'دليل بنوك الطاقة وبطاريات الطوارئ في اليمن: كيف تختار السعة المناسبة وتحافظ عليها؟',
        category: 'تكنولوجيا وطاقة',
        categoryIcon: 'fa-bolt',
        readTime: '8 دقائق قراءة',
        date: '2026-10-15',
        author: 'قسم الأجهزة الإلكترونية في T-REX SHOP',
        summary: 'شرح شامل لتقنيات الشحن السريع PD و QC، كيفية حساب السعة الفعلية لبنك الطاقة، وأهم النصائح الفنية لحماية البطاريات من التلف في ظل انقطاع الكهرباء.',
        image: 'https://udqnrsrwzifrzseixrcj.supabase.co/storage/v1/object/public/products/1780614026865_1_IMG-20260604-WA0005.jpg.jpg',
        content: `
            <p class="lead-p">
                في ظل الظروف الراهنة وانقطاع التيار الكهربائي المتكرر في اليمن، أصبح بنك الطاقة (Power Bank) ومحطات الشحن المنزلية من الضروريات الحيوية التي لا غنى عنها لأي منزل أو عمل. ومع انتشار مئات الموديلات التجارية في الأسواق، يقع الكثير من المستهلكين في فخ السعات الوهمية، أو البطاريات المقلدة التي تفقد شحنتها سريعاً وتشكل خطراً على سلامة الهواتف الذكية.
            </p>

            <h2>1. فهم السعة الاسمية مقابل السعة الفعلية لبنك الطاقة</h2>
            <p>
                من أكثر الأسئلة شيوعاً: <em>"لماذا لا يشحن بنك الطاقة بسعة 10,000 مللي أمبير هاتفي ذي البطارية 5,000 مللي أمبير مرتين كاملتين؟"</em>
            </p>
            <p>
                الجواب يكمن في الفرق بين جهد البطارية الداخلية وجهد الشحن:
            </p>
            <ul>
                <li>تعمل خلايا الليثيوم الداخلية داخل الباور بانك عند جهد كهربائي مقداره <strong>3.7 فولت</strong>.</li>
                <li>بينما يتطلب منفذ شحن الـ USB جهداً قدره <strong>5 فولت أو 9 فولت</strong> لنقل الطاقة إلى هاتفك.</li>
                <li>أثناء عملية تحويل الجهد عبر الدائرة الإلكترونية، يُفقد ما بين 15% إلى 25% من الطاقة على شكل حرارة ومقاومة كهربائية.</li>
                <li><strong>القاعدة الذهبية:</strong> السعة الفعلية القابلة للاستخدام في أي باور بانك أصلي وموثوق تمثل تقريباً <strong>65% إلى 75%</strong> من السعة المكتوبة عليه. أي أن باور بانك 10,000 مللي أمبير سيوفر لك في الواقع حوالي 7,000 مللي أمبير صافية.</li>
            </ul>

            <h2>2. تقنيات الشحن السريع: ما الفرق بين Power Delivery (PD) و Quick Charge (QC)؟</h2>
            <p>
                لا تشتري أي بنك طاقة في عام 2026 دون التأكد من دعمه لأحد البروتوكولات الحديثة التالية:
            </p>
            <ul>
                <li><strong>تقنية PD (USB Power Delivery):</strong> المعيار العالمي الأحدث عبر منفذ Type-C. تتيح شحن أجهزة آيفون، وسامسونج، وحتى الحواسيب المحمولة (Laptops) بقدرات تبدأ من 20 واط وتصل إلى 65 واط وأكثر بأمان تام وبذكاء يتوافق مع حاجة الجهاز.</li>
                <li><strong>تقنية كوالكوم السريعة (Qualcomm Quick Charge 3.0/4.0):</strong> تتيح شحن الأجهزة الداعمة لمعالجات سنابدراجون من 0% إلى 70% في غضون 35 دقيقة فقط عبر منفذ USB-A التقليدي.</li>
            </ul>

            <div class="tip-box">
                <h4><i class="fas fa-exclamation-triangle"></i> خطر الشحن الزائد والتفريغ العميق:</h4>
                <p>لا تدع بطارية بنك الطاقة تفرغ تماماً حتى 0% بشكل متكرر، ولا تتركه موصولاً بالشاحن لأيام متواصلة بعد امتلائه 100%. بطاريات الليثيوم بوليمر تعمل بأعلى كفاءة وتدوم لأكثر من 500 دورة شحن عندما تُحافظ على مستوى شحنها بين 20% و 85%.</p>
            </div>

            <h2>3. أنظمة الأمان المتعددة (Multi-Protect Safety)</h2>
            <p>
                البطاريات الأصلية والمعتمدة عالمياً تحتوي على شريحة حماية مدمجة توفر:
            </p>
            <ol>
                <li><strong>حماية من الجهد الزائد (Over-voltage Protection):</strong> لحماية الهاتف في حال وجود تذبذب في التيار الكهربائي المنزلي أو المولد.</li>
                <li><strong>حماية ضد الماس الكهربائي (Short-circuit Protection):</strong> تفصل الشاحن فورياً في حال حدوث تلامس أو تلف في الكيبل.</li>
                <li><strong>التحكم في درجات الحرارة (Thermal Management):</strong> تمنع ارتفاع حرارة الخلايا أثناء الشحن السريع لتفادي انتفاخ البطارية.</li>
            </ol>
        `
    },
    {
        slug: 'fragrance-layering-and-seasonal-perfumes',
        title: 'فن دمج العطور (Layering) واختيار العطر الأنسب لكل فصول السنة',
        category: 'عطور وفخامة',
        categoryIcon: 'fa-wand-magic-sparkles',
        readTime: '6 دقائق قراءة',
        date: '2026-10-12',
        author: 'فريق تحرير تي ريكس',
        summary: 'تعلم أسرار مزج النوتات العطرية لابتكار توقيعك العطري الخاص الفريد، وكيف توائم بين حرارة وبرودة الطقس وتركيبة العطر للحصول على أفضل أداء.',
        image: 'https://udqnrsrwzifrzseixrcj.supabase.co/storage/v1/object/public/products/1787102895830_1_IMG-20260819-WA0001.jpg.jpg',
        content: `
            <p class="lead-p">
                هل حلمت يوماً بأن تمتلك بصمة عطرية خاصة بك لا تتشابه مع أي شخص آخر؟ تقنية <strong>دمج العطور (Fragrance Layering)</strong> هي السر الذي استخدمه خبراء العطور في الشرق الأوسط لعقود طويلة قبل أن يتحول إلى صيحة عالمية تعتمدها أشهر دور الموضة الباريسية. لا يعني الدمج خلط عطرين عشوائيين معاً، بل هو فن مدروس يعتمد على توافق النوتات الجزيئية لتحقيق هارموني عطري مذهل.
            </p>

            <h2>1. القواعد الأساسية لدمج العطور باحترافية</h2>
            <ul>
                <li><strong>البدء بالعطر الأثقل:</strong> ضع دائماً العطر ذو القاعدة الأثقل والأغمق أولاً (مثل العود، خشب الصندل، العنبر، أو التوباكو والجلد)، ثم رش فوقه العطر الأخف (مثل الحمضيات، الأزهار، أو النوتات المائية المنعشة).</li>
                <li><strong>الترطيب بمرطب يحمل رائحة متوافقة:</strong> يمكنك تطبيق بودي لوشن برائحة الفانيليا الخفيفة، ثم رش عطر شرقي خشبي فوقه لإضفاء دفء ونعومة آسرة.</li>
                <li><strong>الدمج في أماكن مختلفة من الجسم:</strong> ليس بالضرورة رش العطرين في نفس النقطة تماماً؛ يمكنك رش العطر الخشبي الفواح على الملابس والياقة، بينما ترش العطر المنعش على نبض المعصمين.</li>
            </ul>

            <h2>2. اختيار العطر المناسب بحسب فصول السنة</h2>
            <p>
                درجة حرارة الجو تؤثر مباشرة على سرعة تطاير الزيوت العطرية:
            </p>
            <ul>
                <li><strong>في فصل الصيف والأيام الحارة:</strong> تؤدي درجات الحرارة المرتفعة إلى تسريع تبخر العطر وتضخيم فوحانه. لذلك، تجنب العطور الثقيلة المحشوة بالسكر أو العود الصرف لأنها قد تسبب الصداع والضيق، واستبدلها بنوتات الحمضيات، البرغموت، الشاي الأخضر، والأعشاب البحرية.</li>
                <li><strong>في فصل الشتاء والأيام الباردة:</strong> ينكمش انتشار العطر وتقل سرعة تبخره. هنا يكون الوقت المثالي لارتداء أثقل العطور وأفخمها: العنبر الدافئ، الباتشولي، القرفة، حبوب التونكا، والعود الفاخر التي تحتاج إلى البرودة لتظهر روعتها تدريجياً.</li>
            </ul>
        `
    },
    {
        slug: 'skincare-routine-and-beauty-tips',
        title: 'روتين العناية بالبشرة والجمال: خطوات عملية ومجربة لبشرة نضرة وجذابة',
        category: 'جمال وعناية',
        categoryIcon: 'fa-heart',
        readTime: '7 دقائق قراءة',
        date: '2026-10-10',
        author: 'خبيرة الجمال والعناية في T-REX SHOP',
        summary: 'دليل مبسط وفعال للعناية اليومية والأسبوعية بالبشرة، والترتيب الصحيح لتطبيق السيروم والمرطب والواقي، والتخلص من الإجهاد والهالات السوداء.',
        image: 'https://udqnrsrwzifrzseixrcj.supabase.co/storage/v1/object/public/products/1787102983138_1_IMG-20260819-WA0002.jpg.jpg',
        content: `
            <p class="lead-p">
                البشرة الصحية والمشرقة ليست وليدة الصدفة أو نتاج استخدام عشرات المستحضرات المكلفة بدون نظام، بل هي ثمرة روتين متوازن ومنتظم يُلبي الاحتياجات الأساسية للجلد: التنظيف، الترطيب، والحماية. في ظل التغيرات المناخية، الغبار، والتعرض للشمس، تحتاج بشرتك إلى برنامج عناية بسيط ومستدام يحافظ على شبابها ونضارتها.
            </p>

            <h2>الخطوات الأساسية للروتين الصباحي</h2>
            <ol>
                <li><strong>الغسول اللطيف (Cleanser):</strong> إزالة الإفرازات الدهنية وبقايا الخلايا الميتة المتراكمة أثناء النوم بغسول متوازن الحموضة لا يجرد البشرة من زيوتها الطبيعية.</li>
                <li><strong>مضادات الأكسدة (Vitamin C Serum):</strong> خط الدفاع الأول ضد التلوث وأشعة الشمس؛ يمنح البشرة إشراقة ويقلل من ظهور البقع الداكنة.</li>
                <li><strong>الترطيب (Moisturizer):</strong> حبس الرطوبة داخل طبقات الجلد باستخدام مرطب يحتوي على حمض الهيالورونيك أو السيراميد.</li>
                <li><strong>واقي الشمس (SPF 50+):</strong> الخطوة الأهم على الإطلاق التي لا يمكن التنازل عنها لحماية الجلد من الشيخوخة المبكرة والتصبغات.</li>
            </ol>

            <h2>الخطوات الأساسية للروتين المسائي</h2>
            <p>
                فترة الليل هي الوقت الذي تتجدد فيه خلايا البشرة ذاتياً. ركز على التنظيف المزدوج لإزالة المكياج والأتربة، ثم تطبيق مغذيات غنية مثل الريتينول أو النياسيناميد لدعم مرونة الجلد وترميمه.
            </p>
        `
    },
    {
        slug: 'safe-online-shopping-guide-yemen',
        title: 'دليلك الشامل للتسوق الإلكتروني الآمن في اليمن: نصائح الدفع عند الاستلام وفحص البضائع',
        category: 'نصائح تسوق',
        categoryIcon: 'fa-shield-halved',
        readTime: '6 دقائق قراءة',
        date: '2026-10-08',
        author: 'إدارة العمليات والتطوير في T-REX SHOP',
        summary: 'كيف تتسوق عبر الإنترنت في اليمن بأمان واطمئنان؟ أهمية ميزة الدفع عند الاستلام، طرق التحقق من مصداقية المتاجر، وحماية بياناتك من الاحتيال.',
        image: 'https://trexshopmax.com/logo.png',
        content: `
            <p class="lead-p">
                شهد قطاع التجارة الإلكترونية في الجمهورية اليمنية نمواً متسارعاً خلال السنوات الأخيرة، وأصبح المستهلك يعتمد بصورة متزايدة على الشراء عبر الإنترنت لتوفير الوقت والجهد والوصول إلى منتجات حصرية بأسعار تنافسية. ومع ذلك، تتطلب هذه التجربة وعياً من المتسوق لحماية أمواله وضمان استلام منتجات مطابقة للمواصفات الحقيقية.
            </p>

            <h2>1. لماذا تُعد ميزة الدفع عند الاستلام (Cash on Delivery) الخيار الأكثر أماناً؟</h2>
            <p>
                في البيئات التجارية التي تعاني من تقلبات صرف أو صعوبة استرداد التحويلات المصرفية، يوفر خيار <strong>الدفع عند الاستلام</strong> حماية بنسبة 100% للعميل. لا تدفع أي ريال إلا بعد وصول المندوب إلى باب بيتك، وفتح الصندوق الخارجي والتأكد من مطابقة السلعة لما طلبته تماماً.
            </p>

            <h2>2. فحص هوية المتجر وبيانات الاتصال الحقيقية</h2>
            <p>
                قبل إتمام طلبك من أي منصة، تحقق من:
            </p>
            <ul>
                <li>وجود موقع إلكتروني رسمي بنطاق خاص (مثل .com) وشهادة أمان مشفرة (HTTPS 🔒).</li>
                <li>وجود أرقام هواتف واضحة وقنوات تواصل مباشرة (كالواتساب والبريد الرسمي).</li>
                <li>وجود سياسات استبدال واسترجاع واضحة وشفافة تحمي المشتري.</li>
                <li>تقييمات العملاء الحقيقية وتجاربهم السابقة.</li>
            </ul>

            <div class="tip-box">
                <h4><i class="fas fa-check-double"></i> التزام T-REX SHOP الكامل:</h4>
                <p>في متجر تي ريكس، نلتزم بمبدأ المعاينة قبل الدفع، ونوفر فريق دعم مخصص يتابع شحنتك خطوة بخطوة من مستودعاتنا في صنعاء وحتى استلامك لها بكل أمان.</p>
            </div>
        `
    },
    {
        slug: 'smart-watch-buying-guide-2026',
        title: 'دليل شراء الساعات الذكية في 2026: المواصفات، دقة قياس الصحة، وعمر البطارية',
        category: 'تكنولوجيا وطاقة',
        categoryIcon: 'fa-microchip',
        readTime: '7 دقائق قراءة',
        date: '2026-10-05',
        author: 'قسم التكنولوجيا في T-REX SHOP',
        summary: 'مقارنة فنية بين شاشات AMOLED و LCD، دقة مستشعرات نبضات القلب ونسبة الأكسجين، وأهم الخصائص التي تجعل الساعة الذكية استثماراً يستحق الشراء.',
        image: 'https://udqnrsrwzifrzseixrcj.supabase.co/storage/v1/object/public/products/1780613028978_1_IMG-20260604-WA0007.jpg.jpg',
        content: `
            <p class="lead-p">
                تطورت الساعات الذكية في عام 2026 من مجرد إكسسوار لعرض التنبيهات إلى رفيق صحي ورياضي متكامل يراقب جودة نومك، مستويات التوتر، نبضات القلب، ويدعم إجراء المكالمات الهاتفية بوضوح تام. عند اختيار ساعتك الذكية القادمة، هناك معايير محددة تحدد ما إذا كانت الساعة عملية ومريحة للاستخدام اليومي أم مجرد شاشة إضافية عبء على معصمك.
            </p>

            <h2>1. نوع الشاشة ومستوى السطوع تحت أشعة الشمس</h2>
            <p>
                تعتبر شاشات <strong>AMOLED</strong> الخيار الأفضل بدون منازع؛ فهي تمنح ألواناً مشبعة ودرجات أسود حقيقية مع استهلاك منخفض للطاقة، وتتيح ميزة <em>Always-On Display (الشاشة الدائمة)</em>. تأكد من أن درجة سطوع الشاشة لا تقل عن 500 إلى 1000 شمعة (Nits) لتتمكن من قراءة الوقت والبيانات بوضوح أثناء تواجدك في الهواء الطلق وتحت شمس الظهيرة.
            </p>

            <h2>2. دقة المستشعرات الحيوية ومراقبة الصحة</h2>
            <p>
                الساعات الموثوقة تحتوي على مستشعرات ضوئية متطورة تقيس:
            </p>
            <ul>
                <li>معدل نبضات القلب المستمر على مدار 24 ساعة والتنبيه عند الارتفاع المفاجئ.</li>
                <li>نسبة تشبع الأكسجين في الدم (SpO2).</li>
                <li>تتبع مراحل النوم (العميق، الخفيف، وحركة العين السريعة REM).</li>
                <li>برامج رياضية دقيقة ومقاومة للماء لممارسة السباحة والتمارين الرياضية الشاقة.</li>
            </ul>

            <h2>3. عمر البطارية وسرعة الشحن</h2>
            <p>
                تختلف الساعات الذكية في عمر البطارية من يوم واحد (في بعض الساعات المتقدمة جداً) إلى أسبوعين كاملين في ساعات اللياقة الموفرة للطاقة. اختر الساعة التي تناسب نمط حياتك ولا تتطلب الشحن اليومي المزعج.
            </p>
        `
    },
    {
        slug: 'essential-accessories-for-men-and-women',
        title: 'أبرز الإكسسوارات الرجالية والنسائية التي تكمل أناقتك في المناسبات اليومية والرسمية',
        category: 'ساعات وإكسسوارات',
        categoryIcon: 'fa-gem',
        readTime: '5 دقائق قراءة',
        date: '2026-10-01',
        author: 'فريق الموضة والأناقة في T-REX SHOP',
        summary: 'كيف تختار الإكسسوارات التي تحدث فارقاً حقيقياً في مظهرك الخارجي؟ من الخواتم الستانلس ستيل المقاومة للتغير إلى الأساور والمحافظ الجلدية الفاخرة.',
        image: 'https://udqnrsrwzifrzseixrcj.supabase.co/storage/v1/object/public/products/1787008626724_1_IMG-20260818-WA0004.jpg.jpg',
        content: `
            <p class="lead-p">
                تُعرف الأناقة بأنها التفاصيل الصغيرة التي تتكامل معاً لتعكس شخصية واثقة ومتجددة. لا تقتصر الملابس الأنيقة وحدها على منحك المظهر المكتمل؛ بل تلعب الإكسسوارات المختارة بذكاء دور اللمسة السحرية التي تحول أي مظهر عادي إلى إطلالة استثنائية تجذب الأنظار في المناسبات الرسمية والاجتماعية.
            </p>

            <h2>1. الخواتم الستانلس ستيل المطلية (Stainless Steel Rings)</h2>
            <p>
                الخواتم المصنوعة من معدن الستانلس ستيل عالي الجودة والمطلي بالذهب أو الروديوم أصبحت الخيار الأول للرجال والنساء بفضل:
            </p>
            <ul>
                <li>ثبات اللون ومقاومة الصدأ والتعرق اليومي.</li>
                <li>مقاومة الخدوش وعدم التسبب بأي حساسية جلدية.</li>
                <li>فصوص الزركون السويسرية اللامعة التي تضاهي بريق الألماس الحقيقي بكسر بسيط من التكلفة.</li>
            </ul>

            <h2>2. تناسق ألوان المعادن والجلود</h2>
            <p>
                القاعدة الذهبية في عالم الموضة هي توحيد ألوان المعادن: إذا كانت ساعتك ذات إطار ذهبي، فاحرص على أن تكون الخواتم أو أزرار الأكمام وحزام الحقيبة بدرجات ذهبية متناسقة. وبالمثل، إذا كنت ترتدي سواراً جلدياً بنياً، نسقه مع حذاء ومحفظة جلدية من نفس الدرجة اللونية لتحقيق توازن بصري جذاب.
            </p>
        `
    }
];

// Helper to generate an article HTML page
function buildArticlePage(article) {
    const canonical = `${SITE_URL}/articles/${article.slug}`;
    const pubDateISO = new Date(article.date).toISOString();

    const relatedArticles = articles
        .filter(a => a.slug !== article.slug)
        .slice(0, 3);

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | مدونة متجر T-REX SHOP</title>
    <meta name="description" content="${article.summary}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="shortcut icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/favicon.png">

    <!-- OpenGraph & Twitter -->
    <meta property="og:type" content="article">
    <meta property="og:locale" content="ar_YE">
    <meta property="og:site_name" content="مدونة متجر T-REX SHOP">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.summary}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${article.image}">
    <meta property="article:published_time" content="${pubDateISO}">
    <meta property="article:author" content="${article.author}">
    <meta property="article:section" content="${article.category}">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Schema.org Article Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${article.title.replace(/"/g, '\\"')}",
      "description": "${article.summary.replace(/"/g, '\\"')}",
      "image": "${article.image}",
      "datePublished": "${pubDateISO}",
      "dateModified": "${pubDateISO}",
      "author": {
        "@type": "Organization",
        "name": "متجر T-REX SHOP الرسمي",
        "url": "${SITE_URL}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "T-REX SHOP",
        "logo": {
          "@type": "ImageObject",
          "url": "${SITE_URL}/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${canonical}"
      }
    }
    </script>

    <!-- Schema.org Breadcrumb -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "${SITE_URL}/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "المدونة",
          "item": "${SITE_URL}/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "${article.title.replace(/"/g, '\\"')}",
          "item": "${canonical}"
        }
      ]
    }
    </script>

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
            line-height: 1.9;
        }
        a { text-decoration: none; color: inherit; }

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

        .breadcrumbs {
            max-width: 900px;
            margin: 25px auto 10px;
            padding: 0 20px;
            font-size: 14px;
            color: var(--text-muted);
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }
        .breadcrumbs a { color: var(--primary); }

        .article-container {
            max-width: 900px;
            margin: 10px auto 60px;
            padding: 0 20px;
        }
        .article-header {
            margin-bottom: 25px;
        }
        .article-cat-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 215, 0, 0.12);
            color: var(--primary);
            border: 1px solid var(--primary);
            padding: 5px 14px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 15px;
        }
        .article-title {
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            line-height: 1.4;
            margin-bottom: 15px;
        }
        .article-meta {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 13px;
            color: var(--text-muted);
            border-bottom: 1px solid var(--card-border);
            padding-bottom: 18px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }
        .article-meta span {
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .featured-img-box {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 35px;
            max-height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .featured-img-box img {
            width: 100%;
            height: 100%;
            max-height: 420px;
            object-fit: cover;
        }
        .article-body {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 18px;
            padding: 35px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            font-size: 17px;
            color: #d8d8d8;
        }
        .lead-p {
            font-size: 19px;
            font-weight: 600;
            color: #fff;
            line-height: 1.9;
            margin-bottom: 25px;
            border-right: 4px solid var(--primary);
            padding-right: 15px;
        }
        .article-body h2 {
            font-size: 24px;
            font-weight: 800;
            color: var(--primary);
            margin: 35px 0 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .article-body h3 {
            font-size: 20px;
            color: #fff;
            margin: 25px 0 12px;
        }
        .article-body p {
            margin-bottom: 18px;
            line-height: 1.9;
        }
        .article-body ul, .article-body ol {
            padding-right: 25px;
            margin-bottom: 22px;
        }
        .article-body li {
            margin-bottom: 10px;
            line-height: 1.8;
        }
        .tip-box {
            background: rgba(255, 215, 0, 0.06);
            border: 1px dashed var(--primary);
            border-radius: 14px;
            padding: 22px;
            margin: 30px 0;
        }
        .tip-box h4 {
            color: var(--primary);
            font-size: 17px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .tip-box p {
            margin-bottom: 0;
            color: #eee;
            font-size: 15px;
        }

        /* AdSense Blocks */
        .ad-box {
            margin: 35px auto;
            padding: 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px dashed rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            text-align: center;
            min-height: 110px;
        }
        .ad-tag {
            font-size: 11px;
            color: var(--text-muted);
            margin-bottom: 8px;
            display: inline-block;
        }

        /* Related Section */
        .related-box {
            margin-top: 50px;
        }
        .related-title {
            font-size: 22px;
            color: var(--primary);
            font-weight: 800;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
        }
        .related-card {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 14px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.2s;
        }
        .related-card:hover {
            transform: translateY(-4px);
            border-color: var(--primary);
        }
        .related-card img {
            width: 100%;
            height: 140px;
            object-fit: cover;
        }
        .related-info {
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-grow: 1;
        }
        .related-info h4 {
            font-size: 15px;
            font-weight: 700;
            color: #fff;
            line-height: 1.5;
        }

        /* Footer */
        footer {
            background: #000;
            border-top: 1px solid var(--card-border);
            padding: 40px 20px 20px;
            margin-top: 60px;
            text-align: center;
            font-size: 14px;
            color: var(--text-muted);
        }
        .footer-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        .footer-links a { color: #fff; font-weight: 600; }
        .footer-links a:hover { color: var(--primary); }

        @media (max-width: 768px) {
            .nav-links { display: none; }
            .article-title { font-size: 24px; }
            .article-body { padding: 20px; font-size: 16px; }
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
                <a href="/blog" class="active">المدونة المعرفية</a>
                <a href="/about-us">من نحن</a>
                <a href="/contact-us">اتصل بنا</a>
                <a href="/privacy-policy">الخصوصية</a>
            </nav>
            <a href="/" class="btn-store-cta">
                <i class="fas fa-shopping-bag"></i>
                <span>تسوق الآن</span>
            </a>
        </div>
    </header>

    <nav class="breadcrumbs" aria-label="مسار التصفح">
        <a href="/">الرئيسية</a>
        <span>&gt;</span>
        <a href="/blog">المدونة المعرفية</a>
        <span>&gt;</span>
        <span>${article.category}</span>
    </nav>

    <main class="article-container">
        <header class="article-header">
            <span class="article-cat-badge"><i class="fas ${article.categoryIcon}"></i> ${article.category}</span>
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
                <span><i class="fas fa-user-edit"></i> ${article.author}</span>
                <span><i class="fas fa-calendar-alt"></i> ${article.date}</span>
                <span><i class="fas fa-clock"></i> ${article.readTime}</span>
            </div>
        </header>

        <div class="featured-img-box">
            <img src="${article.image}" alt="${article.title}" loading="eager">
        </div>

        <!-- AdSense Slot: Top of Article -->
        <div class="ad-box">
            <span class="ad-tag"><i class="fas fa-ad"></i> إعلان تجاري / Advertisement</span>
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

        <article class="article-body">
            ${article.content}

            <!-- In-Article CTA Banner -->
            <div style="margin: 40px 0; padding: 25px; background: linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(255,107,53,0.12) 100%); border: 1px solid var(--primary); border-radius: 14px; text-align: center;">
                <h3 style="color: var(--primary); margin-bottom: 10px; font-size: 20px;"><i class="fas fa-gem"></i> هل تبحث عن منتجات أصلية ومضمونة؟</h3>
                <p style="color: #ccc; font-size: 15px; margin-bottom: 15px;">تصفح تشكيلتنا الحصرية من العطور الفاخرة، الساعات الماركات، والأجهزة الإلكترونية مع خدمة التوصيل السريع والدفع عند الاستلام داخل اليمن.</p>
                <a href="/" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 12px 28px; border-radius: 8px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-store"></i> استكشف عروض متجر تي ريكس الآن
                </a>
            </div>

            <!-- AdSense Slot: Bottom of Article -->
            <div class="ad-box">
                <span class="ad-tag"><i class="fas fa-ad"></i> إعلان تجاري / Advertisement</span>
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
        </article>

        <!-- Related Articles -->
        <section class="related-box">
            <h3 class="related-title"><i class="fas fa-book-open"></i> مقالات أخرى قد تهمك</h3>
            <div class="related-grid">
                ${relatedArticles.map(rel => `
                    <a href="/articles/${rel.slug}" class="related-card">
                        <img src="${rel.image}" alt="${rel.title}" loading="lazy">
                        <div class="related-info">
                            <span style="font-size: 11px; color: var(--primary); font-weight: 700;"><i class="fas ${rel.categoryIcon}"></i> ${rel.category}</span>
                            <h4>${rel.title}</h4>
                            <span style="font-size: 12px; color: var(--text-muted); margin-top: auto;"><i class="fas fa-clock"></i> ${rel.readTime}</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        </section>
    </main>

    <footer>
        <div class="footer-links">
            <a href="/">الرئيسية</a>
            <a href="/blog">المدونة المعرفية</a>
            <a href="/about-us">من نحن</a>
            <a href="/contact-us">اتصل بنا</a>
            <a href="/privacy-policy">سياسة الخصوصية</a>
            <a href="/terms-of-use">شروط الاستخدام</a>
            <a href="/refund-policy">الشحن والاسترجاع</a>
        </div>
        <p style="opacity: 0.7; font-size: 13px;">جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} متجر T-REX SHOP (trexshopmax.com)</p>
    </footer>
</body>
</html>`;
}

// 2. Build blog.html (Hub Page)
function buildBlogHubPage() {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مدونة متجر تي ريكس المعرفية | مقالات حصرية في العطور والساعات والتكنولوجيا T-REX SHOP</title>
    <meta name="description" content="مركز المقالات والأدلة الإرشادية من متجر T-REX SHOP. نصائح اختيار العطور الثابتة، فحص الساعات الأصلية، العناية بالإلكترونيات، ودليل التسوق الإلكتروني الآمن.">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${SITE_URL}/blog">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="shortcut icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/favicon.png">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="ar_YE">
    <meta property="og:site_name" content="مدونة متجر T-REX SHOP">
    <meta property="og:title" content="مدونة متجر تي ريكس المعرفية | T-REX SHOP">
    <meta property="og:description" content="مقالات متخصصة وأدلة تسوق حصرية حول العطور، الساعات الأصلية، الأجهزة الإلكترونية، والجمال.">
    <meta property="og:url" content="${SITE_URL}/blog">
    <meta property="og:image" content="${SITE_URL}/logo.png">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Google AdSense Official Script -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4708671001798951" crossorigin="anonymous"></script>
    <script>
        window.adsbygoogle = window.adsbygoogle || [];
    </script>

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
        }
        body {
            font-family: 'Cairo', sans-serif;
            background: var(--darker);
            color: var(--text);
            min-height: 100vh;
            line-height: 1.8;
        }
        a { text-decoration: none; color: inherit; }

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

        .hero-banner {
            background: radial-gradient(circle at center, rgba(255, 215, 0, 0.12) 0%, rgba(10, 10, 10, 0) 70%);
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
            font-size: 38px;
            font-weight: 900;
            color: var(--primary);
            margin-bottom: 15px;
        }
        .hero-subtitle {
            color: var(--text-muted);
            max-width: 720px;
            margin: 0 auto;
            font-size: 16px;
        }

        .container {
            max-width: 1200px;
            margin: 40px auto 60px;
            padding: 0 20px;
        }

        /* AdSense Block */
        .ad-container {
            margin: 25px auto 40px;
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

        /* Articles Grid */
        .articles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 30px;
        }
        .article-card {
            background: var(--card);
            border: 1px solid var(--card-border);
            border-radius: 18px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        }
        .article-card:hover {
            transform: translateY(-6px);
            border-color: var(--primary);
            box-shadow: 0 15px 35px rgba(255, 215, 0, 0.15);
        }
        .card-img-wrapper {
            position: relative;
            width: 100%;
            height: 220px;
            background: #000;
            overflow: hidden;
        }
        .card-img-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s;
        }
        .article-card:hover .card-img-wrapper img {
            transform: scale(1.05);
        }
        .card-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid var(--primary);
            color: var(--primary);
            padding: 4px 12px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 700;
            backdrop-filter: blur(5px);
        }
        .card-content {
            padding: 25px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            flex-grow: 1;
        }
        .card-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-muted);
        }
        .card-title {
            font-size: 19px;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.5;
            transition: color 0.2s;
        }
        .article-card:hover .card-title {
            color: var(--primary);
        }
        .card-desc {
            font-size: 14px;
            color: #aaa;
            line-height: 1.7;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .card-footer {
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid var(--card-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: var(--primary);
            font-weight: 700;
            font-size: 14px;
        }

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
        .footer-links a { color: #fff; font-weight: 600; }
        .footer-links a:hover { color: var(--primary); }

        @media (max-width: 768px) {
            .nav-links { display: none; }
            .hero-title { font-size: 28px; }
            .articles-grid { grid-template-columns: 1fr; }
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
                <a href="/blog" class="active">المدونة المعرفية</a>
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

    <section class="hero-banner">
        <div class="hero-badge"><i class="fas fa-newspaper"></i> مركز المعرفة والأدلة التحريرية</div>
        <h1 class="hero-title">مدونة متجر تي ريكس | T-REX Blog</h1>
        <p class="hero-subtitle">مقالات متخصصة وأدلة شراء شاملة من إعداد خبرائنا لمساعدتك على اختيار العطور الفاخرة، الساعات الأصلية، وأحدث الأجهزة الإلكترونية بكل ثقة.</p>
    </section>

    <main class="container">
        <!-- Top AdSense Unit -->
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

        <div class="articles-grid">
            ${articles.map(art => `
                <article class="article-card">
                    <a href="/articles/${art.slug}" class="card-img-wrapper" title="${art.title}">
                        <img src="${art.image}" alt="${art.title}" loading="lazy">
                        <span class="card-badge"><i class="fas ${art.categoryIcon}"></i> ${art.category}</span>
                    </a>
                    <div class="card-content">
                        <div class="card-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${art.date}</span>
                            <span><i class="fas fa-clock"></i> ${art.readTime}</span>
                        </div>
                        <h2 class="card-title">
                            <a href="/articles/${art.slug}">${art.title}</a>
                        </h2>
                        <p class="card-desc">${art.summary}</p>
                        <div class="card-footer">
                            <a href="/articles/${art.slug}" style="display: flex; align-items: center; gap: 8px;">
                                <span>قراءة المقال كاملاً</span>
                                <i class="fas fa-arrow-left"></i>
                            </a>
                        </div>
                    </div>
                </article>
            `).join('')}
        </div>
    </main>

    <footer>
        <div class="footer-links">
            <a href="/">الرئيسية</a>
            <a href="/blog">المدونة المعرفية</a>
            <a href="/about-us">من نحن</a>
            <a href="/contact-us">اتصل بنا</a>
            <a href="/privacy-policy">سياسة الخصوصية</a>
            <a href="/terms-of-use">شروط الاستخدام</a>
            <a href="/refund-policy">الشحن والاسترجاع</a>
        </div>
        <p style="opacity: 0.7; font-size: 13px;">جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} متجر T-REX SHOP (trexshopmax.com)</p>
    </footer>
</body>
</html>`;
}

// Generate articles
for (const art of articles) {
    const filePath = path.join('articles', `${art.slug}.html`);
    fs.writeFileSync(filePath, buildArticlePage(art), 'utf8');
    console.log(`Generated: ${filePath}`);
}

// Generate blog.html
fs.writeFileSync('blog.html', buildBlogHubPage(), 'utf8');
console.log('Generated: blog.html');
