import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import Button from "../shared/components/Button";

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: "t-rex-5b17f.firebaseapp.com",
  projectId: "t-rex-5b17f",
  storageBucket: "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: "37814615065",
  appId: "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const OrderConfirm = ({ route, navigation }: any) => {
  const { cartItems } = route?.params || { cartItems: [] };
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !phone || !address) {
      Alert.alert("⚠️ يرجى تعبئة جميع البيانات");
      return;
    }
    if (paymentMethod === "transfer" && !receiptImage) {
      Alert.alert("📸 يرجى إرفاق صورة إيصال التحويل");
      return;
    }

    try {
      setUploading(true);
      let receiptUrl = "";
      if (receiptImage) {
        const response = await fetch(receiptImage);
        const blob = await response.blob();
        const fileRef = ref(storage, `receipts/${Date.now()}-${name}.jpg`);
        await uploadBytes(fileRef, blob);
        receiptUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "orders"), {
        name,
        phone,
        address,
        paymentMethod,
        receiptUrl,
        items: cartItems,
        total: total,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("✅ تم إرسال الطلب بنجاح!");
      // @ts-ignore
      navigation.navigate("HomeV2");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ حدث خطأ أثناء إرسال الطلب");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>🧾 تأكيد الطلب</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات الطلب</Text>
        <View style={styles.orderSummary}>
          <Text style={styles.orderText}>عدد المنتجات: {cartItems.length}</Text>
          <Text style={styles.orderText}>الإجمالي: {total.toFixed(2)} ر.ي</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات الشحن</Text>
        
        <TextInput
          style={styles.input}
          placeholder="الاسم الكامل"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="رقم الهاتف"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="العنوان / المدينة"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>طريقة الدفع</Text>
        <View style={styles.paymentMethods}>
          {["cash", "transfer", "online"].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentButton,
                paymentMethod === method && styles.activePaymentButton,
              ]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={[
                styles.paymentText,
                paymentMethod === method && styles.activePaymentText
              ]}>
                {method === "transfer"
                  ? "🏦 تحويل بنكي"
                  : method === "cash"
                  ? "💵 نقدي"
                  : "💳 إلكتروني"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {paymentMethod === "transfer" && (
          <View style={styles.receiptSection}>
            <Text style={styles.receiptLabel}>إرفاق إيصال التحويل</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickReceipt}>
              {receiptImage ? (
                <Image source={{ uri: receiptImage }} style={styles.imagePreview} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="camera" size={32} color="#999" />
                  <Text style={styles.placeholderText}>اضغط لاختيار صورة</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.section, styles.submitSection]}>
        <Button 
          title={uploading ? "⏳ جاري الإرسال..." : "✅ إرسال الطلب"} 
          onPress={handleSubmit} 
          disabled={uploading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  orderSummary: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 8,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  paymentMethods: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  paymentButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  activePaymentButton: {
    backgroundColor: "#007bff",
  },
  paymentText: {
    color: "#666",
    fontWeight: "bold",
  },
  activePaymentText: {
    color: "#fff",
  },
  receiptSection: {
    marginTop: 16,
  },
  receiptLabel: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "500",
  },
  imagePicker: {
    height: 150,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    marginTop: 8,
  },
  submitSection: {
    // رفع الزر أعلى قليلاً
    marginTop: 10,
  },
});

export default OrderConfirm;