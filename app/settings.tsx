import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Animated, Dimensions, TouchableOpacity, Image, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, IconButton, List, TextInput, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  // Animasyon değerleri
  const scrollY = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animasyonu
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  }, []);

  // Kart animasyonları
  useEffect(() => {
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', onPress: () => router.replace('/(auth)/welcome') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Hesap Silindi', 'Hesabınız başarıyla silindi.');
            router.replace('/(auth)/welcome');
          }
        }
      ]
    );
  };



  const renderAccountSettings = () => (
    <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
        <Text style={styles.sectionSubtitle}>Kişisel bilgilerinizi güncelleyin</Text>
      </View>
      
      <List.Item
        title="Ad Soyad"
        description="Ahmet Yılmaz"
        left={(props) => <List.Icon {...props} icon="account" color={COLORS.primary} />}
        right={(props) => <List.Icon {...props} icon="pencil" color={COLORS.textSecondary} />}
        onPress={() => Alert.alert('Bilgi', 'Ad soyad değiştirme özelliği yakında eklenecek.')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="E-posta"
        description="ahmet@example.com"
        left={(props) => <List.Icon {...props} icon="email" color={COLORS.primary} />}
        right={(props) => <List.Icon {...props} icon="pencil" color={COLORS.textSecondary} />}
        onPress={() => setShowEmailModal(true)}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="Telefon"
        description="+90 555 123 45 67"
        left={(props) => <List.Icon {...props} icon="phone" color={COLORS.primary} />}
        right={(props) => <List.Icon {...props} icon="pencil" color={COLORS.textSecondary} />}
        onPress={() => setShowPhoneModal(true)}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="Şifre"
        description="••••••••"
        left={(props) => <List.Icon {...props} icon="lock" color={COLORS.primary} />}
        right={(props) => <List.Icon {...props} icon="pencil" color={COLORS.textSecondary} />}
        onPress={() => setShowPasswordModal(true)}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
    </Animated.View>
  );







  const renderSocialMediaSettings = () => (
    <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sosyal Medya Hesapları</Text>
        <Text style={styles.sectionSubtitle}>Hesaplarınızı eşleştirin</Text>
      </View>
      
      <List.Item
        title="Instagram Hesabını Eşleştir"
        description="Instagram hesabınızı bağlayın"
        left={(props) => <List.Icon {...props} icon="instagram" color={COLORS.instagram} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
        onPress={() => Alert.alert('Instagram', 'Instagram hesabı eşleştirme özelliği yakında eklenecek.')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="TikTok Hesabını Eşleştir"
        description="TikTok hesabınızı bağlayın"
        left={(props) => <List.Icon {...props} icon="music-note" color={COLORS.tiktok} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
        onPress={() => Alert.alert('TikTok', 'TikTok hesabı eşleştirme özelliği yakında eklenecek.')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="YouTube Hesabını Eşleştir"
        description="YouTube kanalınızı bağlayın"
        left={(props) => <List.Icon {...props} icon="youtube" color={COLORS.youtube} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
        onPress={() => Alert.alert('YouTube', 'YouTube hesabı eşleştirme özelliği yakında eklenecek.')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
    </Animated.View>
  );

  const renderSupportSection = () => (
    <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Destek ve Yardım</Text>
        <Text style={styles.sectionSubtitle}>Yardıma mı ihtiyacınız var?</Text>
      </View>
      
      <List.Item
        title="Sıkça Sorulan Sorular"
        description="Yaygın sorulara cevaplar"
        left={(props) => <List.Icon {...props} icon="help-circle" color={COLORS.primary} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
        onPress={() => Alert.alert('Bilgi', 'SSS özelliği yakında eklenecek.')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="Destek Ekibi"
        description="Bizimle iletişime geçin"
        left={(props) => <List.Icon {...props} icon="headset" color={COLORS.primary} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
        onPress={() => Alert.alert('Bilgi', 'Destek ekibi ile iletişim yakında eklenecek.')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
      
      <Divider style={styles.divider} />
      
      <List.Item
        title="Uygulama Hakkında"
        description="Versiyon ve lisans bilgileri"
        left={(props) => <List.Icon {...props} icon="information" color={COLORS.primary} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
        onPress={() => Alert.alert('Uygulama Bilgileri', 'Rooklance v1.0.0\n© 2024 Rooklance. Tüm hakları saklıdır.')}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
      />
    </Animated.View>
  );

  const renderDangerZone = () => (
    <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
      
      <TouchableOpacity 
        style={styles.dangerButton}
        onPress={handleLogout}
      >
        <LinearGradient
          colors={[COLORS.warning, COLORS.error]}
          style={styles.dangerButtonGradient}
        >
          <IconButton icon="logout" iconColor={COLORS.text} size={20} />
          <Text style={styles.dangerButtonText}>Çıkış Yap</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.dangerButton}
        onPress={handleDeleteAccount}
      >
        <LinearGradient
          colors={[COLORS.error, '#8B0000']}
          style={styles.dangerButtonGradient}
        >
          <IconButton icon="delete" iconColor={COLORS.text} size={20} />
          <Text style={styles.dangerButtonText}>Hesabı Sil</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.spacing.md }]}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logoImage} />
        </View>
        <View style={styles.headerIcons}>
          <View style={styles.notificationButton}>
            <IconButton
              icon="bell"
              iconColor={COLORS.text}
              size={24}
              onPress={() => Alert.alert('Bilgi', 'Bildirimler yakında eklenecek.')}
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </View>
        </View>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderAccountSettings()}
        {renderSocialMediaSettings()}
        {renderSupportSection()}
        {renderDangerZone()}
      </Animated.ScrollView>
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
    paddingBottom: SIZES.spacing.md,
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
  scrollContent: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  // Glassmorphism Kartlar
  glassCard: {
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...SHADOWS.medium,
  },

  // Bölüm Başlıkları
  sectionHeader: {
    padding: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  // Liste Öğeleri
  listItemTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  listItemDescription: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SIZES.spacing.lg,
  },
  // Tehlikeli Bölge
  dangerButton: {
    margin: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  dangerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  dangerButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
  },
});
