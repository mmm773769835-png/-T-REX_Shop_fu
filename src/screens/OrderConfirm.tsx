import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Linking, Platform, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Button from "../shared/components/Button";
import { useCart } from '../contexts/CartContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { dbService, storageService } from '../services/SupabaseService';

const OrderConfirm = ({ route, navigation }: any) => {
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { state, clearCart } = useCart();
  
  // استخدام CartContext بدلاً من route.params
  const cartItems = state.items;
  const total = state.total;
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const styles = getStyles(isDarkMode, colors);

  // إضافة console.log عند تحميل الشاشة
  useEffect(() => {
    console.log('📦 OrderConfirm: تم تحميل الشاشة');
    console.log('📦 OrderConfirm: عدد المنتجات في السلة:', cartItems.length);
    console.log('📦 OrderConfirm: الإجمالي:', total);
    console.log('📦 OrderConfirm: المنتجات:', cartItems);
    console.log('📦 OrderConfirm: طريقة الدفع الافتراضية:', paymentMethod);
  }, [cartItems, total]);

  const pickReceipt = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("❌", "نحتاج إلى إذن للوصول إلى المعرض");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  // دالة لإرسال بيانات الطلب إلى الواتساب
  const sendOrderToWhatsApp = (orderData: any, orderId: string) => {
    try {
      console.log('📱 OrderConfirm: بدء إرسال رسالة واتساب...');
      const whatsappNumber = "967773769835"; // رقم الواتساب بدون +
      
      // تنسيق بيانات الطلب في رسالة
      const paymentMethodText = 
        paymentMethod === "cash" 
          ? (language === "ar" ? "نقدي" : "Cash")
          : paymentMethod === "transfer"
          ? (language === "ar" ? "تحويل بنكي" : "Bank Transfer")
          : (language === "ar" ? "إلكتروني" : "Online");

      // بناء الرسالة بشكل آمن
      let message = language === "ar" 
        ? `🛒 طلب جديد من متجر T-REX\n\n`
        : `🛒 New Order from T-REX Shop\n\n`;
      
      message += language === "ar" 
        ? `📋 رقم الطلب: ${orderId}\n`
        : `📋 Order ID: ${orderId}\n`;
      
      message += language === "ar"
        ? `👤 اسم العميل: ${name || 'غير محدد'}\n`
        : `👤 Customer Name: ${name || 'Not specified'}\n`;
      
      message += language === "ar"
        ? `📞 رقم الهاتف: ${phone || 'غير محدد'}\n`
        : `📞 Phone: ${phone || 'Not specified'}\n`;
      
      message += language === "ar"
        ? `📍 العنوان: ${address || 'غير محدد'}\n`
        : `📍 Address: ${address || 'Not specified'}\n`;
      
      message += language === "ar"
        ? `💳 طريقة الدفع: ${paymentMethodText}\n`
        : `💳 Payment Method: ${paymentMethodText}\n`;
      
      // إضافة رابط الإيصال إذا كان موجوداً
      if (orderData.receiptUrl && orderData.receiptUrl.trim() !== "") {
        message += language === "ar"
          ? `📸 رابط إيصال التحويل: ${orderData.receiptUrl}\n`
          : `📸 Transfer Receipt: ${orderData.receiptUrl}\n`;
      }
      
      message += language === "ar" ? `
📦 المنتجات:
` : `
📦 Products:
`;
      
      // إضافة المنتجات بشكل آمن مع روابط وصور
      if (cartItems && cartItems.length > 0) {
        cartItems.forEach((item: any, index: number) => {
          const itemName = item.name || 'منتج غير مسمى';
          const itemQuantity = item.quantity || 1;
          const itemPrice = item.price || 0;
          const itemTotal = (itemPrice * itemQuantity).toFixed(2);
          const itemImage = item.imageUrl || '';
          const productId = item.id || '';

          // إنشاء رابط deep link للمنتج (Universal Link)
          const productLink = `https://trex-shop.com/product/${productId}`;

          message += language === "ar"
            ? `${index + 1}. ${itemName}\n   ${itemQuantity}x - ${itemTotal} ر.ي\n   🔗 ${productLink}\n   🖼️ ${itemImage}\n\n`
            : `${index + 1}. ${itemName}\n   ${itemQuantity}x - ${itemTotal} SAR\n   🔗 ${productLink}\n   🖼️ ${itemImage}\n\n`;
        });
      } else {
        message += language === "ar" ? "لا توجد منتجات\n" : "No products\n";
      }
      
      message += language === "ar"
        ? `\n💰 الإجمالي: ${total.toFixed(2)} ر.ي\n`
        : `\n💰 Total: ${total.toFixed(2)} SAR\n`;
      
      // إضافة التاريخ والوقت
      const now = new Date();
      const dateTime = language === "ar"
        ? now.toLocaleString('ar-SA', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
      
      message += language === "ar"
        ? `\n🕐 التاريخ والوقت: ${dateTime}`
        : `\n🕐 Date & Time: ${dateTime}`;

      console.log('📱 OrderConfirm: الرسالة:', message);
      console.log('📱 OrderConfirm: طول الرسالة:', message.length, 'حرف');

      // ترميز الرسالة للـ URL بشكل آمن
      const encodedMessage = encodeURIComponent(message);
      console.log('📱 OrderConfirm: طول الرسالة المرمزة:', encodedMessage.length);
      
      // رابط واتساب (يفتح التطبيق إن وُجد، أو المتصفح)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      const webWhatsAppUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
      
      console.log('📱 OrderConfirm: رابط واتساب:', whatsappUrl.substring(0, 100) + '...');
      
      // محاولة فتح واتساب مباشرة (بدون الاعتماد على canOpenURL لأنه غير موثوق على أندرويد 11+)
      Linking.openURL(whatsappUrl).then(() => {
        // تم فتح الرابط (تطبيق أو متصفح)
      }).catch(async (err) => {
        console.warn('⚠️ OrderConfirm: لم يُفتح واتساب، عرض بدائل:', err);
        Alert.alert(
          language === "ar" ? "واتساب غير متوفر" : "WhatsApp not available",
          language === "ar"
            ? "لم يُفتح واتساب. يمكنك فتح واتساب ويب أو مشاركة تفاصيل الطلب (لنسخها ولصقها في واتساب لاحقاً)."
            : "Could not open WhatsApp. You can open WhatsApp Web or share the order details to copy and paste later.",
          [
            {
              text: language === "ar" ? "فتح واتساب ويب" : "Open WhatsApp Web",
              onPress: () => Linking.openURL(webWhatsAppUrl).catch(() => {}),
            },
            {
              text: language === "ar" ? "مشاركة تفاصيل الطلب" : "Share order details",
              onPress: async () => {
                try {
                  await Share.share({
                    message,
                    title: language === "ar" ? "تفاصيل الطلب - T-REX Shop" : "Order details - T-REX Shop",
                  });
                } catch (e) {
                  Alert.alert(
                    language === "ar" ? "تنبيه" : "Notice",
                    language === "ar" ? "لم تتم المشاركة." : "Share was not completed."
                  );
                }
              },
            },
            { text: language === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
          ]
        );
      });
    } catch (error) {
      console.error('❌ OrderConfirm: خطأ في إرسال رسالة واتساب:', error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar"
          ? `حدث خطأ أثناء إرسال الرسالة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
          : `Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleSubmit = async () => {
    console.log('📦 OrderConfirm: بدء إرسال الطلب');
    console.log('📦 OrderConfirm: البيانات:', { name, phone, address, paymentMethod, cartItems: cartItems.length, total });
    
    if (!name || !phone || !address) {
      console.log('⚠️ OrderConfirm: البيانات غير مكتملة');
      Alert.alert(
        "⚠️",
        language === "ar" ? "يرجى تعبئة جميع البيانات" : "Please fill all fields"
      );
      return;
    }
    if (paymentMethod === "transfer" && !receiptImage) {
      console.log('⚠️ OrderConfirm: صورة الإيصال مفقودة');
      Alert.alert(
        "📸",
        language === "ar" ? "يرجى إرفاق صورة إيصال التحويل" : "Please attach transfer receipt"
      );
      return;
    }
    if (cartItems.length === 0) {
      console.log('⚠️ OrderConfirm: السلة فارغة');
      Alert.alert(
        "⚠️",
        language === "ar" ? "السلة فارغة" : "Cart is empty"
      );
      return;
    }

    try {
      console.log('📦 OrderConfirm: بدء رفع البيانات...');
      setUploading(true);
      let receiptUrl = "";
      
      // رفع صورة الإيصال فقط إذا كانت طريقة الدفع "تحويل بنكي" ووجدت صورة
      if (paymentMethod === "transfer" && receiptImage) {
        try {
          console.log('📦 OrderConfirm: رفع صورة الإيصال...');
          console.log('📦 OrderConfirm: رابط الصورة:', receiptImage);

          const fileName = `receipts/${Date.now()}-${name.replace(/\s+/g, '-')}.jpg`;

          console.log('📦 OrderConfirm: رفع الصورة إلى Supabase Storage...');

          // التحقق من نوع الصورة لتجنب خطأ ArrayBuffer
          const response = await fetch(receiptImage);
          const blob = await response.blob();

          // رفع الصورة إلى Supabase Storage
          const { data, error } = await storageService.upload('receipt-images', fileName, blob);

          if (error) {
            throw error;
          }

          receiptUrl = storageService.getPublicUrl('receipt-images', fileName);
          console.log('✅ OrderConfirm: تم رفع صورة الإيصال بنجاح:', receiptUrl);
        } catch (uploadError: any) {
          console.error('❌ OrderConfirm: خطأ في رفع صورة الإيصال:', uploadError);
          console.error('❌ OrderConfirm: تفاصيل الخطأ:', {
            code: uploadError?.code,
            message: uploadError?.message,
            serverResponse: uploadError?.serverResponse
          });

          // إذا فشل رفع الصورة، نستمر في العملية لكن بدون رابط الصورة
          let errorMessage = language === "ar"
            ? "فشل رفع صورة الإيصال. سيتم إرسال الطلب بدون رابط الصورة."
            : "Failed to upload receipt image. Order will be sent without receipt link.";

          // رسالة أكثر تفصيلاً حسب نوع الخطأ
          if (uploadError?.message?.includes('permission') || uploadError?.message?.includes('unauthorized')) {
            errorMessage = language === "ar"
              ? "فشل رفع صورة الإيصال بسبب مشكلة في الصلاحيات. سيتم إرسال الطلب بدون رابط الصورة. يرجى التواصل مع الدعم."
              : "Failed to upload receipt image due to permission issue. Order will be sent without receipt link. Please contact support.";
          } else if (uploadError?.message?.includes('not been set up') || uploadError?.message?.includes('bucket')) {
            errorMessage = language === "ar"
              ? "Supabase Storage غير مفعّل في المشروع. سيتم إرسال الطلب بدون رابط الصورة. يرجى تفعيل Storage من Supabase Console."
              : "Supabase Storage is not set up in the project. Order will be sent without receipt link. Please enable Storage from Supabase Console.";
          }
          
          Alert.alert(
            language === "ar" ? "تحذير" : "Warning",
            errorMessage
          );
          receiptUrl = "";
        }
      } else {
        console.log('📦 OrderConfirm: لا حاجة لرفع صورة الإيصال (طريقة الدفع:', paymentMethod, ')');
      }

      console.log('📦 OrderConfirm: إضافة الطلب إلى قاعدة البيانات...');
      
      // تنظيف المنتجات من الحقول undefined
      const cleanedItems = cartItems.map((item: any) => {
        const cleanedItem: any = { ...item };
        // إزالة الحقول التي قيمتها undefined
        Object.keys(cleanedItem).forEach(key => {
          if (cleanedItem[key] === undefined) {
            delete cleanedItem[key];
          }
        });
        return cleanedItem;
      });
      
      const orderData = {
        name,
        phone,
        address,
        paymentMethod,
        receiptUrl: receiptUrl || "",
        items: cleanedItems,
        total: total,
        createdAt: new Date().toISOString(),
      };
      console.log('📦 OrderConfirm: بيانات الطلب:', orderData);
      
      const { data, error } = await dbService.add('orders', orderData);

      if (error) {
        throw error;
      }

      const orderId = data?.[0]?.id || 'unknown';
      console.log('✅ OrderConfirm: تم إضافة الطلب بنجاح! ID:', orderId);

      // مسح السلة بعد إرسال الطلب بنجاح
      clearCart();
      console.log('✅ OrderConfirm: تم مسح السلة');

      // إرسال بيانات الطلب إلى الواتساب
      sendOrderToWhatsApp(orderData, orderId);
      
      Alert.alert(
        "✅",
        language === "ar" ? "تم إرسال الطلب بنجاح!" : "Order submitted successfully!",
        [
          {
            text: language === "ar" ? "حسناً" : "OK",
            onPress: () => {
              // إعادة تعيين الـ navigation stack والانتقال إلى MainTabs
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs" }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ OrderConfirm: خطأ في إرسال الطلب:', error);
      console.error('❌ OrderConfirm: تفاصيل الخطأ:', {
        message: error instanceof Error ? error.message : 'خطأ غير معروف',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = language === "ar" ? "حدث خطأ أثناء إرسال الطلب" : "Error occurred while submitting order";
      
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = language === "ar" 
            ? "حدث خطأ في رفع الصورة. يرجى المحاولة مرة أخرى."
            : "Error uploading image. Please try again.";
        } else if (error.message.includes('firestore') || error.message.includes('network')) {
          errorMessage = language === "ar"
            ? "حدث خطأ في الاتصال. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى."
            : "Connection error. Please check your internet connection and try again.";
        } else {
          errorMessage = language === "ar"
            ? `حدث خطأ: ${error.message}`
            : `Error: ${error.message}`;
        }
      }
      
      Alert.alert(
        "❌",
        errorMessage
      );
    } finally {
      setUploading(false);
      console.log('📦 OrderConfirm: انتهى إرسال الطلب');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "🧾 تأكيد الطلب" : "🧾 Confirm Order"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {language === "ar" ? "معلومات الطلب" : "Order Information"}
        </Text>
        <View style={styles.orderSummary}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>
              {language === "ar" ? "عدد المنتجات:" : "Items:"}
            </Text>
            <Text style={styles.orderValue}>{cartItems.length}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>
              {language === "ar" ? "الإجمالي:" : "Total:"}
            </Text>
            <Text style={[styles.orderValue, styles.totalAmount]}>
              {total.toFixed(2)} {language === "ar" ? "ر.ي" : "YER"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {language === "ar" ? "معلومات الشحن" : "Shipping Information"}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "الاسم الكامل" : "Full Name"}
          value={name}
          onChangeText={setName}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
        />

        <TextInput
          style={styles.input}
          placeholder={language === "ar" ? "رقم الهاتف" : "Phone Number"}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={language === "ar" ? "العنوان / المدينة" : "Address / City"}
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {language === "ar" ? "طريقة الدفع" : "Payment Method"}
        </Text>
        <View style={styles.paymentMethods}>
          {["cash", "transfer", "online"].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentButton,
                paymentMethod === method && styles.activePaymentButton,
              ]}
              onPress={() => {
                console.log('💳 OrderConfirm: تم الضغط على طريقة الدفع:', method);
                setPaymentMethod(method);
                console.log('💳 OrderConfirm: طريقة الدفع الحالية:', method);
              }}
            >
              <Text style={[
                styles.paymentText,
                paymentMethod === method && styles.activePaymentText
              ]}>
                {method === "transfer"
                  ? (language === "ar" ? "🏦 تحويل بنكي" : "🏦 Bank Transfer")
                  : method === "cash"
                  ? (language === "ar" ? "💵 نقدي" : "💵 Cash")
                  : (language === "ar" ? "💳 إلكتروني" : "💳 Online")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {paymentMethod === "transfer" && (
          <View style={styles.receiptSection}>
            <Text style={styles.receiptLabel}>
              {language === "ar" ? "إرفاق إيصال التحويل" : "Attach Transfer Receipt"}
            </Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickReceipt}>
              {receiptImage ? (
                <Image source={{ uri: receiptImage }} style={styles.imagePreview} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="camera" size={32} color={isDarkMode ? "#666" : "#999"} />
                  <Text style={styles.placeholderText}>
                    {language === "ar" ? "اضغط لاختيار صورة" : "Tap to select image"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.section, styles.submitSection]}>
        <Button 
          title={
            uploading 
              ? (language === "ar" ? "⏳ جاري الإرسال..." : "⏳ Sending...")
              : (language === "ar" ? "✅ إرسال الطلب" : "✅ Submit Order")
          } 
          onPress={() => {
            console.log('🖱️ OrderConfirm: تم الضغط على زر الإرسال');
            console.log('🖱️ OrderConfirm: حالة uploading:', uploading);
            console.log('🖱️ OrderConfirm: cartItems:', cartItems.length);
            handleSubmit();
          }} 
          disabled={uploading}
          variant="success"
          block
        />
      </View>
    </ScrollView>
  );
};

const getStyles = (isDarkMode: boolean, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.header,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  section: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.text,
  },
  orderSummary: {
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f8f8f8",
    padding: 16,
    borderRadius: 8,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? "#444" : "#eee",
  },
  orderLabel: {
    fontSize: 16,
    color: isDarkMode ? "#ccc" : "#666",
  },
  orderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: isDarkMode ? "#fff" : "#000",
  },
  totalAmount: {
    fontSize: 20,
    color: "#e91e63",
  },
  input: {
    borderWidth: 1,
    borderColor: isDarkMode ? "#444" : "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: isDarkMode ? "#2a2a2a" : "#fafafa",
    color: isDarkMode ? "#fff" : "#000",
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
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  activePaymentButton: {
    backgroundColor: "#007bff",
  },
  paymentText: {
    color: isDarkMode ? "#ccc" : "#666",
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
    color: isDarkMode ? "#fff" : "#000",
  },
  imagePicker: {
    height: 150,
    backgroundColor: isDarkMode ? "#2a2a2a" : "#f8f8f8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: isDarkMode ? "#444" : "#eee",
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
    color: isDarkMode ? "#666" : "#999",
    marginTop: 8,
  },
  submitSection: {
    // رفع الزر أعلى قليلاً
    marginTop: 10,
  },
});

export default OrderConfirm;