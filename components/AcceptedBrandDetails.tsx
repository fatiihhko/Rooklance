import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Card, Button, IconButton } from 'react-native-paper';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { Application } from '../types';

interface AcceptedBrandDetailsProps {
  application: Application;
  onClose: () => void;
}

export default function AcceptedBrandDetails({ application, onClose }: AcceptedBrandDetailsProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [screenshot, setScreenshot] = useState('');

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
      'Portfolio Örneği Ekle',
      'Portfolio örneği eklemek için galeriden seçin veya kamera ile çekin.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeri', onPress: () => setScreenshot('screenshot_added') },
        { text: 'Kamera', onPress: () => setScreenshot('screenshot_added') }
      ]
    );
  };

  const handleSubmitDetails = () => {
    const validUrls = urls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir sosyal medya URL\'si ekleyin.');
      return;
    }
    
    if (!screenshot) {
      Alert.alert('Hata', 'Lütfen portfolio örneği ekleyin.');
      return;
    }

    Alert.alert(
      'Detayları Gönder',
      'Bu detayları göndermek istediğinizi onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Gönder', 
          onPress: () => {
            Alert.alert(
              'Başarılı!',
              'Detaylarınız başarıyla gönderildi. Marka size sıradaki görevlerinizi kısa süre içinde söyleyecektir.',
              [{ text: 'Tamam', onPress: onClose }]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kabul Edilen Marka Detayları</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <IconButton icon="close" iconColor={COLORS.text} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Brand Info */}
        <Card style={styles.brandInfoCard}>
          <Card.Content>
            <Text style={styles.campaignTitle}>{application.campaign?.title}</Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>{application.campaign?.brand}</Text>
            </View>
            <View style={styles.budgetContainer}>
              <Text style={styles.budgetLabel}>Kazanç</Text>
              <Text style={styles.budgetAmount}>
                {application.campaign?.budget.toLocaleString()} {application.campaign?.budgetCurrency}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* URL Section */}
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

        {/* Portfolio Section */}
        <Card style={styles.portfolioCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Portfolio Örneği</Text>
            <Text style={styles.portfolioDescription}>
              En iyi içeriklerinizden birinin ekran görüntüsünü ekleyin. Bu, markanın sizin çalışma kalitenizi görmesine yardımcı olacaktır.
            </Text>
            
            <TouchableOpacity 
              style={[styles.portfolioButton, screenshot && styles.portfolioAdded]} 
              onPress={handleAddScreenshot}
            >
              {screenshot ? (
                <>
                  <IconButton icon="check-circle" iconColor={COLORS.success} size={24} />
                  <Text style={styles.portfolioButtonText}>Portfolio Örneği Eklendi</Text>
                </>
              ) : (
                <>
                  <IconButton icon="camera-plus" iconColor={COLORS.primary} size={24} />
                  <Text style={styles.portfolioButtonText}>Portfolio Örneği Ekle</Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.portfolioInfo}>
              <IconButton icon="information" iconColor={COLORS.info} size={16} />
              <Text style={styles.portfolioInfoText}>
                En iyi içeriklerinizden birinin ekran görüntüsünü alın ve buraya yükleyin. Bu, markanın sizin çalışma tarzınızı anlamasına yardımcı olacaktır.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmitDetails}
          style={styles.submitButton}
          labelStyle={styles.submitButtonText}
        >
          Detayları Gönder
        </Button>
      </View>
    </View>
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
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  brandInfoCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  campaignTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  brandBadge: {
    alignSelf: 'flex-start',
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
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
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
  urlCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
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
  portfolioCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  portfolioDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.spacing.md,
  },
  portfolioButton: {
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
  portfolioAdded: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  portfolioButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: SIZES.spacing.xs,
  },
  portfolioInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  portfolioInfoText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: -SIZES.spacing.xs,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  submitButtonText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
  },
});
