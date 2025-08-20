import { supabase } from './supabase';
import { mockCampaigns, mockUser, mockApplications, mockInvitations, mockNotifications } from '../constants/mockData';
import { mockBrands, mockAmbassadorLevels, mockAmbassadorPrograms, mockAmbassadorTasks, mockAmbassadorApplications, mockAmbassadorProfile } from '../constants/ambassadorMockData';

// Demo user ID - bu ID'yi Supabase Auth'ta oluşturmanız gerekiyor
const DEMO_USER_ID = 'demo-user-123';

export const seedAllData = async () => {
  console.log('🚀 Supabase veritabanına tüm veriler ekleniyor...');
  
  try {
    // 1. Kullanıcı verilerini ekle
    await seedUserData();
    
    // 2. Sosyal medya hesaplarını ekle
    await seedSocialMediaData();
    
    // 3. Kampanyaları ekle
    await seedCampaignsData();
    
    // 4. Başvuruları ekle
    await seedApplicationsData();
    
    // 5. Davetleri ekle
    await seedInvitationsData();
    
    // 6. Bildirimleri ekle
    await seedNotificationsData();
    
    // 7. Cüzdan verilerini ekle
    await seedWalletData();
    
    // 8. Promo kodlarını ekle
    await seedPromoCodesData();
    
    // 9. İşlem geçmişini ekle
    await seedTransactionsData();
    
    // 10. Ambassador sistemini ekle
    await seedAmbassadorData();
    
    console.log('✅ Tüm veriler başarıyla eklendi!');
    return true;
  } catch (error) {
    console.error('❌ Veri ekleme hatası:', error);
    return false;
  }
};

const seedUserData = async () => {
  console.log('👤 Kullanıcı verileri ekleniyor...');
  
  const { error } = await supabase
    .from('users')
    .upsert({
      id: DEMO_USER_ID,
      email: mockUser.email,
      first_name: mockUser.firstName,
      last_name: mockUser.lastName,
      profile_image: mockUser.profileImage,
      bio: mockUser.bio,
      follower_count: mockUser.followerCount,
      content_categories: mockUser.contentCategories,
      is_ambassador: true,
      ambassador_level: 2
    });

  if (error) {
    console.error('Kullanıcı ekleme hatası:', error);
    throw error;
  }
  
  console.log('✅ Kullanıcı verileri eklendi');
};

const seedSocialMediaData = async () => {
  console.log('📱 Sosyal medya hesapları ekleniyor...');
  
  const socialMediaData = [
    {
      user_id: DEMO_USER_ID,
      platform: 'instagram',
      username: mockUser.socialMedia.instagram?.username || '',
      followers: mockUser.socialMedia.instagram?.followers || 0,
      verified: mockUser.socialMedia.instagram?.verified || false
    },
    {
      user_id: DEMO_USER_ID,
      platform: 'tiktok',
      username: mockUser.socialMedia.tiktok?.username || '',
      followers: mockUser.socialMedia.tiktok?.followers || 0,
      verified: mockUser.socialMedia.tiktok?.verified || false
    },
    {
      user_id: DEMO_USER_ID,
      platform: 'youtube',
      username: mockUser.socialMedia.youtube?.channelId || '',
      followers: mockUser.socialMedia.youtube?.subscribers || 0,
      verified: mockUser.socialMedia.youtube?.verified || false
    }
  ];

  for (const account of socialMediaData) {
    const { error } = await supabase
      .from('social_media_accounts')
      .upsert(account);

    if (error) {
      console.error('Sosyal medya hesabı ekleme hatası:', error);
      throw error;
    }
  }
  
  console.log('✅ Sosyal medya hesapları eklendi');
};

const seedCampaignsData = async () => {
  console.log('🎯 Kampanyalar ekleniyor...');
  
  for (const campaign of mockCampaigns) {
    const { error } = await supabase
      .from('campaigns')
      .upsert({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        brand: campaign.brand,
        creators: campaign.creators || null,
        budget: campaign.budget,
        budget_currency: campaign.budgetCurrency,
        platforms: campaign.platforms,
        category: campaign.category,
        requirements: campaign.requirements,
        example_content: campaign.exampleContent,
        min_followers: campaign.minFollowers,
        max_followers: campaign.maxFollowers || null,
        deadline: campaign.deadline.toISOString().split('T')[0],
        status: campaign.status,
        is_special_invitation: campaign.isSpecialInvitation,
        image_url: campaign.imageUrl
      });

    if (error) {
      console.error('Kampanya ekleme hatası:', error);
      throw error;
    }
  }
  
  console.log('✅ Kampanyalar eklendi');
};

const seedApplicationsData = async () => {
  console.log('📝 Başvurular ekleniyor...');
  
  for (const application of mockApplications) {
    const { error } = await supabase
      .from('applications')
      .upsert({
        id: application.id,
        user_id: DEMO_USER_ID,
        campaign_id: application.campaignId,
        status: application.status,
        personal_message: application.personalMessage,
        sample_content: application.sampleContent || null,
        price_offer: application.priceOffer || null,
        delivery_time: application.deliveryTime || null,
        applied_at: application.appliedAt.toISOString()
      });

    if (error) {
      console.error('Başvuru ekleme hatası:', error);
      throw error;
    }
  }
  
  console.log('✅ Başvurular eklendi');
};

const seedInvitationsData = async () => {
  console.log('📨 Davetler ekleniyor...');
  
  for (const invitation of mockInvitations) {
    const { error } = await supabase
      .from('invitations')
      .upsert({
        id: invitation.id,
        user_id: DEMO_USER_ID,
        campaign_id: invitation.campaignId,
        is_special: invitation.isSpecial,
        sent_at: invitation.sentAt.toISOString(),
        expires_at: invitation.expiresAt.toISOString()
      });

    if (error) {
      console.error('Davet ekleme hatası:', error);
      throw error;
    }
  }
  
  console.log('✅ Davetler eklendi');
};

const seedNotificationsData = async () => {
  console.log('🔔 Bildirimler ekleniyor...');
  
  for (const notification of mockNotifications) {
    const { error } = await supabase
      .from('notifications')
      .upsert({
        id: notification.id,
        user_id: DEMO_USER_ID,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        is_read: notification.isRead,
        created_at: notification.createdAt.toISOString()
      });

    if (error) {
      console.error('Bildirim ekleme hatası:', error);
      throw error;
    }
  }
  
  console.log('✅ Bildirimler eklendi');
};

const seedWalletData = async () => {
  console.log('💰 Cüzdan verileri ekleniyor...');
  
  const { error } = await supabase
    .from('wallets')
    .upsert({
      user_id: DEMO_USER_ID,
      balance: 1250.75,
      total_earnings: 8500.00
    });

  if (error) {
    console.error('Cüzdan ekleme hatası:', error);
    throw error;
  }
  
  console.log('✅ Cüzdan verileri eklendi');
};

const seedPromoCodesData = async () => {
  console.log('🎫 Promo kodları ekleniyor...');
  
  const promoCodes = [
    {
      user_id: DEMO_USER_ID,
      code: 'ROOKLANCE20',
      discount: '20₺',
      description: 'Tüm ürünlerde %20 indirim',
      valid_until: '2024-12-31',
      is_used: false,
      color_start: '#6366f1',
      color_end: '#8b5cf6'
    },
    {
      user_id: DEMO_USER_ID,
      code: 'NEWUSER30',
      discount: '30₺',
      description: 'Yeni kullanıcılar için',
      valid_until: '2024-11-20',
      is_used: false,
      color_start: '#ec4899',
      color_end: '#f43f5e'
    },
    {
      user_id: DEMO_USER_ID,
      code: 'FLASH25',
      discount: '25₺',
      description: 'Flash satışlarda %25 indirim',
      valid_until: '2024-11-15',
      is_used: false,
      color_start: '#10b981',
      color_end: '#6366f1'
    },
    {
      user_id: DEMO_USER_ID,
      code: 'VIP100',
      discount: '100₺',
      description: 'VIP üyeler için özel indirim',
      valid_until: '2024-10-30',
      is_used: true,
      color_start: '#f59e0b',
      color_end: '#ef4444'
    },
    {
      user_id: DEMO_USER_ID,
      code: 'WELCOME50',
      discount: '50₺',
      description: 'İlk siparişinizde %50 indirim',
      valid_until: '2024-12-31',
      is_used: false,
      color_start: '#06b6d4',
      color_end: '#6366f1'
    }
  ];

  for (const promoCode of promoCodes) {
    const { error } = await supabase
      .from('promo_codes')
      .upsert(promoCode);

    if (error) {
      console.error('Promo kod ekleme hatası:', error);
      throw error;
    }
  }
  
  console.log('✅ Promo kodları eklendi');
};

const seedTransactionsData = async () => {
  console.log('💳 İşlem geçmişi ekleniyor...');
  
  const transactions = [
    {
      user_id: DEMO_USER_ID,
      amount: 500.00,
      type: 'earning',
      description: 'Referans kazancı',
      status: 'completed'
    },
    {
      user_id: DEMO_USER_ID,
      amount: -200.00,
      type: 'withdrawal',
      description: 'Para çekme işlemi',
      status: 'completed'
    },
    {
      user_id: DEMO_USER_ID,
      amount: 150.75,
      type: 'earning',
      description: 'Komisyon kazancı',
      status: 'completed'
    },
    {
      user_id: DEMO_USER_ID,
      amount: 3000.00,
      type: 'campaign_payment',
      description: 'Daadi Snacks kampanya ödemesi',
      status: 'completed',
      campaign_id: '7',
      application_id: '4'
    }
  ];

  for (const transaction of transactions) {
    const { error } = await supabase
      .from('transactions')
      .upsert(transaction);

    if (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  }
  
  console.log('✅ İşlem geçmişi eklendi');
};

const seedAmbassadorData = async () => {
  console.log('👑 Ambassador sistemi ekleniyor...');
  
  // 1. Markaları ekle (tüm markaları dahil et)
  for (const brand of mockBrands) {
    const { error } = await supabase
      .from('brands')
      .upsert({
        id: brand.id,
        name: brand.name,
        description: brand.description,
        logo_url: brand.logoUrl,
        website_url: brand.websiteUrl,
        industry: brand.industry,
        brief_video_url: brand.briefVideoUrl,
        detailed_brief: brand.detailedBrief,
        requirements: brand.requirements,
        benefits: brand.benefits,
        status: brand.status
      });

    if (error) {
      console.error('Marka ekleme hatası:', error);
      throw error;
    }
  }
  
  // 2. Ambassador seviyelerini ekle
  for (const level of mockAmbassadorLevels) {
    const { error } = await supabase
      .from('ambassador_levels')
      .upsert({
        id: level.id,
        level: level.level,
        name: level.name,
        description: level.description,
        min_tasks_completed: level.minTasksCompleted,
        min_earnings: level.minEarnings,
        benefits: level.benefits,
        badge_icon: level.badgeIcon
      });

    if (error) {
      console.error('Ambassador seviyesi ekleme hatası:', error);
      throw error;
    }
  }
  
  // 3. Ambassador programlarını ekle (tüm programları dahil et)
  for (const program of mockAmbassadorPrograms) {
    const { error } = await supabase
      .from('ambassador_programs')
      .upsert({
        id: program.id,
        brand_id: program.brandId,
        title: program.title,
        description: program.description,
        requirements: program.requirements,
        benefits: program.benefits,
        commission_rate: program.commissionRate,
        status: program.status
      });

    if (error) {
      console.error('Ambassador programı ekleme hatası:', error);
      throw error;
    }
  }
  
  // 4. Ambassador görevlerini ekle (tüm görevleri dahil et)
  for (const task of mockAmbassadorTasks) {
    const { error } = await supabase
      .from('ambassador_tasks')
      .upsert({
        id: task.id,
        program_id: task.programId,
        title: task.title,
        description: task.description,
        task_type: task.taskType,
        requirements: task.requirements,
        deliverables: task.deliverables,
        reward_amount: task.rewardAmount,
        reward_currency: task.rewardCurrency,
        deadline_days: task.deadlineDays,
        priority: task.priority,
        status: task.status
      });

    if (error) {
      console.error('Ambassador görevi ekleme hatası:', error);
      throw error;
    }
  }
  
  // 5. Ambassador başvurularını ekle
  for (const application of mockAmbassadorApplications) {
    const { error } = await supabase
      .from('ambassador_applications')
      .upsert({
        id: application.id,
        user_id: DEMO_USER_ID,
        program_id: application.programId,
        status: application.status,
        motivation_text: application.motivationText,
        experience_text: application.experienceText,
        portfolio_links: application.portfolioLinks,
        applied_at: application.appliedAt.toISOString()
      });

    if (error) {
      console.error('Ambassador başvurusu ekleme hatası:', error);
      throw error;
    }
  }
  
  // 6. Ambassador profilini ekle
  const { error } = await supabase
    .from('ambassador_profiles')
    .upsert({
      id: mockAmbassadorProfile.id,
      user_id: DEMO_USER_ID,
      level_id: mockAmbassadorProfile.levelId,
      current_level: mockAmbassadorProfile.currentLevel,
      total_tasks_completed: mockAmbassadorProfile.totalTasksCompleted,
      total_earnings: mockAmbassadorProfile.totalEarnings,
      active_programs: mockAmbassadorProfile.activePrograms,
      badges: mockAmbassadorProfile.badges,
      bio: mockAmbassadorProfile.bio,
      specialties: mockAmbassadorProfile.specialties
    });

  if (error) {
    console.error('Ambassador profili ekleme hatası:', error);
    throw error;
  }
  
  console.log('✅ Ambassador sistemi eklendi');
};

// Test fonksiyonu
export const testDatabaseConnection = async () => {
  console.log('🔍 Veritabanı bağlantısı test ediliyor...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Veritabanı bağlantı hatası:', error);
      return false;
    }
    
    console.log('✅ Veritabanı bağlantısı başarılı');
    return true;
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
    return false;
  }
};

// Veri temizleme fonksiyonu (geliştirme için)
export const clearAllData = async () => {
  console.log('🧹 Tüm veriler temizleniyor...');
  
  try {
    const tables = [
      'ambassador_task_submissions',
      'ambassador_applications',
      'ambassador_tasks',
      'ambassador_programs',
      'ambassador_profiles',
      'ambassador_levels',
      'brands',
      'transactions',
      'promo_codes',
      'wallets',
      'notifications',
      'invitations',
      'applications',
      'campaigns',
      'social_media_accounts',
      'users'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // UUID olmayan kayıtları koru

      if (error) {
        console.error(`${table} tablosu temizleme hatası:`, error);
      }
    }
    
    console.log('✅ Tüm veriler temizlendi');
    return true;
  } catch (error) {
    console.error('❌ Veri temizleme hatası:', error);
    return false;
  }
};
