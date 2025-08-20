export interface Brand {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  industry: string;
  briefVideoUrl: string;
  detailedBrief: string;
  requirements: string[];
  benefits: string[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface AmbassadorLevel {
  id: string;
  level: number;
  name: string;
  description: string;
  minTasksCompleted: number;
  minEarnings: number;
  benefits: string[];
  badgeIcon: string;
  createdAt: Date;
}

export interface AmbassadorProgram {
  id: string;
  brandId: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  commissionRate: number; // percentage
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  brand?: Brand;
}

export interface AmbassadorTask {
  id: string;
  programId: string;
  title: string;
  description: string;
  taskType: 'content_creation' | 'social_media' | 'event_participation' | 'product_review' | 'referral';
  requirements: string[];
  deliverables: string[];
  rewardAmount: number;
  rewardCurrency: string;
  deadlineDays: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  program?: AmbassadorProgram;
  // New fields for submission tracking
  submissions?: TaskSubmission[];
  completionPercentage?: number;
}

export interface TaskSubmission {
  id: string;
  deliverableId: string;
  deliverableName: string;
  type: 'url' | 'screenshot' | 'file';
  content: string; // URL or file path
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

export interface AmbassadorApplication {
  id: string;
  userId: string;
  programId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  motivationText: string;
  experienceText: string;
  portfolioLinks: string[];
  appliedAt: Date;
  updatedAt: Date;
  program?: AmbassadorProgram;
}

export interface AmbassadorTaskSubmission {
  id: string;
  userId: string;
  taskId: string;
  status: 'submitted' | 'approved' | 'rejected' | 'revision_requested';
  submissionContent: string;
  submissionFiles: string[];
  submissionLinks: string[];
  feedback: string;
  rewardPaid: boolean;
  submittedAt: Date;
  updatedAt: Date;
  task?: AmbassadorTask;
}

export interface AmbassadorProfile {
  id: string;
  userId: string;
  levelId: string;
  currentLevel: number;
  totalTasksCompleted: number;
  totalEarnings: number;
  activePrograms: number;
  badges: string[];
  bio: string;
  specialties: string[];
  createdAt: Date;
  updatedAt: Date;
  level?: AmbassadorLevel;
}

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
  isAmbassador: boolean;
  ambassadorLevel: number;
  createdAt: Date;
  updatedAt: Date;
  ambassadorProfile?: AmbassadorProfile;
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

export interface TaskProgress {
  taskId: string;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  deadline: Date;
  completedAt?: Date;
}

export interface AmbassadorStats {
  totalTasks: number;
  completedTasks: number;
  totalEarnings: number;
  currentLevel: number;
  nextLevelProgress: number; // 0-100
  activePrograms: number;
  badges: string[];
}


