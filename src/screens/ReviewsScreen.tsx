import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useReviews } from '../contexts/ReviewsContext';
import { useAuth } from '../contexts/AuthContext';

const ReviewsScreen = ({ route, navigation }: any) => {
  const { product } = route.params;
  const { isDarkMode, colors } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { state, loadReviews, addReview, deleteReview, getAverageRating } = useReviews();
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);

  const styles = getStyles(isDarkMode, colors);

  // Load reviews when component mounts
  React.useEffect(() => {
    if (product) {
      loadReviews(product.id);
    }
  }, [product]);

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        setSelectedImages([...selectedImages, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "فشل في اختيار الصور" : "Failed to pick images"
      );
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedVideo(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "فشل في اختيار الفيديو" : "Failed to pick video"
      );
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى اختيار تقييم" : "Please select a rating"
      );
      return;
    }

    if (!comment.trim()) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يرجى كتابة تعليق" : "Please write a comment"
      );
      return;
    }

    if (!user) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "يجب تسجيل الدخول لإضافة مراجعة" : "You must login to add a review"
      );
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || "مستخدم",
        rating,
        comment,
      };

      const imageFiles = selectedImages.map(img => {
        return new File([img.uri], 'image.jpg', { type: 'image/jpeg' });
      });

      const videoFile = selectedVideo ? new File([selectedVideo.uri], 'video.mp4', { type: 'video/mp4' }) : undefined;

      await addReview(reviewData, imageFiles, videoFile);
      
      // Reset form
      setRating(0);
      setComment("");
      setSelectedImages([]);
      setSelectedVideo(null);
      setShowAddReview(false);

      Alert.alert(
        language === "ar" ? "✅ تم الإضافة" : "✅ Added",
        language === "ar" ? "تم إضافة مراجعتك بنجاح" : "Your review has been added successfully"
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "فشل في إضافة المراجعة" : "Failed to add review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      language === "ar" ? "حذف المراجعة" : "Delete Review",
      language === "ar" ? "هل أنت متأكد من حذف هذه المراجعة؟" : "Are you sure you want to delete this review?",
      [
        { text: language === "ar" ? "إلغاء" : "Cancel", style: "cancel" },
        {
          text: language === "ar" ? "حذف" : "Delete",
          style: "destructive",
          onPress: () => deleteReview(reviewId)
        }
      ]
    );
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= currentRating ? "star" : "star-outline"}
              size={interactive ? 32 : 20}
              color={star <= currentRating ? "#FFD700" : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const averageRating = getAverageRating(product.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {language === "ar" ? "⭐ المراجعات" : "⭐ Reviews"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Average Rating */}
        <View style={styles.averageRatingContainer}>
          <Text style={styles.averageRatingText}>{averageRating.toFixed(1)}</Text>
          {renderStars(Math.round(averageRating))}
          <Text style={styles.reviewCount}>
            {state.reviews.length} {language === "ar" ? "مراجعة" : "reviews"}
          </Text>
        </View>

        {/* Add Review Button */}
        {!showAddReview && (
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowAddReview(true)}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addReviewButtonText}>
              {language === "ar" ? "إضافة مراجعة" : "Add Review"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Add Review Form */}
        {showAddReview && (
          <View style={styles.addReviewForm}>
            <Text style={styles.formTitle}>
              {language === "ar" ? "أضف مراجعتك" : "Add Your Review"}
            </Text>
            
            {renderStars(rating, true)}
            
            <Text style={styles.label}>
              {language === "ar" ? "التقييم" : "Rating"}
            </Text>

            <Text style={styles.label}>
              {language === "ar" ? "التعليق" : "Comment"}
            </Text>
            <TextInput
              style={styles.commentInput}
              placeholder={language === "ar" ? "اكتب تعليقك هنا..." : "Write your comment here..."}
              placeholderTextColor={colors.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.mediaButton} onPress={handlePickImages}>
                <Ionicons name="images" size={24} color="#007bff" />
                <Text style={styles.mediaButtonText}>
                  {language === "ar" ? "صور" : "Images"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mediaButton} onPress={handlePickVideo}>
                <Ionicons name="videocam" size={24} color="#007bff" />
                <Text style={styles.mediaButtonText}>
                  {language === "ar" ? "فيديو" : "Video"}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                <Text style={styles.selectedImagesTitle}>
                  {language === "ar" ? "الصور المختارة" : "Selected Images"}
                </Text>
                <ScrollView horizontal>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.selectedImageWrapper}>
                      <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                      >
                        <Ionicons name="close-circle" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {selectedVideo && (
              <View style={styles.selectedVideoContainer}>
                <Text style={styles.selectedVideoTitle}>
                  {language === "ar" ? "الفيديو المختار" : "Selected Video"}
                </Text>
                <View style={styles.selectedVideoWrapper}>
                  <Ionicons name="videocam" size={40} color="#007bff" />
                  <TouchableOpacity
                    style={styles.removeVideoButton}
                    onPress={() => setSelectedVideo(null)}
                  >
                    <Ionicons name="close-circle" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={() => setShowAddReview(false)}
              >
                <Text style={styles.cancelButtonText}>
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.formButton, styles.submitButton]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {language === "ar" ? "إرسال" : "Submit"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews List */}
        {state.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </Text>
          </View>
        ) : state.reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={80} color={isDarkMode ? "#666" : "#ccc"} />
            <Text style={styles.emptyTitle}>
              {language === "ar" ? "لا توجد مراجعات" : "No reviews yet"}
            </Text>
            <Text style={styles.emptyText}>
              {language === "ar" ? "كن أول من يراجع هذا المنتج" : "Be the first to review this product"}
            </Text>
          </View>
        ) : (
          state.reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUserName}>{review.userName}</Text>
                {renderStars(review.rating)}
                <Text style={styles.reviewDate}>
                  {review.createdAt.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                </Text>
              </View>
              
              <Text style={styles.reviewComment}>{review.comment}</Text>
              
              {review.images && review.images.length > 0 && (
                <ScrollView horizontal style={styles.reviewImagesContainer}>
                  {review.images.map((imageUrl, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageUrl }}
                      style={styles.reviewImage}
                    />
                  ))}
                </ScrollView>
              )}
              
              {review.video && (
                <View style={styles.reviewVideoContainer}>
                  <Ionicons name="play-circle" size={40} color="#007bff" />
                  <Text style={styles.reviewVideoText}>
                    {language === "ar" ? "فيديو" : "Video"}
                  </Text>
                </View>
              )}

              {user && user.uid === review.userId && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReview(review.id)}
                >
                  <Ionicons name="trash" size={20} color="#ff4444" />
                  <Text style={styles.deleteButtonText}>
                    {language === "ar" ? "حذف" : "Delete"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  averageRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  averageRatingText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: "row",
  },
  starButton: {
    marginHorizontal: 2,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addReviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  addReviewForm: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  commentInput: {
    fontSize: 16,
    color: colors.text,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 80,
  },
  mediaButtons: {
    flexDirection: "row",
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  mediaButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  selectedImagesContainer: {
    marginBottom: 16,
  },
  selectedImagesTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectedImageWrapper: {
    position: "relative",
    marginRight: 8,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  selectedVideoContainer: {
    marginBottom: 16,
  },
  selectedVideoTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectedVideoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  removeVideoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  formButtons: {
    flexDirection: "row",
    gap: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#007bff",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  reviewItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginRight: 12,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: "auto",
  },
  reviewComment: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  reviewImagesContainer: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewVideoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewVideoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#ff4444",
    marginLeft: 8,
  },
});

export default ReviewsScreen;
