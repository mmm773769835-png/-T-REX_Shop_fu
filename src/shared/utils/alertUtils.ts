import { Alert, AlertButton } from "react-native";

type Language = string;

/**
 * Shows a localized alert with bilingual title/message (Arabic/English).
 */
export const showLocalizedAlert = (
  language: Language,
  titleAr: string,
  titleEn: string,
  messageAr: string,
  messageEn: string,
  buttons?: AlertButton[]
) => {
  Alert.alert(
    language === "ar" ? titleAr : titleEn,
    language === "ar" ? messageAr : messageEn,
    buttons
  );
};

/**
 * Shows a localized error alert.
 */
export const showErrorAlert = (
  language: Language,
  messageAr: string,
  messageEn: string,
  buttons?: AlertButton[]
) => {
  showLocalizedAlert(language, "خطأ", "Error", messageAr, messageEn, buttons);
};

/**
 * Shows a localized success alert.
 */
export const showSuccessAlert = (
  language: Language,
  messageAr: string,
  messageEn: string,
  buttons?: AlertButton[]
) => {
  showLocalizedAlert(language, "نجاح", "Success", messageAr, messageEn, buttons);
};

/**
 * Shows a localized warning alert.
 */
export const showWarningAlert = (
  language: Language,
  messageAr: string,
  messageEn: string,
  buttons?: AlertButton[]
) => {
  showLocalizedAlert(language, "تحذير", "Warning", messageAr, messageEn, buttons);
};

/**
 * Shows a localized confirmation dialog with Cancel + Confirm buttons.
 */
export const showConfirmAlert = (
  language: Language,
  titleAr: string,
  titleEn: string,
  messageAr: string,
  messageEn: string,
  onConfirm: () => void,
  confirmTextAr: string = "تأكيد",
  confirmTextEn: string = "Confirm"
) => {
  Alert.alert(
    language === "ar" ? titleAr : titleEn,
    language === "ar" ? messageAr : messageEn,
    [
      { text: language === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
      { text: language === "ar" ? confirmTextAr : confirmTextEn, onPress: onConfirm },
    ]
  );
};
