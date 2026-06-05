import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

interface PickImageOptions {
  language?: string;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  maxImages?: number;
  currentCount?: number;
}

/**
 * Requests media library permission and launches the image picker.
 * Returns the selected image URI or null if cancelled/denied.
 */
export const pickImageFromLibrary = async (
  options: PickImageOptions = {}
): Promise<string | null> => {
  const {
    language = "en",
    allowsEditing = true,
    aspect = [1, 1],
    quality = 0.8,
    maxImages,
    currentCount = 0,
  } = options;

  try {
    if (maxImages !== undefined && currentCount >= maxImages) {
      Alert.alert(
        language === "ar" ? "تنبيه" : "Warning",
        language === "ar"
          ? `الحد الأقصى للصور هو ${maxImages} صور`
          : `Maximum ${maxImages} images allowed`
      );
      return null;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar"
          ? "نحتاج إلى إذن للوصول إلى المعرض"
          : "We need permission to access the gallery"
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert(
      language === "ar" ? "خطأ" : "Error",
      language === "ar"
        ? "فشل في اختيار الصورة. يرجى المحاولة مرة أخرى."
        : "Failed to select image. Please try again."
    );
    return null;
  }
};

/**
 * Uploads an image blob to Supabase storage and returns the public URL.
 * Falls back to the provided default URL on failure.
 */
export const uploadImageToStorage = async (
  imageUri: string,
  storageService: any,
  bucket: string,
  path: string,
  fallbackUrl: string
): Promise<string> => {
  try {
    if (!imageUri || imageUri.startsWith("http")) {
      return imageUri || fallbackUrl;
    }

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const { data, error } = await storageService.upload(bucket, path, blob);

    if (error) {
      console.error(`Error uploading image to ${bucket}/${path}:`, error);
      return fallbackUrl;
    }

    return storageService.getPublicUrl(bucket, path);
  } catch (error) {
    console.error(`Error uploading image to ${bucket}/${path}:`, error);
    return fallbackUrl;
  }
};
