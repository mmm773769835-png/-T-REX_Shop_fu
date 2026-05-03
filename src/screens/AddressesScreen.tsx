import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Input from "../shared/components/Input";
import Button from "../shared/components/Button";
import { LanguageContext } from '../contexts/LanguageContext';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

const AddressesScreen = ({ navigation }: any) => {
  const { language } = useContext(LanguageContext);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "المنزل",
      phone: "+967773769835",
      address: "العاصمة",
      city: "صنعاء",
      isDefault: true,
    },
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      city: '',
    });
    setModalVisible(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
    });
    setModalVisible(true);
  };

  const handleSaveAddress = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    
    if (editingAddress) {
      // تحديث العنوان الموجود
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...formData }
          : addr
      ));
    } else {
      // إضافة عنوان جديد
      const newAddress: Address = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        isDefault: addresses.length === 0, // أول عنوان يكون افتراضي
      };
      setAddresses([...addresses, newAddress]);
    }
    
    setModalVisible(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      language === 'ar' ? "حذف العنوان" : "Delete Address",
      language === 'ar' ? "هل أنت متأكد من حذف هذا العنوان؟" : "Are you sure you want to delete this address?",
      [
        { text: language === 'ar' ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: language === 'ar' ? "حذف" : "Delete",
          style: "destructive",
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== id));
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{language === 'ar' ? '📍 عناويني' : '📍 My Addresses'}</Text>
        <TouchableOpacity onPress={handleAddAddress}>
          <Ionicons name="add-circle" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}</Text>
            <Text style={styles.emptySubtext}>{language === 'ar' ? 'أضف عنوانك الأول الآن' : 'Add your first address now'}</Text>
            <Button 
              title={language === 'ar' ? "إضافة عنوان جديد" : "Add New Address"} 
              onPress={handleAddAddress} 
              style={{marginTop: 20}}
            />
          </View>
        ) : (
          addresses.map(address => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTitle}>
                  <Ionicons name="location" size={20} color="#007bff" />
                  <Text style={styles.addressName}>{address.name}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>{language === 'ar' ? "افتراضي" : "Default"}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteAddress(address.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.addressDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{address.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="home-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{address.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="business-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{address.city}</Text>
                </View>
              </View>

              <View style={styles.addressActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditAddress(address)}
                >
                  <Text style={styles.actionButtonText}>{language === 'ar' ? "تعديل" : "Edit"}</Text>
                </TouchableOpacity>
                {!address.isDefault && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                      {language === 'ar' ? "جعله افتراضي" : "Set as Default"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={language === 'ar' ? "إضافة عنوان جديد +" : "Add New Address +"} onPress={handleAddAddress} />
      </View>

      {/* Modal for adding/editing address */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? (language === 'ar' ? 'تعديل العنوان' : 'Edit Address') : (language === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Input
                label={language === 'ar' ? "اسم العنوان" : "Address Name"}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder={language === 'ar' ? "مثال: المنزل، العمل" : "e.g., Home, Work"}
              />
              
              <Input
                label={language === 'ar' ? "رقم الهاتف" : "Phone Number"}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="+967..."
                keyboardType="phone-pad"
              />
              
              <Input
                label={language === 'ar' ? "العنوان التفصيلي" : "Detailed Address"}
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
                placeholder={language === 'ar' ? "الشارع، الرقم، إلخ" : "Street, Number, etc."}
                multiline
                numberOfLines={3}
              />
              
              <Input
                label={language === 'ar' ? "المدينة" : "City"}
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
                placeholder={language === 'ar' ? "صنعاء، عدن، إلخ" : "Sana'a, Aden, etc."}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <Button 
                title={language === 'ar' ? "إلغاء" : "Cancel"} 
                variant="outline" 
                onPress={() => setModalVisible(false)} 
                style={{flex: 1, marginRight: 8}}
              />
              <Button 
                title={language === 'ar' ? "حفظ" : "Save"} 
                onPress={handleSaveAddress} 
                style={{flex: 1, marginLeft: 8}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
  },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 12,
    color: "#4caf50",
    fontWeight: "bold",
  },
  addressDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007bff",
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "bold",
  },
  primaryButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  primaryButtonText: {
    color: "#fff",
  },
  footer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default AddressesScreen;
