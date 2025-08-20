import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, Animated, Dimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, IconButton, List, Switch, Modal, Portal } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { mockUser, mockNotifications } from '../../constants/mockData';
import { User } from '../../types';
import NotificationsModal from '../../components/NotificationsModal';
import SocialMediaConnect from '../../components/SocialMediaConnect';
import { useAuth } from '../../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user: authUser, updateSocialMedia, updateProfileImage, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [socialMediaModalVisible, setSocialMediaModalVisible] = useState(false);



  
  // Animasyon değerleri
  const scrollY = useRef(new Animated.Value(0)).current;
  const backgroundCircleY = useRef(new Animated.Value(0)).current;
  const profileImageScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Scroll listener
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      // Arka plan dairesini scroll ile hareket ettir
      backgroundCircleY.setValue(value * 0.3);
      
      // Profil fotoğrafını büyüt/küçült
      const scale = Math.max(0.8, 1 - value / 1000);
      profileImageScale.setValue(scale);
    });

    return () => scrollY.removeListener(listener);
  }, []);

  // Pulse animasyonu
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', onPress: async () => {
          await logout();
          router.replace('/(auth)/');
        }}
      ]
    );
  };

  const handleSocialMediaConnect = (platform: string, username: string) => {
    updateSocialMedia(platform, username);
  };

  const handleEditProfile = () => {
    Alert.alert('Bilgi', 'Profil düzenleme özelliği yakında eklenecek.');
  };

  const handleProfileImageChange = async () => {
    try {
      // İzinleri kontrol et
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gereklidir.');
        return;
      }

      // Resim seçiciyi aç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfileImage(result.assets[0].uri);
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
      }
    } catch (error) {
      console.error('Profil fotoğrafı güncelleme hatası:', error);
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu.');
    }
  };



  return (
    <View style={styles.container}>
      {/* Animasyonlu Arka Plan Dairesi */}
      <Animated.View 
        style={[
          styles.backgroundCircle,
          {
            transform: [{ translateY: backgroundCircleY }],
          }
        ]}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight, COLORS.instagram, COLORS.youtube]}
          style={styles.gradientCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
            {mockNotifications.filter(n => !n.isRead).length > 0 && (
                <Animated.View 
                  style={[
                    styles.notificationBadge,
                    {
                      transform: [{ scale: pulseAnim }],
                    }
                  ]}
                >
                <Text style={styles.notificationBadgeText}>
                  {mockNotifications.filter(n => !n.isRead).length}
                </Text>
                </Animated.View>
            )}
          </View>
        </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Animated.View 
            style={[
              styles.profileImageContainer,
              {
                transform: [{ scale: profileImageScale }],
              }
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              style={styles.profileImageGradient}
            >
            <Image source={{ uri: authUser?.profileImage || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
            </LinearGradient>
            <IconButton
              icon="camera"
              iconColor={COLORS.text}
              size={20}
              style={styles.cameraIcon}
              onPress={handleProfileImageChange}
            />
          </Animated.View>
          
          <Text style={styles.userName}>{authUser?.firstName || 'Kullanıcı'} {authUser?.lastName || 'Adı'}</Text>
          <Text style={styles.userEmail}>{authUser?.email || 'kullanici@email.com'}</Text>

          {/* Sosyal Medya Stats - Glassmorphism */}
          <View style={styles.socialMediaSection}>
            <Animated.View style={[styles.socialMediaCard, { opacity: cardOpacity }]}>
              <LinearGradient
                colors={[COLORS.instagram, COLORS.primary]}
                style={styles.socialMediaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconButton icon="instagram" iconColor={COLORS.text} size={26} style={{ margin: 0 }} />
              <Text style={styles.socialMediaUsername}>{authUser?.socialMedia?.instagram?.username || 'Bağlanmamış'}</Text>
              <Text style={styles.socialMediaFollowers}>0 takipçi</Text>
              </LinearGradient>
            </Animated.View>
            
            <Animated.View style={[styles.socialMediaCard, { opacity: cardOpacity }]}>
              <LinearGradient
                colors={[COLORS.tiktok, COLORS.primary]}
                style={styles.socialMediaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconButton icon="music-note" iconColor={COLORS.text} size={26} style={{ margin: 0 }} />
              <Text style={styles.socialMediaUsername}>{authUser?.socialMedia?.tiktok?.username || 'Bağlanmamış'}</Text>
              <Text style={styles.socialMediaFollowers}>0 takipçi</Text>
              </LinearGradient>
            </Animated.View>
            
            <Animated.View style={[styles.socialMediaCard, { opacity: cardOpacity }]}>
              <LinearGradient
                colors={[COLORS.youtube, COLORS.primary]}
                style={styles.socialMediaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <IconButton icon="youtube" iconColor={COLORS.text} size={26} style={{ margin: 0 }} />
              <Text style={styles.socialMediaUsername}>{authUser?.socialMedia?.youtube?.channelId || 'Bağlanmamış'}</Text>
              <Text style={styles.socialMediaFollowers}>0 takipçi</Text>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>

        {/* Profile Settings - Glassmorphism */}
        <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
        <Card style={styles.settingsCard}>
          <Card.Content>

            
            <List.Item
              title="Hesap Ayarları"
              left={(props) => <List.Icon {...props} icon="cog" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
              onPress={() => router.push('/settings')}
              titleStyle={styles.listItemTitle}
            />
            
            <List.Item
              title="TikTok Hesabını Güncelle"
              left={(props) => <List.Icon {...props} icon="music-note" color={COLORS.tiktok} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
              onPress={() => Alert.alert('Bilgi', 'TikTok hesabı güncelleme özelliği yakında eklenecek.')}
              titleStyle={styles.listItemTitle}
            />
            
            <List.Item
              title="Instagram Hesabını Güncelle"
              left={(props) => <List.Icon {...props} icon="instagram" color={COLORS.instagram} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
              onPress={() => Alert.alert('Bilgi', 'Instagram hesabı güncelleme özelliği yakında eklenecek.')}
              titleStyle={styles.listItemTitle}
            />
            
            <List.Item
              title="Bildirim Tercihleri"
              left={(props) => <List.Icon {...props} icon="bell" color={COLORS.primary} />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={COLORS.primary}
                />
              )}
              titleStyle={styles.listItemTitle}
            />
            
            <List.Item
              title="Kullanıcı Verileri"
              left={(props) => <List.Icon {...props} icon="database" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
              onPress={() => Alert.alert('Bilgi', 'Kullanıcı verileri yakında eklenecek.')}
              titleStyle={styles.listItemTitle}
            />
            
            <List.Item
              title="Sıkça Sorulan Sorular"
              left={(props) => <List.Icon {...props} icon="help-circle" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" color={COLORS.textSecondary} />}
              onPress={() => Alert.alert('Bilgi', 'SSS özelliği yakında eklenecek.')}
              titleStyle={styles.listItemTitle}
            />
          </Card.Content>
        </Card>
        </Animated.View>

        {/* Profile Information Card - Glassmorphism */}
        <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
        <Card style={styles.profileInfoCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Profil Bilgileri</Text>
              <Button
                mode="text"
                onPress={handleEditProfile}
                textColor={COLORS.primary}
                icon="pencil"
              >
                Düzenle
              </Button>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ad:</Text>
                <Text style={styles.infoValue}>{authUser?.firstName || 'Kullanıcı'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Soyad:</Text>
                <Text style={styles.infoValue}>{authUser?.lastName || 'Adı'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>E-posta:</Text>
                <Text style={styles.infoValue}>{authUser?.email || 'kullanici@email.com'}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Hakkımda</Text>
              <Text style={styles.bioText}>Henüz bir bio eklenmemiş.</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>İçerik Kategorileri</Text>
              <View style={styles.categoriesContainer}>
                {['Teknoloji', 'Yaşam', 'Eğlence'].map((category: string, index: number) => (
                    <LinearGradient
                      key={index}
                      colors={[COLORS.primary, COLORS.primaryLight]}
                      style={styles.categoryChip}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                    <Text style={styles.categoryText}>{category}</Text>
                    </LinearGradient>
                ))}
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Sosyal Medya Hesapları</Text>
              <View style={styles.socialMediaInfo}>
                <View style={styles.socialMediaInfoItem}>
                  <View style={styles.socialIconSquareSmall}>
                    <IconButton icon="instagram" iconColor={COLORS.instagram} size={22} style={{ margin: 0 }} />
                  </View>
                  <Text style={styles.socialMediaInfoText}>
                    {authUser?.socialMedia?.instagram || 'Bağlanmamış'} • 0 takipçi
                  </Text>
                </View>
                
                <View style={styles.socialMediaInfoItem}>
                  <View style={styles.socialIconSquareSmall}>
                    <IconButton icon="music-note" iconColor={COLORS.tiktok} size={22} style={{ margin: 0 }} />
                  </View>
                  <Text style={styles.socialMediaInfoText}>
                    {authUser?.socialMedia?.tiktok || 'Bağlanmamış'} • 0 takipçi
                  </Text>
                </View>
                
                <View style={styles.socialMediaInfoItem}>
                  <View style={styles.socialIconSquareSmall}>
                    <IconButton icon="youtube" iconColor={COLORS.youtube} size={22} style={{ margin: 0 }} />
                  </View>
                  <Text style={styles.socialMediaInfoText}>
                    {authUser?.socialMedia?.youtube || 'Bağlanmamış'} • 0 takipçi
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
        </Animated.View>

        {/* Sosyal Medya Eşleştirme Butonu */}
        <Card style={styles.glassCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sosyal Medya Hesapları</Text>
              <Button
                mode="contained"
                onPress={() => setSocialMediaModalVisible(true)}
                style={styles.connectButton}
                buttonColor={COLORS.primary}
                labelStyle={styles.connectButtonText}
              >
                Hesapları Eşleştir
              </Button>
            </View>
            
            <View style={styles.socialMediaInfo}>
              {authUser?.socialMedia?.instagram && (
                <View style={styles.socialMediaInfoItem}>
                  <View style={styles.socialIconSquareSmall}>
                    <IconButton icon="instagram" iconColor={COLORS.instagram} size={22} style={{ margin: 0 }} />
                  </View>
                  <Text style={styles.socialMediaInfoText}>
                    {authUser.socialMedia.instagram}
                  </Text>
                </View>
              )}
              
              {authUser?.socialMedia?.tiktok && (
                <View style={styles.socialMediaInfoItem}>
                  <View style={styles.socialIconSquareSmall}>
                    <IconButton icon="music-note" iconColor={COLORS.tiktok} size={22} style={{ margin: 0 }} />
                  </View>
                  <Text style={styles.socialMediaInfoText}>
                    {authUser.socialMedia.tiktok}
                  </Text>
                </View>
              )}
              
              {authUser?.socialMedia?.youtube && (
                <View style={styles.socialMediaInfoItem}>
                  <View style={styles.socialIconSquareSmall}>
                    <IconButton icon="youtube" iconColor={COLORS.youtube} size={22} style={{ margin: 0 }} />
                  </View>
                  <Text style={styles.socialMediaInfoText}>
                    {authUser.socialMedia.youtube}
                  </Text>
                </View>
              )}
              
              {!authUser?.socialMedia?.instagram && !authUser?.socialMedia?.tiktok && !authUser?.socialMedia?.youtube && (
                <Text style={styles.noSocialMediaText}>
                  Henüz sosyal medya hesabı bağlanmamış
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={COLORS.error}
          buttonColor={COLORS.surface}
        >
          Çıkış Yap
        </Button>
      </Animated.ScrollView>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />

      {/* Social Media Connect Modal */}
      <Portal>
        <Modal
          visible={socialMediaModalVisible}
          onDismiss={() => setSocialMediaModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sosyal Medya Hesaplarınızı Bağlayın</Text>
              <IconButton
                icon="close"
                iconColor={COLORS.text}
                size={24}
                onPress={() => setSocialMediaModalVisible(false)}
              />
            </View>
            
            <SocialMediaConnect
              onConnect={handleSocialMediaConnect}
              connectedAccounts={authUser?.socialMedia || {}}
              isOptional={true}
            />
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xxl,
  },
  // Animasyonlu Arka Plan Dairesi
  backgroundCircle: {
    position: 'absolute',
    top: -200,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.1,
    zIndex: -1,
  },
  gradientCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
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
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SIZES.spacing.md,
  },
  profileImageGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    margin: 0,
  },
  userName: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  userEmail: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.lg,
  },
  // Glassmorphism Sosyal Medya Kartları
  socialMediaSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: SIZES.spacing.sm,
  },
  socialMediaCard: {
    flex: 1,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  socialMediaGradient: {
    padding: SIZES.spacing.md,
    alignItems: 'center',
    borderRadius: SIZES.radius.lg,
  },
  socialMediaUsername: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginTop: SIZES.spacing.xs,
  },
  socialMediaFollowers: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
  },
  // Glassmorphism Kartlar
  glassCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...SHADOWS.medium,
  },
  settingsCard: {
    backgroundColor: 'transparent',
    borderRadius: SIZES.radius.lg,
  },
  listItemTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  profileInfoCard: {
    backgroundColor: 'transparent',
    borderRadius: SIZES.radius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  infoSection: {
    marginBottom: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.xs,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  bioText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
  },
  categoryText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  socialMediaInfo: {
    gap: SIZES.spacing.sm,
  },
  socialMediaInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIconSquareSmall: {
    backgroundColor: COLORS.text,
    borderRadius: SIZES.radius.sm,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.sm,
  },
  socialMediaInfoText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  logoutButton: {
    marginHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    borderColor: COLORS.error,
  },
  connectButton: {
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
  },
  connectButtonText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  noSocialMediaText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SIZES.spacing.sm,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    maxHeight: '80%',
  },
  modalContent: {
    padding: SIZES.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    flex: 1,
  },
});
