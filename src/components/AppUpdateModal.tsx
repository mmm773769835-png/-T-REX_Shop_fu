import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  BackHandler,
  Platform
} from 'react-native';
import SystemMonitorService, { AppUpdateInfo } from '../services/SystemMonitorService';

export default function AppUpdateModal() {
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // الاستماع للتحديثات المتاحة
    const unsubscribe = SystemMonitorService.onUpdateAvailable((newUpdate) => {
      if (newUpdate) {
        setUpdate(newUpdate);
        setVisible(true);
      } else {
        setVisible(false);
      }
    });

    // فحص أولي عند فتح المكون
    SystemMonitorService.checkLatestUpdate();
    SystemMonitorService.initUpdateRealtimeListener();

    return () => {
      unsubscribe();
    };
  }, []);

  // منع زر الرجوع في أندرويد في حالة التحديث الإجباري
  useEffect(() => {
    if (visible && update?.is_force_update) {
      const onBackPress = () => true; // يمنع الرجوع
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }
  }, [visible, update?.is_force_update]);

  if (!visible || !update) {
    return null;
  }

  const handleUpdatePress = async () => {
    try {
      if (update.download_url) {
        const canOpen = await Linking.canOpenURL(update.download_url);
        if (canOpen) {
          await Linking.openURL(update.download_url);
        } else {
          await Linking.openURL(update.download_url);
        }
      }
    } catch (e) {
      console.warn('Could not open update URL:', e);
    }
  };

  const handleDismiss = () => {
    if (!update.is_force_update) {
      setVisible(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Icon & Title */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, update.is_force_update && styles.iconCircleForce]}>
              <Text style={styles.iconText}>
                {update.is_force_update ? '🔒' : '🚀'}
              </Text>
            </View>
            <Text style={styles.badgeText}>
              {update.is_force_update ? 'تحديث إجباري هام' : 'تحديث جديد متوفر'} • v{update.version_name}
            </Text>
            <Text style={styles.titleText}>{update.title}</Text>
          </View>

          {/* Changelog Message */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionHeader}>ما الجديد في هذا التحديث:</Text>
            <Text style={styles.messageText}>{update.message}</Text>

            {update.is_force_update && (
              <View style={styles.forceNoticeBox}>
                <Text style={styles.forceNoticeText}>
                  ⚠️ هذا التحديث ضروري لمتابعة استخدام التطبيق والتمتع بأحدث المزايا الأمنية.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnUpdate}
              onPress={handleUpdatePress}
              activeOpacity={0.85}
            >
              <Text style={styles.btnUpdateText}>🚀 تحديث الآن</Text>
            </TouchableOpacity>

            {!update.is_force_update && (
              <TouchableOpacity
                style={styles.btnLater}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.btnLaterText}>لاحقاً</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#141820',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    padding: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    marginBottom: 12,
  },
  iconCircleForce: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    borderColor: '#ff3366',
  },
  iconText: {
    fontSize: 30,
  },
  badgeText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 25,
  },
  body: {
    maxHeight: 220,
    marginVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 14,
  },
  sectionHeader: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  messageText: {
    color: '#f0f4fc',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  forceNoticeBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 51, 102, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 102, 0.3)',
  },
  forceNoticeText: {
    color: '#ff6688',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  footer: {
    marginTop: 16,
    gap: 10,
  },
  btnUpdate: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnUpdateText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnLater: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnLaterText: {
    color: '#8b9bb4',
    fontSize: 14,
    fontWeight: '600',
  },
});
