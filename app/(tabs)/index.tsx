import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Alert, Image, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { Chip, Card, Button, IconButton, Portal, Modal } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { mockCampaigns, mockNotifications } from '../../constants/mockData';
import { Campaign, Platform, CampaignCategory } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationsModal from '../../components/NotificationsModal';
import { mockBrands, mockAmbassadorPrograms, mockAmbassadorStats } from '../../constants/ambassadorMockData';
import { Brand, AmbassadorProgram } from '../../types/ambassador';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function CampaignsScreen() {
  const insets = useSafeAreaInsets();
  const { user: authUser } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<CampaignCategory[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Kullanıcı bilgilerini ve tarihi al
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        // AuthContext'ten kullanıcı bilgilerini al
        if (authUser) {
          const name = authUser.firstName || authUser.email?.split('@')[0] || 'Kullanıcı';
          setUserName(name);
        } else {
          // Fallback olarak Supabase'den al
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı';
          const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          setUserName(capitalizedName);
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        setUserName('Kullanıcı');
      }
    };

    const getCurrentDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long' 
      };
      const formattedDate = now.toLocaleDateString('tr-TR', options);
      setCurrentDate(formattedDate);
    };

    getUserInfo();
    getCurrentDate();
  }, [authUser]);

  const platforms = [
    { key: 'instagram', label: 'Instagram', icon: 'instagram' },
    { key: 'tiktok', label: 'TikTok', icon: 'music-note' },
    { key: 'youtube', label: 'YouTube', icon: 'youtube' },
  ];

  const budgetRanges = [
    { key: '0-1K', label: '0-1K ₺' },
    { key: '1K-5K', label: '1K-5K ₺' },
    { key: '5K-10K', label: '5K-10K ₺' },
    { key: '10K+', label: '10K+ ₺' },
  ];

  const categories = [
    { key: 'beauty', label: 'Güzellik' },
    { key: 'fashion', label: 'Moda' },
    { key: 'technology', label: 'Teknoloji' },
    { key: 'food', label: 'Yemek' },
    { key: 'sports', label: 'Spor' },
  ];

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleBudgetRangeToggle = (range: string) => {
    setSelectedBudgetRange(prev => prev === range ? '' : range);
  };

  const handleCategoryToggle = (category: CampaignCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSelectedPlatforms([]);
    setSelectedBudgetRange('');
    setSelectedCategories([]);
  };

  // Ambassador section render functions
  const renderAmbassadorHeader = () => (
    <View style={styles.ambassadorHeader}>
      <View style={styles.ambassadorUserInfo}>
        <Image 
          source={{ uri: authUser?.profileImage || 'https://via.placeholder.com/100' }} 
          style={styles.ambassadorAvatar} 
        />
        <View style={styles.ambassadorGreeting}>
          <Text style={styles.ambassadorGreetingText}>Merhaba, {userName}</Text>
          <Text style={styles.ambassadorDateText}>{currentDate}</Text>
        </View>
      </View>
    </View>
  );

  const renderTaskSummary = () => (
    <View style={styles.taskSummaryContainer}>
      <Text style={styles.taskSummaryText}>Tamamlanacak 5 Göreviniz Var.</Text>
    </View>
  );

  const renderMembersSection = () => {
    // Mock üye ve marka elçisi verileri
    const memberData = [
      {
        id: 1,
        avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
        name: 'Ayşe Yılmaz',
        brand: 'TooA-Ice Cream Machine',
        description: 'Devrim niteliğinde dondurma teknolojisi',
        socialMedia: {
          instagram: '@ayseyilmaz',
          tiktok: '@ayseyilmaz_tt',
          youtube: '@ayseyilmaz_youtube'
        }
      },
      {
        id: 2,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        name: 'Mehmet Demir',
        brand: 'Vinsight Health',
        description: 'Yapay zekâ destekli sağlık içgörüleri',
        socialMedia: {
          instagram: '@mehmetdemir',
          tiktok: '@mehmetdemir_tt',
          youtube: '@mehmetdemir_health'
        }
      },
      {
        id: 3,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        name: 'Zeynep Kaya',
        brand: 'QORA - Detoks Kampı',
        description: 'Quantum bilimi kampı',
        socialMedia: {
          instagram: '@zeynepkaya',
          tiktok: '@zeynepkaya_tt',
          youtube: '@zeynepkaya_qora'
        }
      },
      {
        id: 4,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
        name: 'Can Özkan',
        brand: 'Blackbird Ventures One',
        description: 'Girişim sermayesi ve startup desteği',
        socialMedia: {
          instagram: '@canozkan',
          tiktok: '@canozkan_tt',
          youtube: '@canozkan_ventures'
        }
      },
      {
        id: 5,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        name: 'Elif Şahin',
        brand: 'Silentwing',
        description: 'Girişimcilik Rehberi, AI asistanı',
        socialMedia: {
          instagram: '@elifshahin',
          tiktok: '@elifshahin_tt',
          youtube: '@elifshahin_ai'
        }
      },
      {
        id: 6,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        name: 'Burak Arslan',
        brand: 'Venture Vibe',
        description: 'Girişim ekosistemi platformu',
        socialMedia: {
          instagram: '@burakarslan',
          tiktok: '@burakarslan_tt',
          youtube: '@burakarslan_venture'
        }
      }
    ];

    const [selectedMember, setSelectedMember] = useState<number | null>(null);
    
    // Her üye için ayrı animasyon değerleri - sadece scale kullanacağız
    const memberAnimations = memberData.map(() => ({
      scale: useRef(new Animated.Value(1)).current,
    }));

    const handleMemberPress = (memberId: number) => {
      const memberIndex = memberId - 1; // ID'ler 1'den başladığı için
      const animations = memberAnimations[memberIndex];
      
      if (selectedMember === memberId) {
        // Seçimi kaldır
        setSelectedMember(null);
        Animated.timing(animations.scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // Önceki seçimi sıfırla
        if (selectedMember) {
          const prevIndex = selectedMember - 1;
          const prevAnimations = memberAnimations[prevIndex];
          Animated.timing(prevAnimations.scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        
        // Yeni seçim
        setSelectedMember(memberId);
        Animated.timing(animations.scale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    };

    return (
    <View style={styles.membersSection}>
        <Text style={styles.membersTitle}>6 üye</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.membersScroll}
          contentContainerStyle={styles.membersScrollContent}
        >
        <View style={styles.membersAvatars}>
            {memberData.map((member, index) => {
              const animations = memberAnimations[index];
              return (
                <TouchableOpacity 
                  key={member.id} 
                  onPress={() => handleMemberPress(member.id)}
                  style={styles.memberAvatarContainer}
                >
                  <Animated.View
                    style={[
                      styles.memberAvatarWrapper,
                      {
                        transform: [{ scale: animations.scale }],
                        shadowOpacity: selectedMember === member.id ? 0.8 : 0,
                        shadowRadius: selectedMember === member.id ? 15 : 0,
                        shadowColor: COLORS.primary,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: selectedMember === member.id ? 8 : 0,
                      }
                    ]}
                  >
                    <Image 
                      source={{ uri: member.avatar }} 
                      style={styles.memberAvatar} 
                    />
                    {selectedMember === member.id && (
                      <View style={styles.glowEffect} />
                    )}
                  </Animated.View>
          </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>
        
        {/* Seçili üye bilgileri */}
        {selectedMember && (
          <View style={styles.memberInfoCard}>
            <View style={styles.memberInfoHeader}>
              <Image 
                source={{ uri: memberData.find(m => m.id === selectedMember)?.avatar }} 
                style={styles.memberInfoAvatar} 
              />
              <View style={styles.memberInfoText}>
                <Text style={styles.memberInfoName}>
                  {memberData.find(m => m.id === selectedMember)?.name}
                </Text>
                <Text style={styles.memberInfoBrand}>
                  {memberData.find(m => m.id === selectedMember)?.brand} Influencer Elçisidir
                </Text>
                
                {/* Sosyal Medya Hesapları */}
                <View style={styles.socialMediaSection}>
                  <View style={styles.socialMediaItem}>
                    <IconButton icon="instagram" iconColor={COLORS.instagram} size={20} style={{ margin: 0 }} />
                    <Text style={styles.socialMediaText}>
                      {memberData.find(m => m.id === selectedMember)?.socialMedia.instagram}
                    </Text>
                  </View>
                  <View style={styles.socialMediaItem}>
                    <IconButton icon="music-note" iconColor={COLORS.tiktok} size={20} style={{ margin: 0 }} />
                    <Text style={styles.socialMediaText}>
                      {memberData.find(m => m.id === selectedMember)?.socialMedia.tiktok}
                    </Text>
                  </View>
                  <View style={styles.socialMediaItem}>
                    <IconButton icon="youtube" iconColor={COLORS.youtube} size={20} style={{ margin: 0 }} />
                    <Text style={styles.socialMediaText}>
                      {memberData.find(m => m.id === selectedMember)?.socialMedia.youtube}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.memberInfoDescription}>
                  {memberData.find(m => m.id === selectedMember)?.description}
                </Text>
              </View>
            </View>
          </View>
        )}
    </View>
  );
  };

  const renderNextTask = () => {
    // Mock görev üyesi profil resimleri (farklı fotoğraflar)
    const taskMemberAvatars = [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    ];

    return (
    <View style={styles.nextTaskSection}>
      <Text style={styles.nextTaskTitle}>Sonraki Görev</Text>
      <TouchableOpacity style={styles.nextTaskCard} onPress={() => router.push('/tasks')}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight, COLORS.instagram]}
            style={styles.nextTaskGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
        <View style={styles.nextTaskContent}>
              <View style={styles.nextTaskHeader}>
          <View style={styles.nextTaskInfo}>
            <Text style={styles.nextTaskName}>Qora Kampanyası</Text>
            <Text style={styles.nextTaskTeam}>Bilim & Doğa Ekibi</Text>
          </View>
                <View style={styles.nextTaskStatus}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Aktif</Text>
            </View>
            </View>
            </View>
              
              <View style={styles.nextTaskProgress}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
            </View>
                <Text style={styles.progressText}>%75 Tamamlandı</Text>
            </View>
              
              <View style={styles.nextTaskFooter}>
          <View style={styles.nextTaskMembers}>
                  <Text style={styles.membersLabel}>Ekip Üyeleri:</Text>
                  {taskMemberAvatars.map((avatar, index) => (
                    <Image 
                      key={index} 
                      source={{ uri: avatar }} 
                      style={styles.taskMemberAvatar} 
                    />
            ))}
          </View>
                                <View style={styles.nextTaskActions}>
                  <IconButton
                    icon="play"
                    iconColor={COLORS.text}
                    size={24}
                    style={styles.actionButton}
                    onPress={() => setVideoModalVisible(true)}
                  />
                  <IconButton
                    icon="calendar"
                    iconColor={COLORS.text}
                    size={24}
                    style={styles.actionButton}
                    onPress={() => setScheduleModalVisible(true)}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
      </TouchableOpacity>
    </View>
  );
  };

  // Apply filters to campaigns
  const filteredCampaigns: Campaign[] = React.useMemo(() => {
    const inBudget = (budget: number) => {
      switch (selectedBudgetRange) {
        case '0-1K':
          return budget <= 1000;
        case '1K-5K':
          return budget > 1000 && budget <= 5000;
        case '5K-10K':
          return budget > 5000 && budget <= 10000;
        case '10K+':
          return budget > 10000;
        default:
          return true;
      }
    };

    return mockCampaigns.filter((c) => {
      // platforms
      const platformOk = selectedPlatforms.length === 0
        ? true
        : c.platforms.some((p) => selectedPlatforms.includes(p as Platform));

      // budget
      const budgetOk = inBudget(c.budget);

      // category
      const categoryOk = selectedCategories.length === 0
        ? true
        : selectedCategories.includes(c.category as CampaignCategory);

      return platformOk && budgetOk && categoryOk;
    });
  }, [selectedPlatforms, selectedBudgetRange, selectedCategories]);

  const renderCampaignCard = ({ item }: { item: Campaign }) => (
    <Card style={styles.campaignCard} onPress={() => router.push(`/campaign/${item.id}`)}>
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.campaignImage} />
      {item.isSpecialInvitation && (
        <View style={styles.specialInvitationTag}>
          <Text style={styles.specialInvitationText}>Özel Davet</Text>
        </View>
      )}
      <Card.Content style={styles.cardContent}>
        <View style={styles.platformIcons}>
          {item.platforms.map((platform) => (
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
                size={12}
                style={{ margin: 0 }}
              />
            </View>
          ))}
        </View>

        <Text style={styles.campaignTitle}>{item.title}</Text>
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>{item.brand}</Text>
        </View>
        <Text style={styles.campaignDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.campaignDetails}>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Bütçe</Text>
            <Text style={styles.budgetAmount}>
              {item.budget.toLocaleString()} {item.budgetCurrency}
            </Text>
          </View>

          <View style={styles.requirementsContainer}>
            <IconButton icon="account-group" iconColor="#FFD54F" size={16} />
            <Text style={styles.requirementText}>Min {item.minFollowers.toLocaleString()} takipçi</Text>
          </View>

          <View style={styles.deadlineContainer}>
            <IconButton icon="calendar" iconColor="#FFD54F" size={16} />
            <Text style={styles.deadlineText}>
              {item.deadline.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => router.push(`/campaign/${item.id}`)}
          style={styles.detailsButton}
          labelStyle={styles.detailsButtonText}
          buttonColor={COLORS.primary}
          textColor={COLORS.text}
        >
          Detayları Gör
        </Button>
      </Card.Content>
    </Card>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Burada veri yenileme işlemleri yapılabilir
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.spacing.md }]}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        </View>
        <View style={styles.headerIcons}>
          <IconButton
            icon="database"
            iconColor={COLORS.text}
            size={24}
            onPress={() => router.push('/seed-data')}
            style={{ marginRight: 8 }}
          />
          <View style={styles.notificationButton}>
            <IconButton
              icon="bell"
              iconColor={COLORS.text}
              size={24}
              onPress={() => setNotificationsVisible(true)}
            />
            {mockNotifications.filter(n => !n.isRead).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {mockNotifications.filter(n => !n.isRead).length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Ambassador Section */}
        <View style={styles.ambassadorSection}>
          {renderAmbassadorHeader()}
          {renderTaskSummary()}
          {renderMembersSection()}
          {renderNextTask()}
        </View>

        {/* Campaigns Section */}
        <View style={styles.campaignsSection}>
          <Text style={styles.campaignsSectionTitle}>Kampanyalar</Text>
          
          {/* Filters */}
          <View style={styles.filtersContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <TouchableOpacity onPress={() => setFiltersOpen((p) => !p)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <View style={styles.filterTrigger}>
                  <IconButton
                    icon="tune"
                    iconColor={COLORS.primary}
                    size={18}
                    onPress={() => setFiltersOpen((p) => !p)}
                    style={{ margin: 0 }}
                  />
                </View>
              </TouchableOpacity>
              {filtersOpen && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.toolbarScroll}
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {/* Platforms - icons only */}
                  <View style={styles.toolbarGroup}>
                    {platforms.map((p) => (
                      <TouchableOpacity key={p.key} onPress={() => handlePlatformToggle(p.key as Platform)}>
                        <View style={[styles.platformIconSquare, selectedPlatforms.includes(p.key as Platform) && styles.platformSquareSelected]}>
                          <IconButton icon={p.icon} size={20} style={{ margin: 0 }} iconColor={selectedPlatforms.includes(p.key as Platform) ? COLORS.primary : (p.key === 'instagram' ? COLORS.instagram : p.key === 'tiktok' ? COLORS.tiktok : COLORS.youtube)} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Budget - yellow boxes */}
                  <View style={styles.toolbarGroup}>
                    {budgetRanges.map((range) => (
                      <TouchableOpacity key={range.key} onPress={() => handleBudgetRangeToggle(range.key)}>
                        <View style={[styles.budgetChip, selectedBudgetRange === range.key && styles.budgetChipSelected]}>
                          <Text style={[styles.budgetChipText, selectedBudgetRange === range.key && styles.budgetChipTextSelected]}>{range.label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Categories - white chips; skip 'all' */}
                  <View style={styles.toolbarGroup}>
                    {categories.map((c) => (
                      <TouchableOpacity key={c.key} onPress={() => handleCategoryToggle(c.key as CampaignCategory)}>
                        <View style={[styles.categoryChip, selectedCategories.includes(c.key as CampaignCategory) && styles.categoryChipSelected]}>
                          <Text style={[styles.categoryChipText, selectedCategories.includes(c.key as CampaignCategory) && styles.categoryChipTextSelected]}>{c.label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>

          {/* Campaigns List */}
          <View style={styles.campaignsList}>
            {filteredCampaigns.map((item) => (
              <View key={item.id}>
                {renderCampaignCard({ item })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />

      {/* Video Modal */}
      <Portal>
        <Modal
          visible={videoModalVisible}
          onDismiss={() => setVideoModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight, COLORS.instagram]}
            style={styles.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <IconButton icon="play-circle" iconColor={COLORS.text} size={24} style={{ margin: 0 }} />
                  <Text style={styles.modalTitle}>Görev Videosu</Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor={COLORS.text}
                  size={24}
                  style={styles.closeButton}
                  onPress={() => setVideoModalVisible(false)}
                />
              </View>
              
              <View style={styles.videoContainer}>
                <View style={styles.videoPlaceholder}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.videoGradient}
                  >
                    <IconButton
                      icon="play-circle"
                      iconColor={COLORS.text}
                      size={80}
                    />
                    <Text style={styles.videoPlaceholderText}>Video Yükleniyor...</Text>
                  </LinearGradient>
                </View>
              </View>
              
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>Qora Kampanyası</Text>
                <Text style={styles.videoDescription}>
                  Bu video, Qora Bilim & Doğa Kampı kampanyasının nasıl yürütüleceğini ve hangi noktalara dikkat edilmesi gerektiğini açıklamaktadır.
                </Text>
                <View style={styles.videoStats}>
                  <View style={styles.videoStat}>
                    <View style={styles.statIconContainer}>
                      <IconButton icon="clock" iconColor={COLORS.text} size={20} style={{ margin: 0 }} />
                    </View>
                    <Text style={styles.videoStatText}>5:32 dk</Text>
                  </View>
                  <View style={styles.videoStat}>
                    <View style={styles.statIconContainer}>
                      <IconButton icon="eye" iconColor={COLORS.text} size={20} style={{ margin: 0 }} />
                    </View>
                    <Text style={styles.videoStatText}>1.2K görüntüleme</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Modal>
      </Portal>

      {/* Schedule Modal */}
      <Portal>
        <Modal
          visible={scheduleModalVisible}
          onDismiss={() => setScheduleModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight, COLORS.youtube]}
            style={styles.modalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <IconButton icon="calendar-clock" iconColor={COLORS.text} size={24} style={{ margin: 0 }} />
                  <Text style={styles.modalTitle}>Görev Süresi</Text>
                </View>
                <IconButton
                  icon="close"
                  iconColor={COLORS.text}
                  size={24}
                  style={styles.closeButton}
                  onPress={() => setScheduleModalVisible(false)}
                />
              </View>
              
              <View style={styles.scheduleInfo}>
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleIconContainer}>
                    <IconButton icon="calendar-start" iconColor={COLORS.text} size={24} style={{ margin: 0 }} />
                  </View>
                  <View style={styles.scheduleText}>
                    <Text style={styles.scheduleLabel}>Başlangıç Tarihi</Text>
                    <Text style={styles.scheduleValue}>15 Mart 2024</Text>
                  </View>
                </View>
                
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleIconContainer}>
                    <IconButton icon="calendar-end" iconColor={COLORS.text} size={24} style={{ margin: 0 }} />
                  </View>
                  <View style={styles.scheduleText}>
                    <Text style={styles.scheduleLabel}>Bitiş Tarihi</Text>
                    <Text style={styles.scheduleValue}>22 Mart 2024</Text>
                  </View>
                </View>
                
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleIconContainer}>
                    <IconButton icon="clock-outline" iconColor={COLORS.text} size={24} style={{ margin: 0 }} />
                  </View>
                  <View style={styles.scheduleText}>
                    <Text style={styles.scheduleLabel}>Kalan Süre</Text>
                    <Text style={styles.scheduleValue}>3 gün 12 saat</Text>
                  </View>
                </View>
                
                <View style={styles.scheduleItem}>
                  <View style={styles.scheduleIconContainer}>
                    <IconButton icon="progress-clock" iconColor={COLORS.text} size={24} style={{ margin: 0 }} />
                  </View>
                  <View style={styles.scheduleText}>
                    <Text style={styles.scheduleLabel}>İlerleme</Text>
                    <Text style={styles.scheduleValue}>%75 Tamamlandı</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.scheduleProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
                <Text style={styles.progressText}>3/4 aşama tamamlandı</Text>
              </View>
            </View>
          </LinearGradient>
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
  filtersContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm,
    overflow: 'visible',
    zIndex: 1,
  },
  filtersScrollView: { flexGrow: 0 },
  filtersPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  filterSection: { marginRight: 0 },
  filterLabel: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  toolbarScroll: { marginLeft: SIZES.spacing.sm, flex: 1 },
  toolbarGroup: { flexDirection: 'row', alignItems: 'center', gap: SIZES.spacing.sm, marginRight: SIZES.spacing.lg },
  budgetChip: { backgroundColor: '#FFD54F', paddingHorizontal: 10, paddingVertical: 6, borderRadius: SIZES.radius.md },
  budgetChipSelected: { backgroundColor: COLORS.primary, borderWidth: 0 },
  budgetChipText: { color: '#1A1A2E', fontFamily: FONTS.medium, fontSize: SIZES.sm },
  budgetChipTextSelected: { color: COLORS.text },
  categoryChip: { backgroundColor: COLORS.text, paddingHorizontal: 10, paddingVertical: 6, borderRadius: SIZES.radius.md },
  categoryChipSelected: { backgroundColor: COLORS.primary, borderWidth: 0 },
  categoryChipText: { color: '#1A1A2E', fontFamily: FONTS.medium, fontSize: SIZES.sm },
  categoryChipTextSelected: { color: COLORS.text },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
    marginTop: 0,
  },
  chip: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.primary,
    marginBottom: SIZES.spacing.xs,
  },
  chipText: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
  },
  campaignsList: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  campaignCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
  },
  campaignImage: {
    height: 200,
  },
  specialInvitationTag: {
    position: 'absolute',
    top: SIZES.spacing.sm,
    right: SIZES.spacing.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  specialInvitationText: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
  },
  cardContent: {
    padding: SIZES.spacing.lg,
  },
  platformIcons: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.sm,
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
  campaignTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  campaignBrand: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD54F',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
    marginBottom: SIZES.spacing.sm,
  },
  brandBadgeText: {
    color: '#1A1A2E',
    fontFamily: FONTS.bold,
    fontSize: SIZES.sm,
  },
  campaignDescription: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.md,
    lineHeight: 18,
  },
  campaignDetails: {
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
  detailsButton: {
    borderRadius: SIZES.radius.md,
  },
  detailsButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
  },
  platformContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: 0,
  },
  platformIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformIconSquare: {
    backgroundColor: COLORS.text,
    borderRadius: SIZES.radius.sm,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformSquareSelected: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  platformIconButton: {
    margin: 0,
  },
  platformLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
    textAlign: 'center',
  },
  platformLabelSelected: {
    color: COLORS.text,
  },
  filterTrigger: {
    backgroundColor: COLORS.text,
    borderRadius: 20,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.sm,
  },
  // Ambassador Section Styles
  ambassadorSection: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.lg,
  },
  ambassadorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  ambassadorUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ambassadorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.spacing.md,
  },
  ambassadorGreeting: {
    flex: 1,
  },
  ambassadorGreetingText: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  ambassadorDateText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  ambassadorNotificationButton: {
    position: 'relative',
  },
  ambassadorNotificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambassadorNotificationBadgeText: {
    color: COLORS.text,
    fontSize: SIZES.xs,
    fontFamily: FONTS.bold,
  },
  taskSummaryContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  taskSummaryText: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  membersSection: {
    marginBottom: SIZES.spacing.md,
  },
  membersTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  membersScroll: {
    flexGrow: 0,
  },
  membersScrollContent: {
    alignItems: 'center',
  },
  membersAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  memberAvatarContainer: {
    marginRight: SIZES.spacing.sm,
  },
  memberAvatarWrapper: {
    position: 'relative',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  glowEffect: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
    zIndex: -1,
  },
  memberInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginTop: SIZES.spacing.md,
    ...SHADOWS.medium,
  },
  memberInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.spacing.md,
  },
  memberInfoText: {
    flex: 1,
  },
  memberInfoName: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  memberInfoBrand: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SIZES.spacing.xs,
  },
  memberInfoDescription: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  socialMediaSection: {
    marginVertical: SIZES.spacing.sm,
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  socialMediaText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SIZES.spacing.xs,
  },
  nextTaskSection: {
    marginBottom: SIZES.spacing.lg,
    marginTop: SIZES.spacing.sm,
  },
  nextTaskTitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  nextTaskCard: {
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  nextTaskGradient: {
    padding: SIZES.spacing.lg,
  },
  nextTaskContent: {
    flex: 1,
  },
  nextTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.md,
  },
  nextTaskInfo: {
    flex: 1,
  },
  nextTaskName: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  nextTaskTeam: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
  },
  nextTaskStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  nextTaskProgress: {
    marginBottom: SIZES.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: SIZES.spacing.xs,
  },
  progressFill: {
    height: '100%',
    width: '75%',
    backgroundColor: COLORS.text,
    borderRadius: 3,
  },
  progressText: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    opacity: 0.8,
  },
  nextTaskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextTaskMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  membersLabel: {
    fontSize: SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    opacity: 0.8,
    marginRight: SIZES.spacing.xs,
  },
  taskMemberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  nextTaskActions: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: 0,
  },
  // Modal Styles
  modalContainer: {
    backgroundColor: 'transparent',
    margin: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalGradient: {
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.large,
  },
  modalContent: {
    padding: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.radius.sm,
  },
  // Video Modal Styles
  videoContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  videoPlaceholder: {
    borderRadius: SIZES.radius.lg,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  videoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginTop: SIZES.spacing.sm,
  },
  videoInfo: {
    gap: SIZES.spacing.sm,
  },
  videoTitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  videoDescription: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  videoStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.lg,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.xs,
  },
  videoStatText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
  },
  // Schedule Modal Styles
  scheduleInfo: {
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.radius.sm,
    padding: SIZES.spacing.xs,
  },
  scheduleText: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  scheduleLabel: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    opacity: 0.8,
  },
  scheduleValue: {
    fontSize: SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 2,
  },
  scheduleProgress: {
    gap: SIZES.spacing.sm,
  },
  // Campaigns Section Styles
  campaignsSection: {
    flex: 1,
  },
  campaignsSectionTitle: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  scrollContainer: {
    flex: 1,
  },
});
