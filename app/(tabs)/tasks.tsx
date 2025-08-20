import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Card, Button, IconButton, ProgressBar, Chip, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockAmbassadorTasks } from '../../constants/ambassadorMockData';
import { AmbassadorTask } from '../../types/ambassador';
import NotificationsModal from '../../components/NotificationsModal';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<AmbassadorTask | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Filtrelenmiş görevler
  const filteredTasks = mockAmbassadorTasks.filter(task => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return task.status === 'active';
    if (selectedFilter === 'completed') return task.status === 'completed';
    return true;
  });

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + SIZES.spacing.md }]}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
      </View>
      <View style={styles.headerIcons}>
        <View style={styles.notificationButton}>
          <IconButton
            icon="bell"
            iconColor={COLORS.text}
            size={24}
            onPress={() => setNotificationsVisible(true)}
          />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </View>
      </View>
    </View>
  );



  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            Tümü ({mockAmbassadorTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, selectedFilter === 'active' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('active')}
        >
          <Text style={[styles.filterText, selectedFilter === 'active' && styles.filterTextActive]}>
            Aktif ({mockAmbassadorTasks.filter(t => t.status === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, selectedFilter === 'completed' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('completed')}
        >
          <Text style={[styles.filterText, selectedFilter === 'completed' && styles.filterTextActive]}>
            Tamamlanan ({mockAmbassadorTasks.filter(t => t.status === 'completed').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderTaskCard = ({ item }: { item: AmbassadorTask }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => router.push(`/task/${item.id}`)}
    >
      <View style={styles.taskCardHeader}>
        <View style={styles.taskCardLeft}>
          <Image 
            source={{ uri: item.program?.brand?.logoUrl || 'https://via.placeholder.com/40' }} 
            style={styles.brandLogo} 
          />
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.brandName}>{item.program?.brand?.name}</Text>
          </View>
        </View>
        <View style={styles.taskCardRight}>
          <Text style={styles.rewardAmount}>{item.rewardAmount}{item.rewardCurrency}</Text>
        </View>
      </View>

      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.taskFooter}>
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <IconButton icon="clock-outline" size={16} iconColor={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.deadlineDays} gün kaldı</Text>
          </View>
          <View style={styles.metaItem}>
            <IconButton icon="video-outline" size={16} iconColor={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.taskType === 'content_creation' ? 'İçerik Üretimi' : 'Sosyal Medya'}</Text>
          </View>
        </View>
        
        <View style={styles.taskProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>İlerleme</Text>
            <Text style={styles.progressPercent}>{item.completionPercentage || 0}%</Text>
          </View>
          <ProgressBar 
            progress={(item.completionPercentage || 0) / 100} 
            color={COLORS.primary} 
            style={styles.progressBar}
          />
        </View>

        <View style={styles.taskActions}>
          <Button 
            mode="contained" 
            style={[
              styles.actionButton,
              (item.completionPercentage || 0) === 100 && styles.completeButton
            ]}
            labelStyle={styles.actionButtonText}
            onPress={() => router.push(`/task/${item.id}`)}
          >
            {(item.completionPercentage || 0) === 100 ? 'Görevi Tamamla' : 'Detayları Gör'}
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton icon="clipboard-text-outline" size={64} iconColor={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Henüz görev yok</Text>
      <Text style={styles.emptySubtitle}>
        Aktif kampanyalara katılarak görevler alabilir ve kazanç elde edebilirsiniz
      </Text>
      <Button 
        mode="contained" 
        style={styles.emptyButton}
        onPress={() => router.push('/')}
      >
        Kampanyaları Keşfet
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
      <NotificationsModal visible={notificationsVisible} onClose={() => setNotificationsVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
     header: {
     backgroundColor: COLORS.background,
     paddingHorizontal: SIZES.spacing.lg,
     paddingBottom: SIZES.spacing.md,
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
     logoContainer: {
     flexDirection: 'row',
     alignItems: 'center',
   },
   logoImage: {
     width: 120,
     height: 30,
     resizeMode: 'contain',
   },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
  },
     notificationBadge: {
     position: 'absolute',
     top: 4,
     right: 4,
     backgroundColor: COLORS.primary,
     borderRadius: 10,
     minWidth: 20,
     height: 20,
     alignItems: 'center',
     justifyContent: 'center',
     zIndex: 1,
   },
  notificationBadgeText: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontFamily: FONTS.bold,
  },
     
  filtersContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.background,
  },
  filterChip: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.lg,
    marginRight: SIZES.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.text,
  },
  taskList: {
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    ...SHADOWS.medium,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.md,
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radius.md,
    marginRight: SIZES.spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  brandName: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  taskCardRight: {
    alignItems: 'flex-end',
  },
  rewardAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.success,
    marginBottom: SIZES.spacing.xs,
  },

  taskDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.spacing.lg,
  },
  taskFooter: {
    gap: SIZES.spacing.md,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: -SIZES.spacing.xs,
  },
  taskProgress: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  progressText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLight,
  },
  taskActions: {
    marginTop: SIZES.spacing.sm,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxl,
  },
  emptyTitle: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.xl,
  },
});

