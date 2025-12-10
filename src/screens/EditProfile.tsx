import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const EditProfile = ({ navigation, route }: any) => {
  const [name, setName] = useState(route.params?.name || "");
  const [phone, setPhone] = useState(route.params?.phone || "");
  const [image, setImage] = useState(route.params?.photoURL || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name || !phone) return Alert.alert("⚠️", "الرجاء إدخال الاسم ورقم الهاتف");

    try {
      setLoading(true);
      let photoURL = image;
      if (image && !image.startsWith("https")) {
        const response = await fetch(image);
        const blob = await response.blob();
        const fileRef = ref(storage, `profiles/${phone}.jpg`);
        await uploadBytes(fileRef, blob);
        photoURL = await getDownloadURL(fileRef);
      }

      await setDoc(doc(db, "users", phone), { name, phone, photoURL });
      Alert.alert("✅ تم تحديث بيانات الحساب بنجاح");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("❌ حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ تعديل الحساب</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            image
              ? { uri: image }
              : { uri: "https://via.placeholder.com/150/007bff/FFFFFF?text=User" }
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>

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

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveText}>{loading ? "⏳ جاري الحفظ..." : "💾 حفظ التغييرات"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 20 },
  input: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginVertical: 8,
  },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  saveButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  saveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default EditProfile;
