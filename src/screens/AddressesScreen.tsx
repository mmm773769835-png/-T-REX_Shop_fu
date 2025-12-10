import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Input from "../shared/components/Input";
import Button from "../shared/components/Button";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

const AddressesScreen = ({ navigation }: any) => {
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

  const handleAddAddress = () => {
    Alert.alert("إضافة عنوان", "سيتم إضافة عنوان جديد");
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      "حذف العنوان",
      "هل أنت متأكد من حذف هذا العنوان؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== id));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>📍 عناويني</Text>
        <TouchableOpacity onPress={handleAddAddress}>
          <Ionicons name="add-circle" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد عناوين محفوظة</Text>
            <Text style={styles.emptySubtext}>أضف عنوانك الأول الآن</Text>
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
                      <Text style={styles.defaultText}>افتراضي</Text>
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
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>تعديل</Text>
                </TouchableOpacity>
                {!address.isDefault && (
                  <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                    <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                      جعله افتراضي
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="إضافة عنوان جديد +" onPress={handleAddAddress} />
      </View>
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
});

export default AddressesScreen;
