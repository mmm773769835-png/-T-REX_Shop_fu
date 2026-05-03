import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LanguageContext } from '../contexts/LanguageContext';
import { authService } from '../services/SupabaseService';

const ChangePasswordScreen = ({ navigation }: any) => {
  const { language } = useContext(LanguageContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("⚠️", language === 'ar' ? "الرجاء ملء جميع الحقول" : "Please fill all fields");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("⚠️", language === 'ar' ? "كلمة المرور الجديدة غير متطابقة" : "New passwords do not match");
    }

    if (newPassword.length < 6) {
      return Alert.alert("⚠️", language === 'ar' ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      // الحصول على المستخدم الحالي
      const { user, error: userError } = await authService.getCurrentUser();

      if (userError || !user) {
        throw new Error(language === 'ar' ? "لم يتم العثور على المستخدم" : "User not found");
      }

      if (!user.email) {
        throw new Error(language === 'ar' ? "لا يوجد بريد إلكتروني مرتبط بالحساب" : "No email associated with account");
      }

      // محاولة تسجيل الدخول باستخدام كلمة المرور الحالية للتحقق منها
      const { error: signInError } = await authService.signIn(user.email, currentPassword);

      if (signInError) {
        throw new Error(language === 'ar' ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect");
      }

      // تحديث كلمة المرور باستخدام Supabase Admin API أو إعادة تعيين
      // ملاحظة: Supabase لا يدعم تغيير كلمة المرور مباشرة من العميل بدون إعادة المصادقة
      // يمكن استخدام resetPassword أو إرسال رابط إعادة تعيين
      Alert.alert(
        "ℹ️",
        language === 'ar'
          ? "يرجى استخدام رابط 'نسيت كلمة المرور' في شاشة تسجيل الدخول لتغيير كلمة المرور"
          : "Please use the 'Forgot Password' link on the login screen to change your password",
        [
          { text: language === 'ar' ? "موافق" : "OK", onPress: () => navigation.goBack() }
        ]
      );
    } catch (error: any) {
      console.error(error);
      let errorMessage = language === 'ar' ? "حدث خطأ أثناء تغيير كلمة المرور" : "Error occurred while changing password";

      if (error.message?.includes("password") || error.message?.includes("كلمة المرور")) {
        errorMessage = language === 'ar' ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect";
      } else if (error.message?.includes("rate limit") || error.message?.includes("too-many")) {
        errorMessage = language === 'ar' ? "لقد قمت بمحاولات كثيرة، يرجى المحاولة لاحقاً" : "Too many attempts, please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("❌", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{language === 'ar' ? '🔐 تغيير كلمة المرور' : '🔐 Change Password'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={language === 'ar' ? "كلمة المرور الحالية" : "Current Password"}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder={language === 'ar' ? "كلمة المرور الجديدة" : "New Password"}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder={language === 'ar' ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.changeButton} 
        onPress={handleChangePassword} 
        disabled={loading}
      >
        <Text style={styles.changeText}>
          {loading ? (language === 'ar' ? "⏳ جاري التغيير..." : "⏳ Changing...") : (language === 'ar' ? "🔄 تغيير كلمة المرور" : "🔄 Change Password")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginVertical: 30 
  },
  input: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginVertical: 10,
  },
  changeButton: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 30,
    alignItems: "center",
  },
  changeText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
});

export default ChangePasswordScreen;