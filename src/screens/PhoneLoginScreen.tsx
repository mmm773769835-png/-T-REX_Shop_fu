import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
// @ts-ignore
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebaseConfig from "../config/firebase.config";
import { signInWithPhone, confirmPhoneSignIn } from "../../services/FirebaseAuthService";

export default function PhoneLoginScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const recaptchaVerifier = useRef(null);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }

    setLoading(true);
    try {
      // التأكد من أن رقم الهاتف يبدأ برمز البلد
      let fullPhoneNumber = phoneNumber;
      if (!phoneNumber.startsWith("+")) {
        fullPhoneNumber = "+966" + phoneNumber; // افتراضيًا السعودية
      }

      // @ts-ignore
      const result: any = await signInWithPhone(fullPhoneNumber, recaptchaVerifier.current);
      if (result.success) {
        setVerificationId(result.confirmationResult);
        setShowConfirmation(true);
        Alert.alert("نجاح", "تم إرسال رمز التحقق إلى هاتفك");
      } else {
        Alert.alert("خطأ", result.message);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل في إرسال رمز التحقق");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("خطأ", "يرجى إدخال رمز التحقق");
      return;
    }

    setLoading(true);
    try {
      // @ts-ignore
      const result: any = await confirmPhoneSignIn(verificationId, verificationCode);
      if (result.success) {
        Alert.alert("نجاح", "تم التحقق بنجاح");
        navigation.replace("Home", { 
          loggedIn: true,
          admin: false // سيتم التحقق من الدور لاحقًا
        });
      } else {
        Alert.alert("خطأ", result.message);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل في التحقق من الرمز");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* @ts-ignore */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      
      <View style={styles.form}>
        <Text style={styles.title}>تسجيل الدخول برقم الهاتف</Text>
        
        {!showConfirmation ? (
          <>
            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل رقم الهاتف مع رمز البلد"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]} 
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>رمز التحقق</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل رمز التحقق"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]} 
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "جاري التحقق..." : "تحقق من الرمز"}
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>العودة</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
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
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#6c757d",
  },
  disabledButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});