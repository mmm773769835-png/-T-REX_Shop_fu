import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from "react-native";
import Input from "../shared/components/Input";
import Button from "../shared/components/Button";
import { signInWithPhone, confirmPhoneSignIn } from "../../services/FirebaseAuthService";
import { RecaptchaVerifier } from "firebase/auth";

const OtpLoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: enter phone, 2: enter otp
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Countdown timer for resend OTP
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }

    // Simple phone validation
    if (phone.length < 10) {
      Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setLoading(true);
    try {
      // Create recaptcha verifier
      // Note: In a real app, you would need to implement recaptcha properly
      // For now, we'll simulate the process
      Alert.alert("معلومات", "في تطبيق حقيقي، سيتم إرسال رمز التحقق عبر رسالة نصية. نحن نحاكي هذا السلوك الآن.");
      
      // Simulate successful OTP sending
      setStep(2);
      setCountdown(30); // 30 seconds cooldown
      Alert.alert("نجاح", "تم إرسال رمز التحقق إلى هاتفك");
    } catch (error: any) {
      console.error("OTP Error:", error);
      Alert.alert("خطأ", error.message || "فشل في إرسال رمز التحقق. يرجى التحقق من الاتصال بالإنترنت");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("خطأ", "يرجى إدخال رمز التحقق");
      return;
    }

    // Validate OTP format
    if (otp.length !== 6 || !/^[0-9]+$/.test(otp)) {
      Alert.alert("خطأ", "يرجى إدخال رمز تحقق صحيح مكون من 6 أرقام");
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, we would use Firebase phone auth
      // For now, we'll simulate successful verification
      Alert.alert("نجاح", "تم تسجيل الدخول بنجاح");
      // @ts-ignore
      navigation.navigate("MainTabs", { loggedIn: true });
    } catch (error: any) {
      console.error("Verify Error:", error);
      Alert.alert("خطأ", error.message || "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // @ts-ignore
    navigation.navigate("Register");
  };

  const handleSkip = () => {
    // @ts-ignore
    navigation.navigate("MainTabs");
  };

  const handleResendOtp = () => {
    if (countdown > 0) {
      Alert.alert("انتظر", `يرجى الانتظار ${countdown} ثانية قبل إعادة إرسال الرمز`);
      return;
    }
    handleSendOtp();
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Image 
          source={{ uri: "https://via.placeholder.com/100/007bff/FFFFFF?text=TREX" }} 
          style={styles.logo}
        />
        <Text style={styles.title}>مرحباً بك في متجر T-REX</Text>
        <Text style={styles.subtitle}>
          {step === 1 ? "أدخل رقم هاتفك لتسجيل الدخول" : "أدخل رمز التحقق"}
        </Text>
      </View>

      <View style={styles.form}>
        {step === 1 ? (
          <>
            <Input
              label="رقم الهاتف"
              placeholder="أدخل رقم هاتفك"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
            />
            
            {/* Verification Method Selection */}
            <View style={styles.methodSelection}>
              <Text style={styles.methodLabel}>طريقة التحقق:</Text>
              <View style={styles.methodButtons}>
                <TouchableOpacity 
                  style={[styles.methodButton, styles.selectedMethodButton]}
                  onPress={() => {}}
                >
                  <Text style={[styles.methodButtonText, styles.selectedMethodButtonText]}>
                    رسالة نصية
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.methodButton]}
                  onPress={() => {}}
                >
                  <Text style={[styles.methodButtonText]}>
                    واتساب
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.methodButton]}
                  onPress={() => {}}
                >
                  <Text style={[styles.methodButtonText]}>
                    كلاهما
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.loginButton}>
              <Button 
                title={loading ? "جاري الإرسال..." : "إرسال رمز التحقق"} 
                onPress={handleSendOtp} 
                disabled={loading}
                size="large"
                block={true}
              />
            </View>
            
            <View style={styles.skipButtonContainer}>
              <Button 
                title="⏭️ تخطي (دخول كضيف)" 
                onPress={handleSkip} 
                variant="outline"
                size="medium"
                block={true}
              />
            </View>
          </>
        ) : (
          <>
            <Input
              label="رمز التحقق"
              placeholder="أدخل الرمز المكون من 6 أرقام"
              value={otp}
              onChangeText={(text) => {
                // Limit to 6 characters and only numbers
                if (/^[0-9]{0,6}$/.test(text)) {
                  setOtp(text);
                }
              }}
              keyboardType="numeric"
              maxLength={6}
            />

            <View style={styles.loginButton}>
              <Button 
                title={loading ? "جاري التحقق..." : "تحقق من الرمز"} 
                onPress={handleVerifyOtp} 
                disabled={loading}
                size="large"
                block={true}
              />
            </View>

            <View style={styles.resendContainer}>
              <View style={styles.resendButtonWrapper}>
                <Button 
                  title="تغيير رقم الهاتف"
                  onPress={() => setStep(1)}
                  variant="outline"
                  disabled={loading}
                  size="small"
                  block={true}
                />
              </View>
              
              <View style={styles.resendButtonWrapper}>
                <Button 
                  title={countdown > 0 ? `إعادة الإرسال (${countdown})` : "إعادة إرسال الرمز"}
                  onPress={handleResendOtp}
                  variant="outline"
                  disabled={loading || countdown > 0}
                  size="small"
                  block={true}
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ليس لديك حساب؟</Text>
          <View style={styles.registerButton}>
            <Button 
              title="إنشاء حساب جديد" 
              onPress={handleRegister} 
              variant="outline"
              size="large"
              block={true}
            />
          </View>
        </View>
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
    alignItems: "center",
    padding: 40,
    backgroundColor: "#007bff",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e0e0e0",
    textAlign: "center",
  },
  form: {
    padding: 20,
  },
  loginButton: {
    marginTop: 20,
  },
  skipButtonContainer: {
    marginTop: 15,
  },
  registerButton: {
    width: '100%',
  },
  skipButton: {
    marginTop: 15,
    alignItems: "center",
  },
  skipText: {
    color: "#666",
    fontSize: 16,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  resendButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  resendButton: {
    alignItems: "center",
    padding: 10,
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 16,
    marginBottom: 16,
    color: "#666",
  },
  // New styles for verification method selection
  methodSelection: {
    marginVertical: 20,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  methodButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedMethodButton: {
    backgroundColor: "#007bff",
  },
  methodButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  selectedMethodButtonText: {
    color: "#fff",
  },
});

export default OtpLoginScreen;