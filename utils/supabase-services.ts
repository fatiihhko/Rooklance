import { supabase } from './supabase';
import { Campaign, User, Application, Invitation, Notification, FilterOptions } from '../types';

// User Service
export const userService = {
  // Kullanıcı profilini getir (ID ile)
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      console.log('getUserProfile called with user ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          social_media_accounts (*)
        `)
        .eq('id', userId)
        .single();
      
      console.log('Supabase query result - data:', data);
      console.log('Supabase query result - error:', error);

      if (error) {
        console.log('Supabase error:', error);
        // Eğer kullanıcı bulunamazsa, null döndür
        if (error.code === 'PGRST116') {
          console.log('User not found in database');
          return null;
        }
        throw error;
      }
      
      if (data) {
        const transformedData = this.transformUserData(data);
        console.log('Transformed user data:', transformedData);
        return transformedData;
      }
      
      console.log('No user data found');
      return null;
    } catch (error) {
      console.error('Kullanıcı profili alınamadı:', error);
      return null;
    }
  },

  // Kullanıcı profilini güncelle
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          bio: profileData.bio,
          profile_image: profileData.profileImage,
          content_categories: profileData.contentCategories,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data ? this.transformUserData(data) : null;
    } catch (error) {
      console.error('Kullanıcı profili güncellenemedi:', error);
      return null;
    }
  },

  // Sosyal medya hesaplarını güncelle
  async updateSocialMediaAccounts(userId: string, socialMedia: any): Promise<boolean> {
    try {
      const accounts = [];
      
      if (socialMedia.instagram) {
        accounts.push({
          user_id: userId,
          platform: 'instagram',
          username: socialMedia.instagram.username,
          followers: socialMedia.instagram.followers,
          verified: socialMedia.instagram.verified
        });
      }
      
      if (socialMedia.tiktok) {
        accounts.push({
          user_id: userId,
          platform: 'tiktok',
          username: socialMedia.tiktok.username,
          followers: socialMedia.tiktok.followers,
          verified: socialMedia.tiktok.verified
        });
      }
      
      if (socialMedia.youtube) {
        accounts.push({
          user_id: userId,
          platform: 'youtube',
          username: socialMedia.youtube.channelId,
          followers: socialMedia.youtube.subscribers,
          verified: socialMedia.youtube.verified
        });
      }

      // Mevcut hesapları sil
      await supabase
        .from('social_media_accounts')
        .delete()
        .eq('user_id', userId);

      // Yeni hesapları ekle
      if (accounts.length > 0) {
        const { error } = await supabase
          .from('social_media_accounts')
          .insert(accounts);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Sosyal medya hesapları güncellenemedi:', error);
      return false;
    }
  },

  // Yeni kullanıcı oluştur
  async createUser(userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  }): Promise<User | null> {
    try {
      console.log('Creating user in Supabase:', userData);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          profile_image: userData.profileImage || 'https://via.placeholder.com/100'
        })
        .select()
        .single();

      if (error) {
        console.error('User creation error:', error);
        throw error;
      }
      
      console.log('User created successfully:', data);
      return data ? this.transformUserData(data) : null;
    } catch (error) {
      console.error('Kullanıcı oluşturulamadı:', error);
      return null;
    }
  },

  // Veri dönüşümü
  transformUserData(data: any): User {
    const socialMedia: any = {};
    
    if (data.social_media_accounts) {
      data.social_media_accounts.forEach((account: any) => {
        if (account.platform === 'instagram') {
          socialMedia.instagram = {
            username: account.username,
            followers: account.followers,
            verified: account.verified
          };
        } else if (account.platform === 'tiktok') {
          socialMedia.tiktok = {
            username: account.username,
            followers: account.followers,
            verified: account.verified
          };
        } else if (account.platform === 'youtube') {
          socialMedia.youtube = {
            channelId: account.username,
            subscribers: account.followers,
            verified: account.verified
          };
        }
      });
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImage: data.profile_image,
      bio: data.bio,
      socialMedia,
      followerCount: data.follower_count,
      contentCategories: data.content_categories || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
};

// Campaign Service
export const campaignService = {
  // Tüm kampanyaları getir
  async getCampaigns(filters?: FilterOptions): Promise<Campaign[]> {
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active');

      // Filtreleri uygula
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      if (filters?.platforms && filters.platforms.length > 0) {
        query = query.overlaps('platforms', filters.platforms);
      }

      if (filters?.budgetRange) {
        query = query
          .gte('budget', filters.budgetRange.min)
          .lte('budget', filters.budgetRange.max);
      }

      if (filters?.followerRange) {
        query = query
          .gte('min_followers', filters.followerRange.min)
          .lte('min_followers', filters.followerRange.max);
      }

      if (filters?.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data ? data.map(this.transformCampaignData) : [];
    } catch (error) {
      console.error('Kampanyalar alınamadı:', error);
      return [];
    }
  },

  // Kampanya detayını getir
  async getCampaignById(campaignId: string): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return data ? this.transformCampaignData(data) : null;
    } catch (error) {
      console.error('Kampanya detayı alınamadı:', error);
      return null;
    }
  },

  // Veri dönüşümü
  transformCampaignData(data: any): Campaign {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      brand: data.brand,
      creators: data.creators || [],
      budget: data.budget,
      budgetCurrency: data.budget_currency,
      platforms: data.platforms,
      category: data.category,
      requirements: data.requirements,
      exampleContent: data.example_content,
      minFollowers: data.min_followers,
      maxFollowers: data.max_followers,
      deadline: new Date(data.deadline),
      status: data.status,
      isSpecialInvitation: data.is_special_invitation,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
};

// Application Service
export const applicationService = {
  // Kullanıcının başvurularını getir
  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          campaigns (*)
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data ? data.map(this.transformApplicationData) : [];
    } catch (error) {
      console.error('Başvurular alınamadı:', error);
      return [];
    }
  },

  // Yeni başvuru oluştur
  async createApplication(applicationData: {
    userId: string;
    campaignId: string;
    personalMessage?: string;
    sampleContent?: string;
    priceOffer?: number;
    deliveryTime?: number;
  }): Promise<Application | null> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: applicationData.userId,
          campaign_id: applicationData.campaignId,
          personal_message: applicationData.personalMessage,
          sample_content: applicationData.sampleContent,
          price_offer: applicationData.priceOffer,
          delivery_time: applicationData.deliveryTime,
          status: 'pending'
        })
        .select(`
          *,
          campaigns (*)
        `)
        .single();

      if (error) throw error;
      return data ? this.transformApplicationData(data) : null;
    } catch (error) {
      console.error('Başvuru oluşturulamadı:', error);
      return null;
    }
  },

  // Başvuru durumunu güncelle
  async updateApplicationStatus(applicationId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Başvuru durumu güncellenemedi:', error);
      return false;
    }
  },

  // Veri dönüşümü
  transformApplicationData(data: any): Application {
    return {
      id: data.id,
      userId: data.user_id,
      campaignId: data.campaign_id,
      status: data.status,
      personalMessage: data.personal_message,
      sampleContent: data.sample_content,
      priceOffer: data.price_offer,
      deliveryTime: data.delivery_time,
      appliedAt: new Date(data.applied_at),
      updatedAt: new Date(data.updated_at),
      campaign: data.campaigns ? campaignService.transformCampaignData(data.campaigns) : undefined
    };
  }
};

// Invitation Service
export const invitationService = {
  // Kullanıcının davetlerini getir
  async getUserInvitations(userId: string): Promise<Invitation[]> {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          campaigns (*)
        `)
        .eq('user_id', userId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data ? data.map(this.transformInvitationData) : [];
    } catch (error) {
      console.error('Davetler alınamadı:', error);
      return [];
    }
  },

  // Veri dönüşümü
  transformInvitationData(data: any): Invitation {
    return {
      id: data.id,
      userId: data.user_id,
      campaignId: data.campaign_id,
      isSpecial: data.is_special,
      sentAt: new Date(data.sent_at),
      expiresAt: new Date(data.expires_at),
      campaign: data.campaigns ? campaignService.transformCampaignData(data.campaigns) : undefined
    };
  }
};

// Notification Service
export const notificationService = {
  // Kullanıcının bildirimlerini getir
  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ? data.map(this.transformNotificationData) : [];
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
      return [];
    }
  },

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Bildirim güncellenemedi:', error);
      return false;
    }
  },

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Bildirimler güncellenemedi:', error);
      return false;
    }
  },

  // Okunmamış bildirim sayısını getir
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Okunmamış bildirim sayısı alınamadı:', error);
      return 0;
    }
  },

  // Veri dönüşümü
  transformNotificationData(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      isRead: data.is_read,
      createdAt: new Date(data.created_at)
    };
  }
};
