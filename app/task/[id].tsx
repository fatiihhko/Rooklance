import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Card, Button, IconButton, ProgressBar, Chip, Divider, TextInput as PaperTextInput } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { mockAmbassadorTasks } from '../../constants/ambassadorMockData';
import { AmbassadorTask, TaskSubmission } from '../../types/ambassador';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationsModal from '../../components/NotificationsModal';
import * as ImagePicker from 'expo-image-picker';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [urlInputs, setUrlInputs] = useState<{ [key: string]: string }>({});
  const [screenshots, setScreenshots] = useState<{ [key: string]: string }>({});

  // Find task by ID
  const task = mockAmbassadorTasks.find(t => t.id === id);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Görev bulunamadı</Text>
      </View>
    );
  }

  const calculateCompletionPercentage = () => {
    if (!task.deliverables || task.deliverables.length === 0) return 0;
    
    const completedDeliverables = task.deliverables.filter(deliverable => {
      const hasUrl = urlInputs[deliverable] && urlInputs[deliverable].trim() !== '';
      const hasScreenshot = screenshots[deliverable];
      return hasUrl || hasScreenshot;
    });
    
    return Math.round((completedDeliverables.length / task.deliverables.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();
  const isTaskCompletable = completionPercentage === 100;

  const handleUrlChange = (deliverable: string, url: string) => {
    setUrlInputs(prev => ({
      ...prev,
      [deliverable]: url
    }));
  };

  const handleScreenshotUpload = async (deliverable: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setScreenshots(prev => ({
          ...prev,
          [deliverable]: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Hata', 'Ekran görüntüsü yüklenirken bir hata oluştu.');
    }
  };

  const handleRemoveScreenshot = (deliverable: string) => {
    setScreenshots(prev => {
      const newScreenshots = { ...prev };
      delete newScreenshots[deliverable];
      return newScreenshots;
    });
  };

  const handleCompleteTask = () => {
    if (!isTaskCompletable) {
      Alert.alert('Eksik Teslim Edilecekler', 'Tüm teslim edilecekleri tamamlamanız gerekiyor.');
      return;
    }

    Alert.alert(
      'Görevi Tamamla',
      'Görevi tamamlamak istediğinizi onaylıyor musunuz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Tamamla', 
          onPress: () => {
            setIsSubmitting(true);
            // Simulate API call
            setTimeout(() => {
              setIsSubmitting(false);
              Alert.alert(
                'Başarılı!',
                'Görev başarıyla tamamlandı ve panele gönderildi.',
                [{ text: 'Tamam', onPress: () => router.back() }]
              );
            }, 2000);
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + SIZES.spacing.md }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconButton icon="arrow-left" iconColor={COLORS.text} size={24} />
        </TouchableOpacity>
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
    </View>
  );

  const renderTaskOverview = () => (
    <View style={styles.overviewSection}>
      <View style={styles.brandInfo}>
        <Image 
          source={{ uri: task.program?.brand?.logoUrl || 'https://via.placeholder.com/60' }} 
          style={styles.brandLogo} 
        />
        <View style={styles.brandDetails}>
          <Text style={styles.brandName}>{task.program?.brand?.name}</Text>
          <Text style={styles.programTitle}>{task.program?.title}</Text>
        </View>
      </View>

      <Text style={styles.taskTitle}>{task.title}</Text>
      
      <View style={styles.taskMeta}>
        <View style={styles.metaItem}>
          <IconButton icon="currency-try" iconColor={COLORS.success} size={20} />
          <Text style={styles.metaText}>{task.rewardAmount} {task.rewardCurrency}</Text>
        </View>
        <View style={styles.metaItem}>
          <IconButton icon="clock-outline" iconColor={COLORS.warning} size={20} />
          <Text style={styles.metaText}>{task.deadlineDays} gün kaldı</Text>
        </View>
        <View style={styles.metaItem}>
          <IconButton icon="flag" iconColor={COLORS.primary} size={20} />
          <Text style={styles.metaText}>
            {task.priority === 'high' ? 'Yüksek Öncelik' : 'Normal Öncelik'}
          </Text>
        </View>
      </View>

      <View style={styles.taskTypeBadge}>
        <IconButton 
          icon={task.taskType === 'content_creation' ? 'video-outline' : 'share-variant-outline'} 
          iconColor={COLORS.primary} 
          size={16} 
        />
        <Text style={styles.taskTypeText}>
          {task.taskType === 'content_creation' ? 'İçerik Üretimi' : 
           task.taskType === 'social_media' ? 'Sosyal Medya' : 'Ürün İncelemesi'}
        </Text>
      </View>
    </View>
  );

  const renderTaskDescription = () => (
    <Card style={styles.descriptionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Görev Açıklaması</Text>
        <Text style={styles.descriptionText}>{task.description}</Text>
      </Card.Content>
    </Card>
  );

  const renderRequirements = () => (
    <Card style={styles.requirementsCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Gereksinimler</Text>
        {task.requirements?.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <IconButton icon="check-circle" iconColor={COLORS.primary} size={16} />
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderDeliverables = () => (
    <Card style={styles.deliverablesCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Teslim Edilecekler</Text>
        {task.deliverables?.map((deliverable, index) => {
          const hasUrl = urlInputs[deliverable] && urlInputs[deliverable].trim() !== '';
          const hasScreenshot = screenshots[deliverable];
          const isCompleted = hasUrl || hasScreenshot;
          
          return (
            <View key={index} style={styles.deliverableContainer}>
              <View style={styles.deliverableHeader}>
                <IconButton 
                  icon={isCompleted ? "check-circle" : "file-document-outline"} 
                  iconColor={isCompleted ? COLORS.success : COLORS.info} 
                  size={16} 
                />
                <Text style={[styles.deliverableText, isCompleted && styles.completedText]}>
                  {deliverable}
                </Text>
              </View>
              
              <View style={styles.deliverableInputs}>
                {/* URL Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>URL Ekle:</Text>
                  <PaperTextInput
                    mode="outlined"
                    placeholder="İçerik URL'sini buraya yapıştırın"
                    value={urlInputs[deliverable] || ''}
                    onChangeText={(text) => handleUrlChange(deliverable, text)}
                    style={styles.urlInput}
                    outlineStyle={styles.inputOutline}
                  />
                </View>
                
                {/* Screenshot Upload */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Ekran Görüntüsü Ekle:</Text>
                  {screenshots[deliverable] ? (
                    <View style={styles.screenshotContainer}>
                      <Image source={{ uri: screenshots[deliverable] }} style={styles.screenshotImage} />
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveScreenshot(deliverable)}
                      >
                        <IconButton icon="close" iconColor={COLORS.error} size={20} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={() => handleScreenshotUpload(deliverable)}
                    >
                      <IconButton icon="camera" iconColor={COLORS.primary} size={24} />
                      <Text style={styles.uploadButtonText}>Ekran Görüntüsü Yükle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );

  const renderProgress = () => (
    <Card style={styles.progressCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>İlerleme Durumu</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>Tamamlanma Oranı</Text>
          <Text style={styles.progressPercent}>{completionPercentage}%</Text>
        </View>
        <ProgressBar 
          progress={completionPercentage / 100} 
          color={COLORS.primary} 
          style={styles.progressBar}
        />
        <Text style={styles.progressStatus}>
          {completionPercentage === 0 ? 'Henüz başlanmadı' :
           completionPercentage === 100 ? 'Tüm teslim edilecekler tamamlandı' :
           `${task.deliverables?.length - Math.round((completionPercentage / 100) * (task.deliverables?.length || 0))} teslim edilecek kaldı`}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      {isTaskCompletable ? (
        <Button
          mode="contained"
          onPress={handleCompleteTask}
          style={styles.completeButton}
          labelStyle={styles.completeButtonText}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Görevi Tamamla'}
        </Button>
      ) : (
        <View style={styles.incompleteMessage}>
          <IconButton icon="information" iconColor={COLORS.warning} size={24} />
          <Text style={styles.incompleteText}>
            Görevi tamamlamak için tüm teslim edilecekleri doldurmanız gerekiyor.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTaskOverview()}
        {renderTaskDescription()}
        {renderRequirements()}
        {renderDeliverables()}
        {renderProgress()}
        {renderActions()}
      </ScrollView>

      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
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
  content: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radius.xl,
    borderTopRightRadius: SIZES.radius.xl,
    marginTop: -SIZES.radius.xl,
    paddingTop: SIZES.spacing.lg,
  },
  overviewSection: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius.md,
    marginRight: SIZES.spacing.md,
  },
  brandDetails: {
    flex: 1,
  },
  brandName: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  programTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  taskTitle: {
    fontSize: SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.lg,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: -SIZES.spacing.xs,
  },
  taskTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    alignSelf: 'flex-start',
  },
  taskTypeText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: -SIZES.spacing.xs,
  },
  descriptionCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  requirementsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  deliverablesCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  descriptionText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  requirementText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
    marginLeft: -SIZES.spacing.xs,
  },
  deliverableContainer: {
    marginBottom: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  deliverableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  deliverableText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    flex: 1,
    marginLeft: -SIZES.spacing.xs,
  },
  completedText: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  deliverableInputs: {
    gap: SIZES.spacing.md,
  },
  inputContainer: {
    gap: SIZES.spacing.xs,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SIZES.spacing.md,
  },
  urlInput: {
    backgroundColor: COLORS.surface,
  },
  inputOutline: {
    borderRadius: SIZES.radius.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: SIZES.spacing.sm,
  },
  screenshotContainer: {
    position: 'relative',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.md,
    overflow: 'hidden',
  },
  screenshotImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: SIZES.spacing.xs,
    right: SIZES.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
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
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: SIZES.spacing.sm,
  },
  progressStatus: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
    gap: SIZES.spacing.md,
  },
  completeButton: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
  },
  completeButtonText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
  },
  incompleteMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  incompleteText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
    marginLeft: SIZES.spacing.sm,
  },
  errorText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SIZES.spacing.xxl,
  },
});


