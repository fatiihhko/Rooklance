export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio?: string;
  socialMedia: SocialMediaAccounts;
  followerCount: number;
  contentCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMediaAccounts {
  instagram?: {
    username: string;
    followers: number;
    verified: boolean;
  };
  tiktok?: {
    username: string;
    followers: number;
    verified: boolean;
  };
  youtube?: {
    channelId: string;
    subscribers: number;
    verified: boolean;
  };
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  brand: string;
  creators?: string[];
  budget: number;
  budgetCurrency: string;
  platforms: Platform[];
  category: CampaignCategory;
  requirements: string[];
  exampleContent: string[];
  minFollowers: number;
  maxFollowers?: number;
  deadline: Date;
  status: CampaignStatus;
  isSpecialInvitation: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin';

export type CampaignCategory = 
  | 'beauty' 
  | 'fashion' 
  | 'technology' 
  | 'food' 
  | 'sports' 
  | 'lifestyle' 
  | 'travel' 
  | 'gaming';

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

export interface Application {
  id: string;
  userId: string;
  campaignId: string;
  status: ApplicationStatus;
  personalMessage?: string;
  sampleContent?: string;
  priceOffer?: number;
  deliveryTime?: number;
  appliedAt: Date;
  updatedAt: Date;
  campaign?: Campaign;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Invitation {
  id: string;
  userId: string;
  campaignId: string;
  isSpecial: boolean;
  sentAt: Date;
  expiresAt: Date;
  campaign?: Campaign;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'new_campaign' 
  | 'application_accepted'
  | 'application_rejected'
  | 'new_invitation'
  | 'campaign_deadline'
  | 'payment_received'
  | 'system';

export interface FilterOptions {
  platforms?: Platform[];
  budgetRange?: {
    min: number;
    max: number;
  };
  categories?: CampaignCategory[];
  followerRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
  onlySuitable?: boolean;
}

export interface InfluencerTier {
  name: string;
  minFollowers: number;
  maxFollowers?: number;
  budgetRange: {
    min: number;
    max: number;
  };
  campaignTypes: string[];
}
