import * as React from "react";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../shared/components/Button";
import { PRODUCT_CATEGORIES, PRODUCT_ATTRIBUTES } from "../shared/constants/productConstants";

// Import Firebase functions and instances from our service
import { db, storage, collection, addDoc, ref, uploadBytes, getDownloadURL } from "../../services/FirebaseAuthService";

export default function AddProduct({ navigation, route }: any) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(route?.params?.category || PRODUCT_CATEGORIES[0]);
  const [attribute, setAttribute] = useState(route?.params?.attribute || PRODUCT_ATTRIBUTES[0]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);

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
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("خطأ", "فشل في اختيار الصورة. يرجى المحاولة مرة أخرى.");
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      // التحقق من صحة URI
      if (!uri || typeof uri !== 'string') {
        console.warn("Invalid image URI provided");
        return "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Product";
      }
      
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // التحقق من أن Blob تم إنشاؤه بشكل صحيح
      if (blob.size === 0) {
        console.warn("Empty image blob");
        return "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Product";
      }
      
      const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
      const fileRef = ref(storage, `products/${filename}`);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("تحذير", "فشل في رفع الصورة. سيتم استخدام صورة افتراضية.");
      return "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Product";
    }
  };

  const handleAddProduct = async () => {
    // التحقق من صحة البيانات
    if (!name.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم المنتج");
      return;
    }
    
    if (!price.trim()) {
      Alert.alert("خطأ", "يرجى إدخال السعر");
      return;
    }
    
    // التحقق من أن السعر رقم صحيح
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("خطأ", "يرجى إدخال سعر صحيح أكبر من صفر");
      return;
    }
    
    if (!description.trim()) {
      Alert.alert("خطأ", "يرجى إدخال وصف المنتج");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Product";
      
      // رفع الصورة إذا كانت موجودة
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const productData = {
        name: name.trim(),
        price: priceNum,
        description: description.trim(),
        category,
        attribute,
        paymentMethod,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "products"), productData);
      
      Alert.alert("نجاح", "تمت إضافة المنتج بنجاح");
      // إعادة تعيين النموذج
      setName("");
      setPrice("");
      setDescription("");
      setImage(null);
      // @ts-ignore
      navigation.goBack();
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("خطأ", "فشل في إضافة المنتج. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.");
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
        <Text style={styles.title}>إضافة منتج جديد</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>اسم المنتج *</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل اسم المنتج"
          value={name}
          onChangeText={setName}
          maxLength={100}
        />

        <Text style={styles.label}>السعر *</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل السعر"
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

        <Text style={styles.label}>الوصف *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="أدخل وصف المنتج"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <Text style={styles.label}>القسم</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.pickerText}>{category}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>الصفة</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowAttributeModal(true)}
        >
          <Text style={styles.pickerText}>{attribute}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>طريقة الدفع</Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'cash' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.selectedPaymentText]}>
              نقداً
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'card' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'card' && styles.selectedPaymentText]}>
              بطاقة
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.paymentButton, paymentMethod === 'transfer' && styles.selectedPaymentButton]}
            onPress={() => setPaymentMethod('transfer')}
          >
            <Text style={[styles.paymentText, paymentMethod === 'transfer' && styles.selectedPaymentText]}>
              تحويل
            </Text>
          </TouchableOpacity>
        </View>

        {/* رفع الصورة */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>الصورة</Text>
          <TouchableOpacity 
            style={styles.imageUploadButton}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#666" />
                <Text style={styles.imagePlaceholderText}>اضغط لاختيار صورة</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title={loading ? "جاري الإضافة..." : "إضافة المنتج"} 
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
              <Text style={styles.modalTitle}>اختر القسم</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={PRODUCT_CATEGORIES}
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
              <Text style={styles.modalTitle}>اختر الصفة</Text>
              <TouchableOpacity onPress={() => setShowAttributeModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={PRODUCT_ATTRIBUTES}
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
});