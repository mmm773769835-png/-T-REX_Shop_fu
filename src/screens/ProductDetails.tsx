import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProductDetails({ route, navigation }: any) {
  const { product } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>تفاصيل المنتج</Text>
        <View style={{ width: 24 }} />
      </View>

      <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price.toFixed(2)} ر.س</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        
        {product.category && (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{product.category}</Text>
          </View>
        )}
        
        {product.attribute && (
          <View style={[styles.chip, styles.attributeChip]}>
            <Text style={styles.chipText}>{product.attribute}</Text>
          </View>
        )}
        
        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>طرق الدفع المتاحة:</Text>
          <View style={styles.paymentChips}>
            {product.paymentMethod === 'cash' && (
              <View style={[styles.chip, styles.paymentChip]}>
                <Text style={styles.chipText}>نقداً</Text>
              </View>
            )}
            {product.paymentMethod === 'card' && (
              <View style={[styles.chip, styles.paymentChip]}>
                <Text style={styles.chipText}>بطاقة</Text>
              </View>
            )}
            {product.paymentMethod === 'transfer' && (
              <View style={[styles.chip, styles.paymentChip]}>
                <Text style={styles.chipText}>تحويل</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

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
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: "#007bff",
    fontWeight: "bold",
    marginBottom: 16,
  },
  productDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  attributeChip: {
    backgroundColor: "#28a745",
  },
  paymentChip: {
    backgroundColor: "#ffc107",
    marginRight: 8,
  },
  chipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  paymentMethods: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  paymentChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});