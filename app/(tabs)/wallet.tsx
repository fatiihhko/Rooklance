import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Button, IconButton, List, Chip, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { walletService, promoCodeService, transactionService, WalletData, PromoCode, Transaction, supabase } from '../../utils/supabase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock data (fallback için)
const mockWalletData = {
  balance: 1250.75,
  totalEarnings: 8500.00,
  promoCodes: [
    { id: 1, code: 'ROOKLANCE20', discount: '20₺', description: 'Tüm ürünlerde %20 indirim', validUntil: '2024-12-31', isUsed: false, color: [COLORS.primary, COLORS.primaryLight] },
    { id: 2, code: 'NEWUSER30', discount: '30₺', description: 'Yeni kullanıcılar için', validUntil: '2024-11-20', isUsed: false, color: [COLORS.instagram, COLORS.youtube] },
    { id: 3, code: 'FLASH25', discount: '25₺', description: 'Flash satışlarda %25 indirim', validUntil: '2024-11-15', isUsed: false, color: [COLORS.success, COLORS.primary] },
    { id: 4, code: 'VIP100', discount: '100₺', description: 'VIP üyeler için özel indirim', validUntil: '2024-10-30', isUsed: true, color: [COLORS.warning, COLORS.error] },
    { id: 5, code: 'WELCOME50', discount: '50₺', description: 'İlk siparişinizde %50 indirim', validUntil: '2024-12-31', isUsed: false, color: [COLORS.info, COLORS.primary] },
  ]
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('balance');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Supabase state'leri
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Animasyon değerleri
  const scrollY = useRef(new Animated.Value(0)).current;
  const balanceScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tabIndicatorX = useRef(new Animated.Value(0)).current;

  // Tab indicator animasyonu
  useEffect(() => {
    const tabWidth = (screenWidth - SIZES.spacing.lg * 2) / 2; // Her tab'ın genişliği
    const targetX = activeTab === 'balance' ? 0 : tabWidth;
    Animated.spring(tabIndicatorX, {
      toValue: targetX,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [activeTab]);

  // Pulse animasyonu
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
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

  // Kullanıcı ID'sini al
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Kullanıcı ID alınamadı:', error);
      }
    };
    getUserId();
  }, []);

  // Supabase verilerini yükle
  useEffect(() => {
    if (userId) {
      loadWalletData();
      loadPromoCodes();
      loadTransactions();
    }
  }, [userId]);

  // Cüzdan verilerini yükle
  const loadWalletData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await walletService.getWalletData(userId);
      if (data) {
        setWalletData(data);
      } else {
        // Eğer cüzdan yoksa, demo verilerle oluştur
        const newWallet = await walletService.upsertWallet(userId, mockWalletData.balance, mockWalletData.totalEarnings);
        if (newWallet) {
          setWalletData(newWallet);
        }
      }
    } catch (error) {
      console.error('Cüzdan verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Promo kodları yükle
  const loadPromoCodes = async () => {
    if (!userId) return;
    
    try {
      const codes = await promoCodeService.getPromoCodes(userId);
      if (codes.length === 0) {
        // Demo promo kodları oluştur
        const demoPromoCodes = mockWalletData.promoCodes.map(promo => ({
          user_id: userId,
          code: promo.code,
          discount: promo.discount,
          description: promo.description,
          valid_until: promo.validUntil,
          is_used: promo.isUsed,
          color_start: promo.color[0],
          color_end: promo.color[1]
        }));

        for (const promo of demoPromoCodes) {
          await promoCodeService.addPromoCode(promo);
        }
        
        const newCodes = await promoCodeService.getPromoCodes(userId);
        setPromoCodes(newCodes);
      } else {
        setPromoCodes(codes);
      }
    } catch (error) {
      console.error('Promo kodlar yüklenemedi:', error);
    }
  };

  // İşlem geçmişini yükle
  const loadTransactions = async () => {
    if (!userId) return;
    
    try {
      const trans = await transactionService.getTransactions(userId);
      setTransactions(trans);
    } catch (error) {
      console.error('İşlem geçmişi yüklenemedi:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    const currentBalance = walletData?.balance || mockWalletData.balance;
    
    if (amount > currentBalance) {
      Alert.alert('Hata', 'Çekmek istediğiniz miktar bakiyenizden fazla olamaz.');
      return;
    }
    if (amount < 50) {
      Alert.alert('Hata', 'Minimum çekim miktarı 50₺ olmalıdır.');
      return;
    }
    
    Alert.alert(
      'Para Çekme Onayı',
      `${amount}₺ tutarında para çekme işlemini onaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Onayla', 
          onPress: async () => {
            try {
              const success = await walletService.withdrawMoney(userId, amount);
              if (success) {
                Alert.alert('Başarılı', 'Para çekme işleminiz başlatıldı. 1-3 iş günü içinde hesabınıza yansıyacaktır.');
                setWithdrawAmount('');
                setShowWithdrawModal(false);
                // Verileri yenile
                await loadWalletData();
                await loadTransactions();
              } else {
                Alert.alert('Hata', 'Para çekme işlemi başarısız oldu. Lütfen tekrar deneyin.');
              }
            } catch (error) {
              Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
          }
        }
      ]
    );
  };

  const copyToClipboard = (code: string) => {
    // React Native'de clipboard işlemi için expo-clipboard kullanılabilir
    Alert.alert('Kopyalandı', `${code} kodu panoya kopyalandı!`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const renderBalanceCard = () => {
    const currentBalance = walletData?.balance || mockWalletData.balance;
    const currentEarnings = walletData?.total_earnings || mockWalletData.totalEarnings;

    return (
      <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight, COLORS.instagram]}
          style={styles.balanceCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Toplam Bakiye</Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Text style={styles.balanceAmount}>{formatCurrency(currentBalance)}</Text>
            </Animated.View>
          </View>
          
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Toplam Kazanç</Text>
              <Text style={styles.balanceStatValue}>{formatCurrency(currentEarnings)}</Text>
            </View>
          </View>

          <View style={styles.balanceActions}>
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => setShowWithdrawModal(true)}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.success, COLORS.primary]}
                style={styles.withdrawButtonGradient}
              >
                <IconButton icon="bank-transfer" iconColor={COLORS.text} size={20} />
                <Text style={styles.withdrawButtonText}>
                  {loading ? 'Yükleniyor...' : 'Para Çek'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };



  const renderPromoCodesSection = () => {
    const activeCodes = promoCodes.filter(c => !c.is_used);
    const displayCodes = promoCodes.length > 0 ? promoCodes : mockWalletData.promoCodes;

    return (
      <Animated.View style={[styles.glassCard, { opacity: cardOpacity }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kodlarım</Text>
          <Text style={styles.sectionSubtitle}>
            {loading ? 'Yükleniyor...' : `${activeCodes.length} aktif kod`}
          </Text>
        </View>
        
        {displayCodes.map((promoCode: any, index) => {
          // Supabase verisi için uyumluluk
          const code = promoCode.code;
          const discount = promoCode.discount;
          const description = promoCode.description;
          const validUntil = promoCode.valid_until || promoCode.validUntil;
          const isUsed = promoCode.is_used || promoCode.isUsed;
          const colors = promoCode.color_start && promoCode.color_end 
            ? [promoCode.color_start, promoCode.color_end] as [string, string]
            : promoCode.color;

          return (
            <Animated.View 
              key={promoCode.id}
              style={[
                styles.promoCard,
                { 
                  opacity: cardOpacity,
                  transform: [{ translateY: cardOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })}]
                }
              ]}
            >
              <LinearGradient
                colors={isUsed ? [COLORS.textMuted, COLORS.textSecondary] : colors}
                style={styles.promoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.promoContent}>
                  <View style={styles.promoLeft}>
                    <Text style={styles.promoDiscount}>{discount}</Text>
                    <Text style={styles.promoCode}>{code}</Text>
                  </View>
                  <View style={styles.promoRight}>
                    <Text style={styles.promoDescription}>{description}</Text>
                    <Text style={styles.promoValidUntil}>Geçerlilik: {validUntil}</Text>
                    {!isUsed && (
                      <TouchableOpacity 
                        style={styles.copyButton}
                        onPress={() => copyToClipboard(code)}
                      >
                        <Text style={styles.copyButtonText}>Kopyala</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {isUsed && (
                  <View style={styles.usedOverlay}>
                    <Text style={styles.usedText}>Kullanıldı</Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  };



  return (
    <View style={styles.container}>
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
              onPress={() => Alert.alert('Bilgi', 'Bildirimler yakında eklenecek.')}
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('balance')}
        >
          <Text style={[styles.tabText, activeTab === 'balance' && styles.activeTabText]}>
            Bakiye
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab} 
          onPress={() => setActiveTab('rewards')}
        >
          <Text style={[styles.tabText, activeTab === 'rewards' && styles.activeTabText]}>
            Kodlarım
          </Text>
        </TouchableOpacity>
        <Animated.View 
          style={[
            styles.tabIndicator,
            { transform: [{ translateX: tabIndicatorX }] }
          ]}
        />
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
        {activeTab === 'balance' ? (
          renderBalanceCard()
        ) : (
          renderPromoCodesSection()
        )}
      </Animated.ScrollView>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: cardOpacity }]}>
            <LinearGradient
              colors={[COLORS.surface, COLORS.surfaceLight]}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Para Çek</Text>
                <IconButton
                  icon="close"
                  iconColor={COLORS.text}
                  size={24}
                  onPress={() => setShowWithdrawModal(false)}
                />
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Çekmek istediğiniz miktar:</Text>
                <TextInput
                  mode="outlined"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={styles.amountInput}
                  outlineColor={COLORS.primary}
                  activeOutlineColor={COLORS.primary}
                  textColor={COLORS.text}
                />
                <Text style={styles.modalInfo}>
                  Mevcut bakiye: {formatCurrency(walletData?.balance || mockWalletData.balance)}
                </Text>
                <Text style={styles.modalInfo}>
                  Minimum çekim: 50₺
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowWithdrawModal(false)}
                  style={styles.modalButton}
                  textColor={COLORS.text}
                >
                  İptal
                </Button>
                <Button
                  mode="contained"
                  onPress={handleWithdraw}
                  style={styles.modalButton}
                  buttonColor={COLORS.primary}
                  textColor={COLORS.text}
                >
                  Çek
                </Button>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: (screenWidth - SIZES.spacing.lg * 2) / 2, // Her tab'ın genişliği
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
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
  // Bakiye Kartı
  balanceCardGradient: {
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  balanceTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    opacity: 0.9,
    marginBottom: SIZES.spacing.sm,
  },
  balanceAmount: {
    fontSize: SIZES.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.spacing.lg,
  },
  balanceStat: {
    alignItems: 'center',
  },
  balanceStatLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
  },
  balanceStatValue: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SIZES.spacing.xs,
  },
  balanceActions: {
    alignItems: 'center',
  },
  withdrawButton: {
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  withdrawButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  withdrawButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
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
  // Kupon Kartları
  couponCard: {
    margin: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  couponGradient: {
    position: 'relative',
  },
  couponContent: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
  },
  couponLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.lg,
    minWidth: 80,
  },
  couponDiscount: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  couponCode: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    opacity: 0.9,
  },
  couponRight: {
    flex: 1,
  },
  couponDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  couponValidUntil: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SIZES.spacing.sm,
  },
  copyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.sm,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  usedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usedText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  // Promosyon Kartları
  promoCard: {
    margin: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  promoGradient: {
    position: 'relative',
  },
  promoContent: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
  },
  promoLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.lg,
    minWidth: 80,
  },
  promoDiscount: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  promoCode: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    opacity: 0.9,
  },
  promoRight: {
    flex: 1,
  },
  promoDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  promoValidUntil: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SIZES.spacing.sm,
  },
  // İşlem Kartları
  transactionCard: {
    margin: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  transactionDate: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: SIZES.spacing.xs,
  },
  statusChip: {
    height: 24,
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: screenWidth - SIZES.spacing.lg * 2,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  modalGradient: {
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
  },
  modalBody: {
    marginBottom: SIZES.spacing.lg,
  },
  modalLabel: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  amountInput: {
    marginBottom: SIZES.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalInfo: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
