
const checkMobileImageSafety = async (imageUri: string): Promise<{ safe: boolean; reason?: string }> => {
  const lowerUri = imageUri.toLowerCase();
  const forbiddenKeywords = ['sex', 'porn', 'nude', 'nsfw', 'xxx', 'adult', 'erotic', 'naked', 'goddess', 'bikini', 'bra', 'lingerie', 'boobs', 'butt', 'ass', 'pussy', 'penis', 'breast', 'nipple', 'areola', 'cleavage', 'إباحي', 'جنس', 'عاري', 'مكشوف', 'سكس', 'بزاز', 'ثدي', 'مؤخرة', 'كس'];
  if (forbiddenKeywords.some(kw => lowerUri.includes(kw))) {
    return { safe: false, reason: 'اسم أو مسار الصورة يحتوي على مصطلحات خادشة للحياء أو غير ملائمة' };
  }
  return { safe: true };
};

import * as React from "react";
import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Modal, FlatList, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../shared/components/Button";
import { PRODUCT_CATEGORIES, PRODUCT_ATTRIBUTES } from "../shared/constants/productConstants";
import { LanguageContext } from '../contexts/LanguageContext';
import { getDefaultProductImage } from '../utils/imageUtils';
import { dbService, storageService } from '../services/SupabaseService';

import { useAuth } from '../contexts/AuthContext';

export default function AddProduct({ navigation, route }: any) {
  const { language } = useContext(LanguageContext);
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [vendorPrice, setVendorPrice] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<'new' | 'used'>('new');
  const categories = language === 'ar' ? PRODUCT_CATEGORIES.ar : PRODUCT_CATEGORIES.en;
  const attributes = language === 'ar' ? PRODUCT_ATTRIBUTES.ar : PRODUCT_ATTRIBUTES.en;
  const [category, setCategory] = useState(route?.params?.category || categories[0]);
  const [attribute, setAttribute] = useState(route?.params?.attribute || attributes[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]); // مصفوفة لتخزين عدة صور
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [userRole, setUserRole] = useState<string>('vendor');
  const [featuredUntil, setFeaturedUntil] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activationInput, setActivationInput] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  // Admin Code Generator state for AddProduct
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [generatingCode, setGeneratingCode] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const ADMIN_EMAILS = ['mmm773769835@gmail.com', 'trexshopmax@gmail.com'];
  const isAdminEmail = (email?: string) => !!(email && ADMIN_EMAILS.includes(email.trim().toLowerCase()));

  React.useEffect(() => {
    const loadProfile = async () => {
      const currentUserId = user?.id || user?.uid;
      const currentUserEmail = (user?.email || '').toLowerCase();

      if (currentUserId) {
        try {
          const { data } = await dbService.get('profiles', { eq: { id: currentUserId } });
          if (data && data.length > 0) {
            const r = data[0].role;
            const isAdmin = r === 'admin' || r === 'superadmin' || isAdminEmail(currentUserEmail);
            setUserRole(isAdmin ? 'admin' : (r || 'vendor'));
            setFeaturedUntil(data[0].featured_until || null);
          } else if (isAdminEmail(currentUserEmail)) {
            setUserRole('admin');
          }
        } catch (e) {
          console.log('Error loading profile:', e);
        }
      } else if (isAdminEmail(currentUserEmail)) {
        setUserRole('admin');
      }
    };
    loadProfile();
  }, [user?.id, user?.uid, user?.email]);

  const handleToggleFeatured = () => {
    if (userRole === 'admin') {
      setIsFeatured(!isFeatured);
      return;
    }

    const isActive = featuredUntil && new Date(featuredUntil) > new Date();
    if (isActive) {
      setIsFeatured(!isFeatured);
    } else {
      setShowCodeModal(true);
    }
  };

  const handleRedeemCode = async () => {
    const codeStr = activationInput.trim().toUpperCase();
    if (!codeStr) {
      Alert.alert(language === 'ar' ? 'تنبيه' : 'Warning', language === 'ar' ? 'يرجى إدخال كود التفعيل' : 'Please enter code');
      return;
    }

    setRedeeming(true);
    try {
      const { data, error } = await dbService.get('activation_codes', { eq: { code: codeStr, status: 'active' } });
      if (error || !data || data.length === 0) {
        Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'كود التفعيل غير صحيح أو تم استخدامه سابقاً' : 'Invalid or used code');
        setRedeeming(false);
        return;
      }

      const codeItem = data[0];
      const durationDays = codeItem.duration_days || 30;
      const now = new Date();

      let baseTime = now.getTime();
      if (featuredUntil && new Date(featuredUntil) > now) {
        baseTime = new Date(featuredUntil).getTime();
      }

      const expiresAt = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000).toISOString();

      // Update activation code
      await dbService.update('activation_codes', codeItem.id, {
        status: 'used',
        used_by_vendor_id: user?.id,
        activated_at: now.toISOString(),
        expires_at: expiresAt
      });

      // Update vendor profile
      if (user?.id) {
        await dbService.update('profiles', user.id, { featured_until: expiresAt });
      }

      setFeaturedUntil(expiresAt);
      setIsFeatured(true);
      setShowCodeModal(false);
      setActivationInput("");

      Alert.alert(
        language === 'ar' ? 'تم التفعيل / التجديد بنجاح! 🎉' : 'Activated / Renewed! 🎉',
        language === 'ar' ? `تم تفعيل/تجديد اشتراك المميز والبنر لـ ${durationDays} يوماً إضافية!\nينتهي بتاريخ: ${new Date(expiresAt).toLocaleDateString('ar-EG')}` : `Featured subscription renewed for ${durationDays} additional days!`
      );
    } catch (err: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', err.message || 'فشل التفعيل');
    } finally {
      setRedeeming(false);
    }
  };

  // توليد كود تفعيل جديد للمدير
  const handleAdminGenerateCode = async () => {
    const prefix = `TRX-${selectedDuration}D-`;
    const randomCode = prefix + Math.floor(100000 + Math.random() * 900000);
    setGeneratingCode(true);

    try {
      const { error } = await dbService.add('activation_codes', {
        code: randomCode,
        duration_days: selectedDuration,
        status: 'active',
      });

      if (error) {
        Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message || 'فشل توليد الكود');
      } else {
        setGeneratedCode(randomCode);
        Alert.alert(
          language === 'ar' ? 'تم توليد كود التفعيل بنجاح! 🔑' : 'Code Generated! 🔑',
          language === 'ar'
            ? `كود التفعيل: ${randomCode}\nالمدة: ${selectedDuration} يوماً\nيمكنك نسخ الكود وإرساله للتاجر.`
            : `Code: ${randomCode}\nDuration: ${selectedDuration} days`
        );
      }
    } catch (err: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', err.message || 'فشل توليد الكود');
    } finally {
      setGeneratingCode(false);
    }
  };

  // حساب نسبة فائدة المتجر والسعر النهائي بناءً على الشرائح التلقائية
  const getTieredMarkupPercent = (vPrice: number, curr = 'YER') => {
    if (vPrice <= 0) return 10;
    let yerEquiv = vPrice;
    const c = curr.toUpperCase();
    if (c === 'SAR') yerEquiv = vPrice * 140;
    else if (c === 'USD') yerEquiv = vPrice * 535;

    if (yerEquiv <= 5000) return 10;
    else if (yerEquiv <= 100000) return 5;
    else return 3;
  };

  const parsedVendorPrice = parseFloat(vendorPrice) || 0;
  const currentMarkupPct = getTieredMarkupPercent(parsedVendorPrice, 'YER');
  const finalPriceForCustomer = parseFloat((parsedVendorPrice * (1 + currentMarkupPct / 100)).toFixed(2));
  const markupAmount = parseFloat((finalPriceForCustomer - parsedVendorPrice).toFixed(2));

  const pickImage = async () => {
    try {
      // التحقق من العدد الأقصى للصور
      if (images.length >= 10) {
        Alert.alert(
          language === "ar" ? "تنبيه" : "Warning",
          language === "ar" ? "الحد الأقصى للصور هو 10 صور" : "Maximum 10 images allowed"
        );
        return;
      }

      // طلب إذن الوصول إلى المعرض
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          language === "ar" ? "خطأ" : "Error",
          language === "ar" ? "نحتاج إلى إذن للوصول إلى المعرض" : "We need permission to access the gallery"
        );
        return;
      }

      // فتح محدد الصور
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "فشل في اختيار الصورة. يرجى المحاولة مرة أخرى." : "Failed to select image. Please try again."
      );
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const uploadImage = async (uri: string) => {
    try {
      // التحقق من صحة URI
      if (!uri || typeof uri !== 'string') {
        console.warn("Invalid image URI provided");
        return getDefaultProductImage();
      }

      const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;

      // التحقق من نوع الصورة لتجنب خطأ ArrayBuffer
      const response = await fetch(uri);
      const blob = await response.blob();

      // رفع الصورة إلى Supabase Storage
      const { data, error } = await storageService.upload('product-images', filename, blob);

      if (error) {
        console.error("Error uploading image:", error);
        Alert.alert(
          language === "ar" ? "تحذير" : "Warning",
          language === "ar" ? "فشل في رفع الصورة. سيتم استخدام صورة افتراضية." : "Failed to upload image. Default image will be used."
        );
        return getDefaultProductImage();
      }

      const downloadURL = storageService.getPublicUrl('product-images', filename);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert(
        language === "ar" ? "تحذير" : "Warning",
        language === "ar" ? "فشل في رفع الصورة. سيتم استخدام صورة افتراضية." : "Failed to upload image. Default image will be used."
      );
      return getDefaultProductImage();
    }
  };

  const handleAddProduct = async () => {
    // التحقق من صحة البيانات
    if (!name.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال اسم المنتج" : "Please enter product name"
      );
      return;
    }

    // التحقق من أن اسم المنتج لا يحتوي على HTML أو scripts
    const nameRegex = /^[\u0600-\u06FFa-zA-Z0-9\s\-.,()]+$/;
    if (!nameRegex.test(name.trim())) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "اسم المنتج يحتوي على أحرف غير مسموحة" : "Product name contains invalid characters"
      );
      return;
    }

    if (name.trim().length < 3 || name.trim().length > 100) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "اسم المنتج يجب أن يكون بين 3 و 100 حرف" : "Product name must be between 3 and 100 characters"
      );
      return;
    }
    
    const fullText = (name + " " + description).toLowerCase();

    // كشف الروابط (URLs)
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|ly|me|info|store|shop|co)(?:\/[^\s]*)?)/ig;
    if (urlRegex.test(fullText)) {
      Alert.alert(
        language === "ar" ? "حظر أمني 🚫" : "Security Block 🚫",
        language === "ar" 
          ? "يُمنع منعاً باتاً نشر الروابط الخارجية في اسم المنتج أو الوصف."
          : "External links are strictly prohibited in product title or description."
      );
      return;
    }

    // كشف أرقام الهواتف المخفية أو المجزأة
    // إزالة جميع المسافات، الفواصل، الأسطر، والرموز لجمع الأرقام المتفرقة
    const cleanTextForPhone = fullText.replace(/[\s\-\.\_\,\n\r\u200B\u200C\u200D\uFEFF]/g, '');
    const obfuscatedPhoneRegex = /\d{8,}/; // أي تسلسل من 8 أرقام أو أكثر بعد إزالة الفواصل يعتبر رقم هاتف محتمل
    const standardPhoneRegex = /(\+?[0-9]{1,4}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?[\d\s-]{8,15}/g;

    if (obfuscatedPhoneRegex.test(cleanTextForPhone) || standardPhoneRegex.test(fullText)) {
      Alert.alert(
        language === "ar" ? "حظر أمني 🚫" : "Security Block 🚫",
        language === "ar" 
          ? "يُمنع كتابة أرقام الهواتف أو وسائل التواصل (حتى لو كانت مجزأة على عدة أسطر) داخل تفاصيل المنتج."
          : "Phone numbers or contact info (even obfuscated or multi-line) are strictly prohibited."
      );
      return;
    }

    if (!vendorPrice.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال سعرك الصافي" : "Please enter your net price"
      );
      return;
    }
    
    // التحقق من أن السعر رقم صحيح
    const priceNum = parseFloat(vendorPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال سعر صحيح أكبر من صفر" : "Please enter a valid price greater than zero"
      );
      return;
    }

    const markupPct = getTieredMarkupPercent(priceNum, 'YER');
    const calculatedCustomerPrice = parseFloat((priceNum * (1 + markupPct / 100)).toFixed(2));
    
    if (!description.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال وصف المنتج" : "Please enter product description"
      );
      return;
    }

    // التحقق من أن الوصف لا يحتوي على scripts
    const scriptRegex = /<script[^>]*>[\s\S]*?<\/script>/gi;
    if (scriptRegex.test(description)) {
      Alert.alert(
        language === "ar" ? "تحذير" : "Warning",
        language === "ar" ? "الوصف يحتوي على كود غير مسموح" : "Description contains disallowed code"
      );
      return;
    }

    if (description.trim().length < 10 || description.trim().length > 500) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "الوصف يجب أن يكون بين 10 و 500 حرف" : "Description must be between 10 and 500 characters"
      );
      return;
    }

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      
      // رفع جميع الصور إذا كانت موجودة بعد الفحص الأمني
      if (images.length > 0) {
        for (let idx = 0; idx < images.length; idx++) {
          const imageUri = images[idx];
          const safety = await checkMobileImageSafety(imageUri);
          if (!safety.safe) {
            Alert.alert(
              language === "ar" ? "🚨 تحذير أمني وقانوني شديد 🚨" : "🚨 Legal & Security Warning 🚨",
              language === "ar"
                ? `تم كشف وإيقاف محاولة رفع صورة غير لائقة!

⚖️ تنبيه قانوني صارم:
رفع أو محاولة رفع أي صور غير لائقة أو إباحية يمثل مخالفة صريحة وسيخضع صاحب الحساب فوراً للعقاب والملاحقة القانونية المباشرة وحظر الحساب والجهاز نهائياً!

السبب: الصورة رقم ${idx + 1} غير ملائمة.`
                : `Attempting or uploading inappropriate or explicit images is strictly prohibited and subject to immediate legal prosecution and permanent ban!`
            );
            setLoading(false);
            return;
          }
        }
        for (const imageUri of images) {
          const uploadedUrl = await uploadImage(imageUri);
          imageUrls.push(uploadedUrl);
        }
      } else {
        // إذا لم يتم اختيار صور، استخدم الصورة الافتراضية
        imageUrls = [getDefaultProductImage()];
      }

      // جلب vendor_code الخاص بالتاجر الحالي إذا وُجد
      let vendorId = user?.uid || null;
      let vendorCode = null;
      if (user?.uid) {
        const { data: profData } = await dbService.get('profiles', { eq: { id: user.uid } });
        if (profData && profData.length > 0) {
          vendorCode = profData[0].vendor_code || null;
        }
      }

      const productData = {
        name: name.trim(),
        vendor_price: priceNum,
        price: calculatedCustomerPrice, // السعر للزبون بعد إضافة 10%
        description: description.trim(),
        category,
        attribute,
        condition, // 'new' أو 'used'
        vendor_id: vendorId,
        vendor_code: vendorCode,
        paymentMethod,
        is_featured: isFeatured,
        is_active: true, // Ensure the product is active by default
        images: imageUrls,
        image_url: imageUrls[0],
        imageUrls,
        primaryImage: imageUrls[0],
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await dbService.add('products', productData);

      if (error) {
        throw error;
      }

      Alert.alert(
        language === "ar" ? "تم بنجاح! 🎉" : "Success! 🎉",
        language === "ar" 
          ? `تم حفظ المنتج بنجاح!\nسعرك الصافي: ${priceNum} د.ل\nالسعر المعروض للزبون (+10%): ${calculatedCustomerPrice} د.ل`
          : `Product added successfully!\nNet Price: ${priceNum}\nCustomer Price (+10%): ${calculatedCustomerPrice}`
      );
      // إعادة تعيين النموذج
      setName("");
      setVendorPrice("");
      setDescription("");
      setImages([]);
      // @ts-ignore
      navigation.goBack();
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" 
          ? "فشل في إضافة المنتج. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى."
          : "Failed to add product. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        {/* حالة المنتج: جديد / مستعمل */}
        <Text style={styles.label}>{language === 'ar' ? 'حالة المنتج *' : 'Product Condition *'}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: condition === 'new' ? '#28a745' : '#ccc',
              backgroundColor: condition === 'new' ? '#e8f8ec' : '#f9f9f9',
              alignItems: 'center',
            }}
            onPress={() => setCondition('new')}
          >
            <Text style={{ fontWeight: 'bold', color: condition === 'new' ? '#28a745' : '#555' }}>
              ✨ {language === 'ar' ? 'جديد (New)' : 'New'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: condition === 'used' ? '#ff9800' : '#ccc',
              backgroundColor: condition === 'used' ? '#fff3e0' : '#f9f9f9',
              alignItems: 'center',
            }}
            onPress={() => setCondition('used')}
          >
            <Text style={{ fontWeight: 'bold', color: condition === 'used' ? '#ff9800' : '#555' }}>
              🏷️ {language === 'ar' ? 'مستعمل (Used)' : 'Used'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{language === 'ar' ? 'اسم المنتج *' : 'Product Name *'}</Text>
        <TextInput
          style={styles.input}
          placeholder={language === 'ar' ? "أدخل اسم المنتج (بدون أرقام هواتف)" : "Enter product name (no phones)"}
          value={name}
          onChangeText={setName}
          maxLength={100}
        />

        <Text style={styles.label}>{language === 'ar' ? 'سعرك الصافي بالدينار (الخاص بك كتاجر) *' : 'Your Net Price *'}</Text>
        <TextInput
          style={styles.input}
          placeholder={language === 'ar' ? "أدخل سعرك الصافي (مثال: 100)" : "Enter net price"}
          value={vendorPrice}
          onChangeText={(text) => {
            if (/^\d*\.?\d*$/.test(text)) {
              setVendorPrice(text);
            }
          }}
          keyboardType="numeric"
          maxLength={10}
        />

        {/* بطاقة توضيح السعر والشرائح التلقائية والعمولة الشفافة للتاجر */}
        {parsedVendorPrice > 0 && (
          <View style={{ padding: 14, backgroundColor: '#f0f4ff', borderRadius: 10, borderWidth: 1.5, borderColor: '#3b82f6', marginBottom: 16 }}>
            <Text style={{ fontSize: 13.5, color: '#1d4ed8', fontWeight: 'bold', marginBottom: 4 }}>
              💡 {language === 'ar' ? 'شفافية التسعير ورسوم المتجر التلقائية:' : 'Pricing Transparency & Auto Store Fees:'}
            </Text>
            <Text style={{ fontSize: 13, color: '#1e3a8a' }}>
              • {language === 'ar' ? `سعرك الصافي المحفوظ (الذي تسستلمه): ${parsedVendorPrice} د.ل` : `Your Saved Net Price: ${parsedVendorPrice}`}
            </Text>
            <Text style={{ fontSize: 13, color: '#1e3a8a', marginTop: 2 }}>
              • {language === 'ar' ? `شريحة زيادة المتجر التلقائية: +${currentMarkupPct}% (+${markupAmount} د.ل)` : `Auto Store Markup: +${currentMarkupPct}%`}
            </Text>
            <Text style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 'bold', marginTop: 4 }}>
              • {language === 'ar' ? `السعر النهائي المعروض للزبون بالمتجر: ${finalPriceForCustomer} د.ل` : `Final Price for Customer: ${finalPriceForCustomer}`}
            </Text>
            <View style={{ marginTop: 8, padding: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 6 }}>
              <Text style={{ fontSize: 11.5, color: '#555', fontWeight: 'bold' }}>
                📊 {language === 'ar' ? 'شرائح زيادة المتجر التلقائية:' : 'Auto Fee Tiers:'}
              </Text>
              <Text style={{ fontSize: 11, color: '#666' }}>
                • 1 - 5,000 ر.ي (أو ما يعادلها): 10% | • 5,001 - 100,000 ر.ي: 5% | • أكثر من 100,000 ر.ي: 3%
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>{language === 'ar' ? 'الوصف *' : 'Description *'}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={language === 'ar' ? "أدخل وصف المنتج (يمنع كتابة أرقام الهواتف أو بيانات التواصل)" : "Enter description (no contact info allowed)"}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <Text style={styles.label}>{language === 'ar' ? 'القسم' : 'Category'}</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.pickerText}>{category}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>{language === 'ar' ? 'الصفة' : 'Attribute'}</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowAttributeModal(true)}
        >
          <Text style={styles.pickerText}>{attribute}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'cash' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.selectedPaymentText]}>
              {language === 'ar' ? "نقداً" : "Cash"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'card' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'card' && styles.selectedPaymentText]}>
              {language === 'ar' ? "بطاقة" : "Card"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'transfer' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('transfer')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'transfer' && styles.selectedPaymentText]}>
              {language === 'ar' ? "تحويل" : "Transfer"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{language === 'ar' ? 'تمييز المنتج ⭐' : 'Highlight Product ⭐'}</Text>
        <TouchableOpacity 
          style={[
            styles.paymentButton, 
            isFeatured ? { backgroundColor: '#FFD700', borderColor: '#FFD700' } : { backgroundColor: '#2a2a2a', borderColor: '#444' }, 
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginBottom: 16 }
          ]}
          onPress={handleToggleFeatured}
        >
          <Ionicons name={isFeatured ? "star" : "star-outline"} size={20} color={isFeatured ? "#1a1a1a" : "#FFD700"} />
          <Text style={{ color: isFeatured ? "#1a1a1a" : "#fff", fontWeight: "bold", fontSize: 14 }}>
            {isFeatured 
              ? (language === 'ar' ? 'المنتج مميز ⭐' : 'Product Featured ⭐')
              : (language === 'ar' ? 'إضافة إلى المنتجات المميزة' : 'Mark as Featured')}
          </Text>
        </TouchableOpacity>

        {/* رفع الصور */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>
            {language === "ar" ? "الصور" : "Images"} ({images.length}/10)
          </Text>
          
          {/* معرض الصور المختارة */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {images.map((imgUri, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: imgUri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* زر إضافة صورة جديدة */}
            {images.length < 10 && (
              <TouchableOpacity 
                style={[styles.imageUploadButton, styles.addImageButton]}
                onPress={pickImage}
              >
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="add" size={30} color="#666" />
                  <Text style={styles.imagePlaceholderText}>
                    {language === "ar" ? "إضافة صورة" : "Add Image"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
          
          {images.length === 0 && (
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={pickImage}
            >
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#666" />
                <Text style={styles.imagePlaceholderText}>
                  {language === "ar" ? "اضغط لاختيار صورة" : "Tap to select image"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title={loading ? (language === 'ar' ? "جاري الإضافة..." : "Adding...") : (language === 'ar' ? "إضافة المنتج" : "Add Product")} 
            onPress={handleAddProduct}
            disabled={loading}
          />
        </View>
      </View>

      {/* Modal for Category Selection */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{language === 'ar' ? "اختر القسم" : "Select Category"}</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal for Attribute Selection */}
      <Modal
        visible={showAttributeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{language === 'ar' ? "اختر الصفة" : "Select Attribute"}</Text>
              <TouchableOpacity onPress={() => setShowAttributeModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={attributes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setAttribute(item);
                    setShowAttributeModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal for Code Activation & Customer Support */}
      <Modal
        visible={showCodeModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="key" size={22} color="#FFD700" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFD700' }}>
                  {language === 'ar' ? "تفعيل خيار المميز والبنر 🔑" : "Activate Featured Option 🔑"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCodeModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 10 }}>
              {/* Admin Code Generator Box inside Modal if user is Admin */}
              {userRole === 'admin' ? (
                <View style={{ backgroundColor: '#222', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#25D366', marginBottom: 16 }}>
                  <Text style={{ color: '#25D366', fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
                    👑 {language === 'ar' ? 'حساب مسؤول المنصة (مولّد أكواد التفعيل):' : 'Platform Admin (Code Generator):'}
                  </Text>

                  {/* Duration Pills */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    {[
                      { label: '7 أيام', days: 7 },
                      { label: '30 يوماً', days: 30 },
                      { label: '60 يوماً', days: 60 },
                      { label: '90 يوماً', days: 90 },
                      { label: 'سنة', days: 365 },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.days}
                        onPress={() => setSelectedDuration(item.days)}
                        style={{
                          backgroundColor: selectedDuration === item.days ? '#FFD700' : '#333',
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: selectedDuration === item.days ? '#FFD700' : '#555',
                        }}
                      >
                        <Text style={{ color: selectedDuration === item.days ? '#000' : '#fff', fontWeight: 'bold', fontSize: 11 }}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={handleAdminGenerateCode}
                    disabled={generatingCode}
                    style={{ backgroundColor: '#28a745', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                  >
                    {generatingCode ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                        ⚡ {language === 'ar' ? `توليد كود تفعيل (${selectedDuration} يوماً)` : `Generate Code (${selectedDuration} Days)`}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {generatedCode ? (
                    <View style={{ marginTop: 10, backgroundColor: '#000', borderWidth: 1, borderColor: '#FFD700', borderRadius: 8, padding: 8, alignItems: 'center' }}>
                      <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 2 }}>
                        {language === 'ar' ? 'الكود المنشأ حديثاً:' : 'New Generated Code:'}
                      </Text>
                      <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16, fontFamily: 'monospace', letterSpacing: 1 }}>
                        {generatedCode}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setActivationInput(generatedCode);
                          Alert.alert(language === 'ar' ? 'تم تعبئة الكود' : 'Code Filled', `تم اختيار الكود: ${generatedCode}`);
                        }}
                        style={{ marginTop: 4, backgroundColor: '#FFD700', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 }}
                      >
                        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 11 }}>
                          🔑 {language === 'ar' ? 'استخدام وتعبئة الكود تلقائياً' : 'Auto Fill Code'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <Text style={{ color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 14 }}>
                {language === 'ar'
                  ? "خيار المنتجات المميزة والبنر خاص بالتجار المشتركين فقط. قم بالتواصل مع خدمة العملاء للحصول على كود التفعيل المخصص لمدّتك المختارة بعد الدفع:"
                  : "Featured products & banners are for active vendors only. Contact support to get your custom activation code:"}
              </Text>

              {/* Customer Support Info */}
              <View style={{ backgroundColor: '#262626', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 16, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  <Text style={{ color: '#fff', fontSize: 13 }}>
                    {language === 'ar' ? "واتساب خدمة العملاء والدفع:" : "WhatsApp Support:"} <Text style={{ fontWeight: 'bold', color: '#25D366' }}>+967 770 000 000</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="mail" size={18} color="#FFD700" />
                  <Text style={{ color: '#fff', fontSize: 13 }}>
                    {language === 'ar' ? "البريد الإلكتروني:" : "Email:"} <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>admin@trexshopmax.com</Text>
                  </Text>
                </View>
              </View>

              {/* Code Input */}
              <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold', marginBottom: 6 }}>
                {language === 'ar' ? "أدخل كود التفعيل المخصص (7، 30، 90، 365 يوماً):" : "Enter Activation Code:"}
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#0f0f0f',
                  color: '#fff',
                  borderWidth: 1,
                  borderColor: '#FFD700',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  textAlign: 'center',
                  marginBottom: 16,
                }}
                placeholder="TRX-30D-XXXXXX"
                placeholderTextColor="#666"
                value={activationInput}
                onChangeText={setActivationInput}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={{
                  backgroundColor: '#FFD700',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: redeeming ? 0.7 : 1,
                }}
                disabled={redeeming}
                onPress={handleRedeemCode}
              >
                {redeeming ? (
                  <ActivityIndicator color="#111" />
                ) : (
                  <Text style={{ color: '#111', fontWeight: 'bold', fontSize: 16 }}>
                    {language === 'ar' ? "تفعيل الكود الآن 🔑" : "Activate Code Now 🔑"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  paymentMethods: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  paymentButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedPaymentButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  paymentText: {
    fontSize: 14,
    color: "#666",
  },
  selectedPaymentText: {
    color: "#fff",
  },
  imageSection: {
    marginBottom: 16,
  },
  imageUploadButton: {
    alignItems: "center",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  // أنماق معرض الصور الجديدة
  imagesContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  imageItem: {
    position: 'relative',
    marginRight: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addImageButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
});