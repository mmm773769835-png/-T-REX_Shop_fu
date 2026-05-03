import * as React from "react";
import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Modal, FlatList, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../shared/components/Button";
import { PRODUCT_CATEGORIES, PRODUCT_ATTRIBUTES } from "../shared/constants/productConstants";
import { LanguageContext } from '../contexts/LanguageContext';
import { getDefaultProductImage } from '../utils/imageUtils';
import { dbService, storageService } from '../services/SupabaseService';

export default function AddProduct({ navigation, route }: any) {
  const { language } = useContext(LanguageContext);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const categories = language === 'ar' ? PRODUCT_CATEGORIES.ar : PRODUCT_CATEGORIES.en;
  const attributes = language === 'ar' ? PRODUCT_ATTRIBUTES.ar : PRODUCT_ATTRIBUTES.en;
  const [category, setCategory] = useState(route?.params?.category || categories[0]);
  const [attribute, setAttribute] = useState(route?.params?.attribute || attributes[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [images, setImages] = useState<string[]>([]); // مصفوفة لتخزين عدة صور
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);

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
      
      // رفع جميع الصور إذا كانت موجودة
      if (images.length > 0) {
        for (const imageUri of images) {
          const uploadedUrl = await uploadImage(imageUri);
          imageUrls.push(uploadedUrl);
        }
      } else {
        // إذا لم يتم اختيار صور، استخدم الصورة الافتراضية
        imageUrls = [getDefaultProductImage()];
      }

      const productData = {
        name: name.trim(),
        price: priceNum,
        description: description.trim(),
        category,
        attribute,
        paymentMethod,
        imageUrls, // حفظ مصفوفة الصور بدلاً من صورة واحدة
        primaryImage: imageUrls[0], // الصورة الأساسية للعرض
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await dbService.add('products', productData);

      if (error) {
        throw error;
      }

      Alert.alert(
        language === "ar" ? "نجاح" : "Success",
        language === "ar" ? "تمت إضافة المنتج بنجاح" : "Product added successfully"
      );
      // إعادة تعيين النموذج
      setName("");
      setPrice("");
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
        <Text style={styles.label}>{language === 'ar' ? 'اسم المنتج *' : 'Product Name *'}</Text>
        <TextInput
          style={styles.input}
          placeholder={language === 'ar' ? "أدخل اسم المنتج" : "Enter product name"}
          value={name}
          onChangeText={setName}
          maxLength={100}
        />

        <Text style={styles.label}>{language === 'ar' ? 'السعر *' : 'Price *'}</Text>
        <TextInput
          style={styles.input}
          placeholder={language === 'ar' ? "أدخل السعر" : "Enter price"}
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

        <Text style={styles.label}>{language === 'ar' ? 'الوصف *' : 'Description *'}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={language === 'ar' ? "أدخل وصف المنتج" : "Enter product description"}
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