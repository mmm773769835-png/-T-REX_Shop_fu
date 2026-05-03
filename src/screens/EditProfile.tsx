import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDefaultUserImage } from "../utils/imageUtils";
import { LanguageContext } from '../contexts/LanguageContext';
import { dbService, storageService } from '../services/SupabaseService';

const EditProfile = ({ navigation, route }: any) => {
  const { language } = useContext(LanguageContext);
  const [name, setName] = useState(route.params?.name || "");
  const [phone, setPhone] = useState(route.params?.phone || "");
  const [image, setImage] = useState(route.params?.photoURL || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("❌", language === 'ar' ? "نحتاج إلى إذن للوصول إلى المعرض" : "We need permission to access the gallery");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !phone) return Alert.alert("⚠️", language === 'ar' ? "الرجاء إدخال الاسم ورقم الهاتف" : "Please enter name and phone number");

    try {
      setLoading(true);
      let photoURL = image;
      if (image && !image.startsWith("https")) {
        // التحقق من نوع الصورة لتجنب خطأ ArrayBuffer
        const response = await fetch(image);
        const blob = await response.blob();

        // رفع الصورة إلى Supabase Storage
        const filename = `profiles/${phone}.jpg`;
        const { data, error } = await storageService.upload('profile-images', filename, blob);

        if (error) {
          throw error;
        }

        photoURL = storageService.getPublicUrl('profile-images', filename);
      }

      // حفظ بيانات المستخدم في Supabase
      const { error } = await dbService.add('users', { name, phone, photo_url: photoURL });

      if (error) {
        throw error;
      }

      Alert.alert("✅", language === 'ar' ? "تم تحديث بيانات الحساب بنجاح" : "Account data updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("❌", language === 'ar' ? "حدث خطأ أثناء حفظ البيانات" : "An error occurred while saving data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{language === 'ar' ? '✏️ تعديل الحساب' : '✏️ Edit Account'}</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            image
              ? { uri: image }
              : { uri: getDefaultUserImage() }
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder={language === 'ar' ? "الاسم الكامل" : "Full Name"}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder={language === 'ar' ? "رقم الهاتف" : "Phone Number"}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveText}>{loading ? (language === 'ar' ? "⏳ جاري الحفظ..." : "⏳ Saving...") : (language === 'ar' ? "💾 حفظ التغييرات" : "💾 Save Changes")}</Text>
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
