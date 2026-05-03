import * as React from "react";
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Modal, FlatList, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
// استخدام MediaType بدلاً من MediaTypeOptions (deprecated)
import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import Button from "../shared/components/Button";
import { PRODUCT_CATEGORIES, PRODUCT_ATTRIBUTES } from "../shared/constants/productConstants";
import { getDefaultProductImage, sanitizeImageUrl } from "../utils/imageUtils";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useCurrency, CURRENCY_RATES } from '../contexts/CurrencyContext';
import { dbService, storageService } from '../services/SupabaseService';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  attribute: string;
  paymentMethod: string;
  currency?: string;
  discount?: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  createdAt?: string;
}

export default function AdminScreen({ navigation }: any) {
  const { isDarkMode, colors } = React.useContext(ThemeContext);
  const { language } = React.useContext(LanguageContext);
  const { formatPrice } = useCurrency();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const categories = language === 'ar' ? PRODUCT_CATEGORIES.ar : PRODUCT_CATEGORIES.en;
  const attributes = language === 'ar' ? PRODUCT_ATTRIBUTES.ar : PRODUCT_ATTRIBUTES.en;
  const [category, setCategory] = useState(categories[0]);
  const [attribute, setAttribute] = useState(attributes[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [currency, setCurrency] = useState("YER");
  const [discount, setDiscount] = useState(0);
  const [originalPrice, setOriginalPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const pickImage = async () => {
    try {
      // طلب إذن الوصول إلى المعرض
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى المعرض");
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
        setImage(result.assets[0].uri);
        // إضافة الصورة إلى مصفوفة الصور المتعددة
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("خطأ", "فشل في اختيار الصورة. يرجى المحاولة مرة أخرى.");
    }
  };

  const pickMultipleImages = async () => {
    try {
      // طلب إذن الوصول إلى المعرض
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى المعرض");
        return;
      }

      // فتح محدد الصور مع دعم اختيار متعدد
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages]);
        // تعيين الصورة الأولى كصورة رئيسية
        if (!image && newImages.length > 0) {
          setImage(newImages[0]);
        }
      }
    } catch (error) {
      console.error("Error picking multiple images:", error);
      Alert.alert("خطأ", "فشل في اختيار الصور. يرجى المحاولة مرة أخرى.");
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // إذا تم حذف الصورة الرئيسية، تعيين صورة أخرى
    if (image === images[index] && images.length > 1) {
      setImage(images[index + 1] || images[0]);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      // التحقق من صحة URI
      if (!uri || typeof uri !== 'string') {
        console.warn("⚠️ Invalid image URI provided");
        return getDefaultProductImage();
      }

      console.log("📤 بدء رفع الصورة...");
      
      // 1. حفظ الصورة محليًا أولاً
      let localImagePath = uri;
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000);
      
      try {
        // استخدام documentDirectory من FileSystem (مع type assertion)
        const docDir = (FileSystem as any).documentDirectory;
        if (docDir) {
          const localDir = `${docDir}products/`;
          const dirInfo = await FileSystem.getInfoAsync(localDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });
            console.log("✅ تم إنشاء مجلد المنتجات المحلي");
          }
          
          // نسخ الصورة إلى المجلد المحلي
          const localFilename = `product_${timestamp}_${randomId}.jpg`;
          const localPath = `${localDir}${localFilename}`;
          await FileSystem.copyAsync({
            from: uri,
            to: localPath,
          });
          localImagePath = localPath;
          console.log(`✅ تم حفظ الصورة محليًا: ${localPath}`);
        }
      } catch (localError: any) {
        console.warn("⚠️ فشل في حفظ الصورة محليًا:", localError?.message || localError);
        // نستمر حتى لو فشل الحفظ المحلي
      }

      // 2. تحويل الصورة إلى base64 للاستخدام في الرفع
      let base64: string;
      
      try {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          // للصور من الإنترنت، نحتاج لتحويلها إلى base64 أولاً
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // تحويل Uint8Array إلى base64
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          base64 = btoa(binary);
        } else {
          // للصور المحلية، استخدم FileSystem مباشرة (legacy API)
          base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        
        if (!base64 || base64.length === 0) {
          throw new Error("Empty base64 data");
        }
      } catch (base64Error: any) {
        console.error("❌ خطأ في تحويل الصورة إلى base64:", base64Error);
        return getDefaultProductImage();
      }

      // 3. رفع الصورة إلى السيرفر المحلي و Firebase في نفس الوقت (Parallel)
      const LOCAL_SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:4001';
      let localServerUrl = getDefaultProductImage();
      let firebaseUrl = getDefaultProductImage();
      const adminToken = await SecureStore.getItemAsync('adminToken');
      
      const uploadPromises = [
        // رفع إلى السيرفر المحلي
        (async () => {
          try {
            console.log(`📤 رفع الصورة إلى السيرفر المحلي: ${LOCAL_SERVER_URL}`);
            const base64DataUrl = `data:image/jpeg;base64,${base64}`;
            const response = await fetch(`${LOCAL_SERVER_URL}/api/upload/image-base64`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
              },
              body: JSON.stringify({
                imageData: base64DataUrl,
                filename: `product_${timestamp}_${randomId}.jpg`
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
            }
            
            const result = await response.json();
            if (result.success && result.url) {
              localServerUrl = result.url;
              console.log(`✅ تم رفع الصورة بنجاح إلى السيرفر المحلي: ${localServerUrl}`);
            } else {
              throw new Error(result.message || 'Upload failed');
            }
          } catch (localServerError: any) {
            console.error("❌ خطأ في رفع الصورة إلى السيرفر المحلي:", localServerError);
            // نستمر حتى لو فشل رفع السيرفر المحلي
          }
        })(),
        
        // رفع إلى Supabase Storage
        (async () => {
          try {
            const filename = `products/${timestamp}_${randomId}.jpg`;

            // التحقق من نوع الصورة لتجنب خطأ ArrayBuffer
            const base64DataUrl = `data:image/jpeg;base64,${base64}`;
            const response = await fetch(base64DataUrl);
            const blob = await response.blob();

            // رفع الصورة إلى Supabase Storage
            const { data, error } = await storageService.upload('product-images', filename, blob);

            if (error) {
              console.error("❌ خطأ في رفع الصورة إلى Supabase Storage:", error);
              return;
            }

            firebaseUrl = storageService.getPublicUrl('product-images', filename);
            console.log(`📤 رفع الصورة إلى Supabase Storage: ${filename} (الحجم: ${base64.length} حرف base64)`);
            console.log(`✅ تم رفع الصورة بنجاح إلى Supabase: ${firebaseUrl}`);
          } catch (supabaseError: any) {
            console.error("❌ خطأ في رفع الصورة إلى Supabase Storage:", supabaseError);
            const errorCode = supabaseError?.code || 'unknown';
            const errorMessage = supabaseError?.message || 'Unknown error';
            console.error(`كود الخطأ: ${errorCode}, الرسالة: ${errorMessage}`);
            // نستمر حتى لو فشل رفع Supabase
          }
        })()
      ];
      
      // انتظار اكتمال كلا الرفعين في نفس الوقت
      await Promise.all(uploadPromises);
      
      // تحديد الصورة التي سنستخدمها (الأولوية للسيرفر المحلي، ثم Firebase، ثم المحلي على الجهاز)
      let finalImageUrl = getDefaultProductImage();
      
      if (localServerUrl && localServerUrl !== getDefaultProductImage()) {
        finalImageUrl = localServerUrl;
        console.log("✅ استخدام صورة السيرفر المحلي");
      } else if (firebaseUrl && firebaseUrl !== getDefaultProductImage()) {
        finalImageUrl = firebaseUrl;
        console.log("✅ استخدام صورة Firebase");
      } else if (localImagePath && localImagePath !== uri && (localImagePath.startsWith('file://') || localImagePath.startsWith('content://'))) {
        finalImageUrl = localImagePath;
        console.log("✅ استخدام الصورة المحلية على الجهاز");
      } else {
        console.log("📱 استخدام الصورة الافتراضية");
      }

      return finalImageUrl;
    } catch (error: any) {
      console.error("❌ خطأ عام في رفع الصورة:", error);
      const errorMessage = error?.message || "Unknown error";
      console.error("تفاصيل الخطأ:", errorMessage);
      
      Alert.alert(
        language === "ar" ? "تحذير" : "Warning",
        language === "ar" 
          ? `فشل في رفع الصورة: ${errorMessage}. سيتم استخدام صورة افتراضية.`
          : `Failed to upload image: ${errorMessage}. Default image will be used.`
      );
      return getDefaultProductImage();
    }
  };

  // تحميل المنتجات من Supabase
  useEffect(() => {
    console.log("📦 AdminScreen: بدء تحميل المنتجات...");
    setProductsLoading(true);

    const loadProducts = async () => {
      const { data, error } = await dbService.get('products', {
        order: { column: 'created_at', ascending: false }
      });

      if (error) {
        console.error("❌ AdminScreen: خطأ في تحميل المنتجات:", error);
        Alert.alert(
          language === "ar" ? "خطأ" : "Error",
          language === "ar" ? "فشل في تحميل المنتجات" : "Failed to load products"
        );
        setProductsLoading(false);
        return;
      }

      const items: Product[] = [];

      if (data) {
        data.forEach((item: any) => {
          // التأكد من أن البيانات تحتوي على الحقول المطلوبة
          if (item && item.name && item.price !== undefined) {
            items.push({
              id: item.id,
              name: item.name || "",
              price: item.price || 0,
              description: item.description || "",
              category: item.category || categories[0],
              attribute: item.attribute || attributes[0],
              paymentMethod: item.payment_method || item.paymentMethod || "cash",
              currency: item.currency || "YER",
              discount: item.discount || 0,
              originalPrice: item.original_price || item.originalPrice || null,
              imageUrl: sanitizeImageUrl(item.image_url || item.imageUrl) || getDefaultProductImage(),
              createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            });
          } else {
            console.log("⚠️ Product data is missing required fields");
          }
        });
      }

      console.log(`✅ AdminScreen: تم تحميل ${items.length} منتج`);
      setProducts(items);
      setProductsLoading(false);
    };

    loadProducts();
  }, [categories, attributes, language]);

  // إعادة تعيين النموذج
  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setCategory(categories[0]);
    setAttribute(attributes[0]);
    setPaymentMethod("cash");
    setCurrency("YER");
    setDiscount(0);
    setOriginalPrice("");
    setImage(null);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // تحميل بيانات المنتج في النموذج للتعديل
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    // تنسيق السعر بنفس طريقة عرضه في السلة (2 خانات عشرية)
    setPrice(product.price?.toFixed(2) || "0.00");
    setDescription(product.description);
    setCategory(product.category);
    setAttribute(product.attribute);
    setPaymentMethod(product.paymentMethod);
    setCurrency(product.currency || "YER");
    setDiscount(product.discount || 0);
    setOriginalPrice(product.originalPrice?.toFixed(2) || "");
    setImage(product.imageUrl);
    setShowAddForm(true);
  };

  // حذف منتج
  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      language === "ar" ? "تأكيد الحذف" : "Confirm Delete",
      language === "ar" 
        ? `هل أنت متأكد من حذف المنتج "${productName}"؟` 
        : `Are you sure you want to delete "${productName}"?`,
      [
        {
          text: language === "ar" ? "إلغاء" : "Cancel",
          style: "cancel"
        },
        {
          text: language === "ar" ? "حذف" : "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await dbService.delete('products', productId);
              if (error) {
                throw error;
              }
              Alert.alert(
                language === "ar" ? "نجاح" : "Success",
                language === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully"
              );
            } catch (error) {
              console.error("❌ AdminScreen: خطأ في حذف المنتج:", error);
              Alert.alert(
                language === "ar" ? "خطأ" : "Error",
                language === "ar" ? "فشل في حذف المنتج" : "Failed to delete product"
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
    
    if (!price.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال السعر" : "Please enter price"
      );
      return;
    }
    
    // التحقق من أن السعر رقم صحيح
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال سعر صحيح أكبر من صفر" : "Please enter a valid price greater than zero"
      );
      return;
    }
    
    if (!description.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى إدخال وصف المنتج" : "Please enter product description"
      );
      return;
    }

    setLoading(true);
    try {
      let imageUrl = getDefaultProductImage();
      let uploadedImages: string[] = [];
      
      // رفع الصورة الرئيسية إذا كانت موجودة
      if (image) {
        imageUrl = await uploadImage(image);
      }
      
      // رفع جميع الصور المتعددة
      if (images.length > 0) {
        console.log('📷 جاري رفع الصور المتعددة:', images.length);
        for (const imgUri of images) {
          const uploadedUrl = await uploadImage(imgUri);
          uploadedImages.push(uploadedUrl);
          console.log('✅ تم رفع صورة:', uploadedUrl);
        }
        console.log('📷 جميع الصور المرفوعة:', uploadedImages);
      }

      const productData: any = {
        name: name.trim(),
        price: priceNum,
        description: description.trim(),
        category,
        attribute,
        paymentMethod,
        currency,
        discount,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      // إضافة حقل images فقط إذا كانت هناك صور متعددة
      if (uploadedImages.length > 0) {
        productData.images = uploadedImages;
        console.log('💾 سيتم حفظ الصور المتعددة في المنتج:', uploadedImages);
      }

      if (editingProduct) {
        // تحديث منتج موجود
        const { error } = await dbService.update('products', editingProduct.id, productData);
        if (error) {
          throw error;
        }
        Alert.alert(
          language === "ar" ? "نجاح" : "Success",
          language === "ar" ? "تم تحديث المنتج بنجاح" : "Product updated successfully"
        );
      } else {
        // إضافة منتج جديد
        const { error } = await dbService.add('products', productData);
        if (error) {
          throw error;
        }
        Alert.alert(
          language === "ar" ? "نجاح" : "Success",
          language === "ar" ? "تمت إضافة المنتج بنجاح" : "Product added successfully"
        );
      }
      
      // إعادة تعيين النموذج
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("خطأ", "فشل في إضافة المنتج. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isDarkMode, colors);

  // عرض المنتجات
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.productImage}
        defaultSource={{ uri: getDefaultProductImage() }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price || 0, (item.currency || 'YER') as any)}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>
              {language === "ar" ? "تعديل" : "Edit"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>
              {language === "ar" ? "حذف" : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#333"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "لوحة تحكم المدير" : "Admin Panel"}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
          >
            <Ionicons 
              name={showAddForm ? "close" : "add"} 
              size={24} 
              color={isDarkMode ? "#fff" : "#333"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {showAddForm && (
        <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>
              {editingProduct 
                ? (language === "ar" ? "تعديل المنتج" : "Edit Product")
                : (language === "ar" ? "إضافة منتج جديد" : "Add New Product")
              }
            </Text>
        <Text style={styles.label}>
          {language === "ar" ? "اسم المنتج *" : "Product Name *"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أدخل اسم المنتج" : "Enter product name"}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={name}
          onChangeText={setName}
          maxLength={100}
        />

        <Text style={styles.label}>
          {language === "ar" ? "السعر *" : "Price *"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "أدخل السعر" : "Enter price"}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={price}
          onChangeText={(text) => {
            // السماح فقط بالأرقام والنقطة العشرية
            if (/^\d*\.?\d*$/.test(text)) {
              setPrice(text);
            }
          }}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>
          {language === "ar" ? "الوصف *" : "Description *"}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={language === "ar" ? "أدخل وصف المنتج" : "Enter product description"}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <Text style={styles.label}>
          {language === "ar" ? "القسم" : "Category"}
        </Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.pickerText}>{category}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>
          {language === "ar" ? "الصفة" : "Attribute"}
        </Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowAttributeModal(true)}
        >
          <Text style={styles.pickerText}>{attribute}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>
          {language === "ar" ? "طريقة الدفع" : "Payment Method"}
        </Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'cash' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.selectedPaymentText]}>
              {language === "ar" ? "نقداً" : "Cash"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'card' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'card' && styles.selectedPaymentText]}>
              {language === "ar" ? "بطاقة" : "Card"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'transfer' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('transfer')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'transfer' && styles.selectedPaymentText]}>
              {language === "ar" ? "تحويل" : "Transfer"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          {language === "ar" ? "العملة" : "Currency"}
        </Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowCurrencyModal(true)}
        >
          <Text style={styles.pickerText}>{currency}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>
          {language === "ar" ? "الخصم %" : "Discount %"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "نسبة الخصم (مثلاً: 20)" : "Discount percentage (e.g., 20)"}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={discount.toString()}
          onChangeText={(text) => setDiscount(parseFloat(text) || 0)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          {language === "ar" ? "السعر الأصلي" : "Original Price"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "السعر قبل الخصم" : "Price before discount"}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
          value={originalPrice}
          onChangeText={setOriginalPrice}
          keyboardType="numeric"
        />

        {/* رفع الصورة */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>
            {language === "ar" ? "الصورة الرئيسية" : "Main Image"}
          </Text>
          <TouchableOpacity 
            style={styles.imageUploadButton}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#666" />
                <Text style={styles.imagePlaceholderText}>
                  {language === "ar" ? "اضغط لاختيار صورة" : "Tap to select image"}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* زر إضافة صور متعددة */}
          <TouchableOpacity 
            style={styles.addMultipleImagesButton}
            onPress={pickMultipleImages}
          >
            <Ionicons name="images" size={20} color="#007bff" />
            <Text style={styles.addMultipleImagesText}>
              {language === "ar" ? "+ إضافة صور متعددة" : "+ Add multiple images"}
            </Text>
          </TouchableOpacity>

          {/* عرض الصور المتعددة */}
          {images.length > 0 && (
            <View style={styles.multipleImagesContainer}>
              <Text style={styles.label}>
                {language === "ar" ? "الصور الإضافية" : "Additional Images"}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((imgUri, index) => (
                  <View key={index} style={styles.imageThumbnailContainer}>
                    <Image source={{ uri: imgUri }} style={styles.imageThumbnail} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

            <View style={styles.buttonContainer}>
              <Button 
                title={
                  loading 
                    ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                    : editingProduct
                      ? (language === "ar" ? "تحديث المنتج" : "Update Product")
                      : (language === "ar" ? "إضافة المنتج" : "Add Product")
                } 
                onPress={handleAddProduct}
                disabled={loading}
              />
              {editingProduct && (
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* قائمة المنتجات */}
      <View style={styles.productsContainer}>
        <Text style={styles.productsTitle}>
          {language === "ar" ? `جميع المنتجات (${products.length})` : `All Products (${products.length})`}
        </Text>
        {productsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={isDarkMode ? "#666" : "#ccc"} />
            <Text style={styles.emptyText}>
              {language === "ar" ? "لا توجد منتجات" : "No products"}
            </Text>
            <Text style={styles.emptySubtext}>
              {language === "ar" ? "اضغط على زر + لإضافة منتج جديد" : "Tap + to add a new product"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
              <Text style={styles.modalTitle}>
                {language === "ar" ? "اختر القسم" : "Select Category"}
              </Text>
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
              <Text style={styles.modalTitle}>
                {language === "ar" ? "اختر الصفة" : "Select Attribute"}
              </Text>
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

      {/* Modal for Currency Selection */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === "ar" ? "اختر العملة" : "Select Currency"}
              </Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCY_RATES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    currency === item.code && styles.selectedModalItem
                  ]}
                  onPress={() => {
                    setCurrency(item.code);
                    setShowCurrencyModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    currency === item.code && styles.selectedModalItemText
                  ]}>
                    {item.name} ({item.symbol})
                  </Text>
                  {currency === item.code && (
                    <Ionicons name="checkmark" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.header,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencyButton: {
    backgroundColor: isDarkMode ? "#444" : "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: isDarkMode ? "#fff" : "#333",
  },
  formContainer: {
    maxHeight: "50%",
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: isDarkMode ? "#fff" : "#333",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: isDarkMode ? "#fff" : "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? "#444" : "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: isDarkMode ? "#2a2a2a" : "#fff",
    color: isDarkMode ? "#fff" : "#333",
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
    borderColor: isDarkMode ? "#444" : "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: isDarkMode ? "#2a2a2a" : "#fff",
    marginBottom: 16,
  },
  pickerText: {
    fontSize: 16,
    color: isDarkMode ? "#fff" : "#333",
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
    borderColor: isDarkMode ? "#444" : "#ddd",
    backgroundColor: isDarkMode ? "#2a2a2a" : "#fff",
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedPaymentButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  paymentText: {
    fontSize: 14,
    color: isDarkMode ? "#ccc" : "#666",
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
    borderColor: isDarkMode ? "#444" : "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isDarkMode ? "#2a2a2a" : "#fafafa",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: isDarkMode ? "#ccc" : "#666",
  },
  addMultipleImagesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  addMultipleImagesText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  multipleImagesContainer: {
    marginTop: 12,
  },
  imageThumbnailContainer: {
    position: "relative",
    marginRight: 8,
  },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: isDarkMode ? "#444" : "#e0e0e0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: isDarkMode ? "#fff" : "#333",
  },
  productsContainer: {
    flex: 1,
    padding: 16,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: isDarkMode ? "#fff" : "#333",
    marginBottom: 16,
  },
  productsList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    flex: 0.48,
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: isDarkMode ? "#fff" : "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: isDarkMode ? "#999" : "#666",
    marginBottom: 12,
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: isDarkMode ? "#999" : "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: isDarkMode ? "#999" : "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: isDarkMode ? "#666" : "#999",
    marginTop: 8,
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedModalItem: {
    backgroundColor: "#e3f2fd",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedModalItemText: {
    color: "#007bff",
    fontWeight: "bold",
  },
});