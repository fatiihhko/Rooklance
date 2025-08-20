import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Card, Button, IconButton, ProgressBar, Chip, Divider } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { mockCampaigns } from '../../constants/mockData';
import { Campaign } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationsModal from '../../components/NotificationsModal';

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urls, setUrls] = useState<string[]>(['']);
  const [screenshot, setScreenshot] = useState('');
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Find campaign by ID
  const campaign = mockCampaigns.find(c => c.id === id);

  if (!campaign) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Kampanya bulunamadı</Text>
      </View>
    );
  }

  const handleSubmitApplication = () => {
    const validUrls = urls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir sosyal medya URL\'si ekleyin.');
      return;
    }
    
    if (!screenshot) {
      Alert.alert('Hata', 'Lütfen ekran görüntüsü ekleyin.');
      return;
    }

    Alert.alert(
      'Başvuruyu Gönder',
      'Bu kampanyaya başvurduğunuzu onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Başvur', 
          onPress: () => {
            setIsSubmitting(true);
            // Simulate API call
            setTimeout(() => {
              setIsSubmitting(false);
              Alert.alert(
                'Başarılı!',
                'Başvurunuz başarıyla gönderildi. Marka tarafından incelenecek ve size haber verilecektir.',
                [{ text: 'Tamam', onPress: () => router.back() }]
              );
            }, 2000);
          }
        }
      ]
    );
  };

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleRemoveUrl = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleAddScreenshot = () => {
    Alert.alert(
      'Ekran Görüntüsü Ekle',
      'Ekran görüntüsü eklemek için galeriden seçin veya kamera ile çekin.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeri', onPress: () => setScreenshot('screenshot_added') },
        { text: 'Kamera', onPress: () => setScreenshot('screenshot_added') }
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

  const renderCampaignOverview = () => (
    <View style={styles.overviewSection}>
      <Image source={{ uri: campaign.imageUrl }} style={styles.campaignImage} />
      
      {campaign.isSpecialInvitation && (
        <View style={styles.specialInvitationTag}>
          <IconButton icon="star" iconColor={COLORS.text} size={16} />
          <Text style={styles.specialInvitationText}>Özel Davet</Text>
        </View>
      )}

      <View style={styles.brandInfo}>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>{campaign.brand}</Text>
        </View>
      </View>

      <Text style={styles.campaignTitle}>{campaign.title}</Text>
      
      <View style={styles.platformIcons}>
        {campaign.platforms.map((platform) => (
          <View key={platform} style={styles.platformBadge}>
            <IconButton 
              icon={
                platform === 'instagram' ? 'instagram' : 
                platform === 'tiktok' ? 'music-note' : 
                platform === 'linkedin' ? 'linkedin' : 
                'youtube'
              }
              iconColor={
                platform === 'instagram' ? COLORS.instagram : 
                platform === 'tiktok' ? COLORS.tiktok : 
                platform === 'linkedin' ? '#0077B5' : 
                COLORS.youtube
              }
              size={16}
              style={{ margin: 0 }}
            />
          </View>
        ))}
      </View>
          
      <View style={styles.campaignMeta}>
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>Bütçe</Text>
          <Text style={styles.budgetAmount}>
            {campaign.budget.toLocaleString()} {campaign.budgetCurrency}
            </Text>
          </View>
          
        <View style={styles.requirementsContainer}>
          <IconButton icon="account-group" iconColor="#FFD54F" size={16} />
          <Text style={styles.requirementText}>Min {campaign.minFollowers.toLocaleString()} takipçi</Text>
          </View>
          
        <View style={styles.deadlineContainer}>
          <IconButton icon="calendar" iconColor="#FFD54F" size={16} />
          <Text style={styles.deadlineText}>
            {campaign.deadline.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>
    </View>
  );

  const renderCampaignDetails = () => (
    <Card style={styles.detailsCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Kampanya Açıklaması</Text>
        <Text style={styles.descriptionText}>{campaign.description}</Text>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Gereksinimler</Text>
        {campaign.requirements?.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <IconButton icon="check" iconColor={COLORS.primary} size={16} />
            <Text style={styles.requirementItemText}>{requirement}</Text>
          </View>
        ))}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Örnek İçerikler</Text>
        {campaign.exampleContent?.map((content, index) => (
          <View key={index} style={styles.deliverableItem}>
            <IconButton icon="lightbulb-outline" iconColor={COLORS.info} size={16} />
            <Text style={styles.deliverableText}>{content}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderApplicationSection = () => (
    <Card style={styles.submissionCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Kampanya Başvurusu</Text>
        
        <View style={styles.submissionInfo}>
          <View style={styles.submissionItem}>
            <IconButton icon="upload" iconColor={COLORS.primary} size={20} />
            <Text style={styles.submissionText}>İçeriklerinizi yükleyin</Text>
          </View>
          
          <View style={styles.submissionItem}>
            <IconButton icon="link" iconColor={COLORS.primary} size={20} />
            <Text style={styles.submissionText}>Sosyal medya linklerini ekleyin</Text>
          </View>
          
          <View style={styles.submissionItem}>
            <IconButton icon="check-circle" iconColor={COLORS.primary} size={20} />
            <Text style={styles.submissionText}>Gereksinimleri kontrol edin</Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmitApplication}
          style={styles.submitButton}
          labelStyle={styles.submitButtonText}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Kampanyaya Başvur'}
        </Button>

        <Text style={styles.submissionNote}>
          Marka size sıradaki görevlerinizi kısa süre içinde söyleyecektir.
        </Text>
      </Card.Content>
    </Card>
  );

  const renderUrlSection = () => (
    <Card style={styles.urlCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Sosyal Medya URL'leri</Text>
        <Text style={styles.urlDescription}>
          Önceki içeriklerinizin sosyal medya platformlarındaki URL'lerini buraya ekleyin.
        </Text>
        
        {urls.map((url, index) => (
          <View key={index} style={styles.urlInputContainer}>
            <TextInput
              style={styles.urlInput}
              placeholder={`https://instagram.com/posts/... (${index + 1})`}
              placeholderTextColor={COLORS.textSecondary}
              value={url}
              onChangeText={(value) => handleUrlChange(index, value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {urls.length > 1 && (
              <TouchableOpacity 
                style={styles.removeUrlButton}
                onPress={() => handleRemoveUrl(index)}
              >
                <IconButton icon="close" iconColor={COLORS.error} size={20} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        <TouchableOpacity style={styles.addUrlButton} onPress={handleAddUrl}>
          <IconButton icon="plus" iconColor={COLORS.primary} size={20} />
          <Text style={styles.addUrlButtonText}>Başka URL Ekle</Text>
        </TouchableOpacity>
        
        <View style={styles.urlInfo}>
          <IconButton icon="information" iconColor={COLORS.info} size={16} />
          <Text style={styles.urlInfoText}>
            En iyi içeriklerinizin URL'lerini ekleyin. Bu, markanın sizin çalışma tarzınızı anlamasına yardımcı olacaktır.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderScreenshotSection = () => (
    <Card style={styles.screenshotCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Portfolio Örneği</Text>
        <Text style={styles.screenshotDescription}>
          En iyi içeriklerinizden birinin ekran görüntüsünü ekleyin. Bu, markanın sizin çalışma kalitenizi görmesine yardımcı olacaktır.
        </Text>
        
        <TouchableOpacity 
          style={[styles.screenshotButton, screenshot && styles.screenshotAdded]} 
          onPress={handleAddScreenshot}
        >
          {screenshot ? (
            <>
              <IconButton icon="check-circle" iconColor={COLORS.success} size={24} />
              <Text style={styles.screenshotButtonText}>Portfolio Örneği Eklendi</Text>
            </>
          ) : (
            <>
              <IconButton icon="camera-plus" iconColor={COLORS.primary} size={24} />
              <Text style={styles.screenshotButtonText}>Portfolio Örneği Ekle</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.screenshotInfo}>
          <IconButton icon="information" iconColor={COLORS.info} size={16} />
          <Text style={styles.screenshotInfoText}>
            En iyi içeriklerinizden birinin ekran görüntüsünü alın ve buraya yükleyin. Bu, markanın sizin çalışma tarzınızı anlamasına yardımcı olacaktır.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCampaignOverview()}
        {renderCampaignDetails()}
        {renderUrlSection()}
        {renderScreenshotSection()}
        {renderApplicationSection()}
      </ScrollView>

      {/* Notifications Modal */}
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
  campaignImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.md,
  },
  specialInvitationTag: {
    position: 'absolute',
    top: SIZES.spacing.sm,
    right: SIZES.spacing.sm,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  specialInvitationText: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  brandBadge: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
    marginBottom: SIZES.spacing.md,
  },
  brandBadgeText: {
    color: '#1A1A2E',
    fontFamily: FONTS.bold,
    fontSize: SIZES.sm,
  },
  campaignTitle: {
    fontSize: SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
  },
  platformIcons: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  platformBadge: {
    backgroundColor: COLORS.text,
    borderRadius: SIZES.radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: SIZES.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignMeta: {
    marginBottom: SIZES.spacing.lg,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.sm,
  },
  budgetLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  budgetAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  requirementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  requirementText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: '#FFD54F',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: '#FFD54F',
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  descriptionText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.spacing.lg,
  },
  divider: {
    backgroundColor: COLORS.surfaceLight,
    marginVertical: SIZES.spacing.lg,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  requirementItemText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
    marginLeft: -SIZES.spacing.xs,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  deliverableText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
    marginLeft: -SIZES.spacing.xs,
  },

  submissionCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  submissionInfo: {
    marginBottom: SIZES.spacing.lg,
  },
  submissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  submissionText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginLeft: -SIZES.spacing.xs,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  submitButtonText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
  },
  submissionNote: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  urlCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  urlDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.spacing.md,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
  removeUrlButton: {
    padding: SIZES.spacing.xs,
  },
  addUrlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    paddingVertical: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  addUrlButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: SIZES.spacing.xs,
  },
  urlInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  urlInfoText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: -SIZES.spacing.xs,
    lineHeight: 18,
  },
  screenshotCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  screenshotDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.spacing.md,
  },
  screenshotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  screenshotAdded: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  screenshotButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: SIZES.spacing.xs,
  },
  screenshotInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  screenshotInfoText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: -SIZES.spacing.xs,
    lineHeight: 18,
  },
  errorText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SIZES.spacing.xxl,
  },
});
