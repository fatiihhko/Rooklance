import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { IconButton, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { mockNotifications } from '../constants/mockData';
import { Notification, NotificationType } from '../types';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'application_accepted':
      return 'check-circle';
    case 'application_rejected':
      return 'close-circle';
    case 'new_invitation':
      return 'email-outline';
    case 'campaign_deadline':
      return 'clock-outline';
    case 'payment_received':
      return 'cash';
    case 'new_campaign':
      return 'plus-circle';
    default:
      return 'bell';
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'application_accepted':
      return COLORS.success;
    case 'application_rejected':
      return COLORS.error;
    case 'new_invitation':
      return COLORS.primary;
    case 'campaign_deadline':
      return COLORS.warning;
    case 'payment_received':
      return COLORS.success;
    case 'new_campaign':
      return COLORS.info;
    default:
      return COLORS.textSecondary;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Şimdi';
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;
  
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const NotificationItem = ({ 
  notification, 
  onPress 
}: { 
  notification: Notification; 
  onPress: (notification: Notification) => void;
}) => (
  <TouchableOpacity
    style={[
      styles.notificationItem,
      !notification.isRead && styles.unreadNotification
    ]}
    onPress={() => onPress(notification)}
    activeOpacity={0.7}
  >
    <View style={styles.notificationIcon}>
      <IconButton
        icon={getNotificationIcon(notification.type)}
        iconColor={getNotificationColor(notification.type)}
        size={24}
        style={styles.iconButton}
      />
      {!notification.isRead && <View style={styles.unreadDot} />}
    </View>
    
    <View style={styles.notificationContent}>
      <Text style={styles.notificationTitle} numberOfLines={1}>
        {notification.title}
      </Text>
      <Text style={styles.notificationMessage} numberOfLines={2}>
        {notification.message}
      </Text>
      <Text style={styles.notificationTime}>
        {formatTimeAgo(notification.createdAt)}
      </Text>
    </View>
    
    <IconButton
      icon="chevron-right"
      iconColor={COLORS.textSecondary}
      size={20}
      style={styles.chevronIcon}
    />
  </TouchableOpacity>
);

export default function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate based on notification type
    if (notification.data?.campaignId) {
      router.push(`/campaign/${notification.data.campaignId}`);
      onClose();
    } else {
      Alert.alert('Bildirim', notification.message);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Bildirimler</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                <Text style={styles.markAllText}>Tümünü Okundu İşaretle</Text>
              </TouchableOpacity>
            )}
            <IconButton
              icon="close"
              iconColor={COLORS.text}
              size={24}
              onPress={onClose}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <Divider style={styles.itemDivider} />}
        />

        {/* Empty State */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <IconButton
              icon="bell-off"
              iconColor={COLORS.textSecondary}
              size={48}
            />
            <Text style={styles.emptyStateTitle}>Henüz bildiriminiz yok</Text>
            <Text style={styles.emptyStateMessage}>
              Yeni kampanyalar ve güncellemeler burada görünecek
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.spacing.sm,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontFamily: FONTS.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: SIZES.spacing.sm,
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  divider: {
    backgroundColor: COLORS.surfaceLight,
  },
  listContainer: {
    paddingBottom: SIZES.spacing.xxl,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
  },
  unreadNotification: {
    backgroundColor: COLORS.surfaceLight,
  },
  notificationIcon: {
    position: 'relative',
    marginRight: SIZES.spacing.md,
  },
  iconButton: {
    margin: 0,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  notificationMessage: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  chevronIcon: {
    margin: 0,
  },
  itemDivider: {
    backgroundColor: COLORS.surfaceLight,
    marginLeft: SIZES.spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm,
  },
  emptyStateMessage: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
