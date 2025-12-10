import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { signInWithEmail } from "../../services/FirebaseAuthService";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول");
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        Alert.alert("نجاح", "تم تسجيل الدخول بنجاح");
        // تمرير معلومات تسجيل الدخول إلى الشاشة الرئيسية
        navigation.replace("Home", { 
          loggedIn: true,
          admin: true // سيتم التحقق من الدور لاحقًا في الشاشة الرئيسية
        });
      } else {
        Alert.alert("خطأ", result.message);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  // وظيفة لتخطي تسجيل الدخول
  const handleSkipLogin = () => {
    navigation.replace("Home", { 
      loggedIn: false,
      admin: false
    });
  };

  // الانتقال إلى شاشة تسجيل الدخول عبر الهاتف
  const handlePhoneLogin = () => {
    navigation.navigate("PhoneLogin");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>تسجيل الدخول</Text>
        
        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل بريدك الإلكتروني"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.phoneButton]}
          onPress={handlePhoneLogin}
        >
          <Text style={styles.buttonText}>تسجيل الدخول برقم الهاتف</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.skipButton]}
          onPress={handleSkipLogin}
        >
          <Text style={styles.buttonText}>تخطي تسجيل الدخول</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.linkText}>ليس لديك حساب؟ سجل الآن</Text>
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
  phoneButton: {
    backgroundColor: "#28a745",
  },
  skipButton: {
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
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#007bff",
    fontSize: 16,
  },
});