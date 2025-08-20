import { supabase } from './supabase';

// SQL şemalarını çalıştırmak için fonksiyon
export const setupDatabaseSchema = async () => {
  console.log('🔧 Supabase veritabanı şeması kuruluyor...');
  
  try {
    // Ana şema SQL'i
    const mainSchemaSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create users table (extends Supabase auth.users)
      CREATE TABLE IF NOT EXISTS users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          profile_image TEXT,
          bio TEXT,
          follower_count INTEGER DEFAULT 0,
          content_categories TEXT[] DEFAULT '{}',
          is_ambassador BOOLEAN DEFAULT FALSE,
          ambassador_level INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create social media accounts table
      CREATE TABLE IF NOT EXISTS social_media_accounts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),
          username TEXT NOT NULL,
          followers INTEGER DEFAULT 0,
          verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, platform)
      );

      -- Create campaigns table
      CREATE TABLE IF NOT EXISTS campaigns (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          brand TEXT NOT NULL,
          creators TEXT[],
          budget DECIMAL(10,2) NOT NULL,
          budget_currency TEXT DEFAULT '₺',
          platforms TEXT[] NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('beauty', 'fashion', 'technology', 'food', 'sports', 'lifestyle', 'travel', 'gaming')),
          requirements TEXT[] NOT NULL,
          example_content TEXT[] NOT NULL,
          min_followers INTEGER NOT NULL,
          max_followers INTEGER,
          deadline DATE NOT NULL,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'draft')),
          is_special_invitation BOOLEAN DEFAULT FALSE,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create applications table
      CREATE TABLE IF NOT EXISTS applications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
          personal_message TEXT,
          sample_content TEXT,
          price_offer DECIMAL(10,2),
          delivery_time INTEGER,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, campaign_id)
      );

      -- Create invitations table
      CREATE TABLE IF NOT EXISTS invitations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
          is_special BOOLEAN DEFAULT FALSE,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          UNIQUE(user_id, campaign_id)
      );

      -- Create notifications table
      CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('new_campaign', 'application_accepted', 'application_rejected', 'new_invitation', 'campaign_deadline', 'payment_received', 'system')),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create wallets table
      CREATE TABLE IF NOT EXISTS wallets (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
          balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
          total_earnings DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create promo codes table
      CREATE TABLE IF NOT EXISTS promo_codes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          code TEXT NOT NULL,
          discount TEXT NOT NULL,
          description TEXT NOT NULL,
          valid_until DATE NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          color_start TEXT NOT NULL,
          color_end TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create transactions table
      CREATE TABLE IF NOT EXISTS transactions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          type TEXT CHECK (type IN ('deposit', 'withdrawal', 'earning', 'campaign_payment')) NOT NULL,
          description TEXT NOT NULL,
          status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
          campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
          application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Ambassador şema SQL'i
    const ambassadorSchemaSQL = `
      -- Create brands table
      CREATE TABLE IF NOT EXISTS brands (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          logo_url TEXT,
          website_url TEXT,
          industry TEXT,
          brief_video_url TEXT,
          detailed_brief TEXT,
          requirements TEXT[],
          benefits TEXT[],
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ambassador levels table
      CREATE TABLE IF NOT EXISTS ambassador_levels (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
          name TEXT NOT NULL,
          description TEXT,
          min_tasks_completed INTEGER DEFAULT 0,
          min_earnings DECIMAL(10,2) DEFAULT 0.00,
          benefits TEXT[],
          badge_icon TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ambassador programs table
      CREATE TABLE IF NOT EXISTS ambassador_programs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          requirements TEXT[],
          benefits TEXT[],
          commission_rate DECIMAL(5,2) DEFAULT 0.00,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ambassador tasks table
      CREATE TABLE IF NOT EXISTS ambassador_tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          program_id UUID REFERENCES ambassador_programs(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          task_type TEXT NOT NULL CHECK (task_type IN ('content_creation', 'social_media', 'event_participation', 'product_review', 'referral')),
          requirements TEXT[],
          deliverables TEXT[],
          reward_amount DECIMAL(10,2) NOT NULL,
          reward_currency TEXT DEFAULT '₺',
          deadline_days INTEGER,
          priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ambassador applications table
      CREATE TABLE IF NOT EXISTS ambassador_applications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          program_id UUID REFERENCES ambassador_programs(id) ON DELETE CASCADE NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
          motivation_text TEXT,
          experience_text TEXT,
          portfolio_links TEXT[],
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, program_id)
      );

      -- Create ambassador task submissions table
      CREATE TABLE IF NOT EXISTS ambassador_task_submissions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          task_id UUID REFERENCES ambassador_tasks(id) ON DELETE CASCADE NOT NULL,
          status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'revision_requested')),
          submission_content TEXT,
          submission_files TEXT[],
          submission_links TEXT[],
          feedback TEXT,
          reward_paid BOOLEAN DEFAULT FALSE,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ambassador profiles table
      CREATE TABLE IF NOT EXISTS ambassador_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
          level_id UUID REFERENCES ambassador_levels(id),
          current_level INTEGER DEFAULT 1,
          total_tasks_completed INTEGER DEFAULT 0,
          total_earnings DECIMAL(10,2) DEFAULT 0.00,
          active_programs INTEGER DEFAULT 0,
          badges TEXT[],
          bio TEXT,
          specialties TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Index'leri oluştur
    const indexesSQL = `
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_social_media_user_id ON social_media_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_social_media_platform ON social_media_accounts(platform);
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
      CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline);
      CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
      CREATE INDEX IF NOT EXISTS idx_invitations_campaign_id ON invitations(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
      CREATE INDEX IF NOT EXISTS idx_promo_codes_user_id ON promo_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
      
      -- Ambassador indexes
      CREATE INDEX IF NOT EXISTS idx_ambassador_programs_brand_id ON ambassador_programs(brand_id);
      CREATE INDEX IF NOT EXISTS idx_ambassador_tasks_program_id ON ambassador_tasks(program_id);
      CREATE INDEX IF NOT EXISTS idx_ambassador_applications_user_id ON ambassador_applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_ambassador_applications_program_id ON ambassador_applications(program_id);
      CREATE INDEX IF NOT EXISTS idx_ambassador_task_submissions_user_id ON ambassador_task_submissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_ambassador_task_submissions_task_id ON ambassador_task_submissions(task_id);
      CREATE INDEX IF NOT EXISTS idx_ambassador_profiles_user_id ON ambassador_profiles(user_id);
    `;

    // Trigger fonksiyonunu oluştur
    const triggerFunctionSQL = `
      -- Create functions for automatic timestamp updates
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Trigger'ları oluştur
    const triggersSQL = `
      -- Create triggers for automatic timestamp updates
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_social_media_updated_at BEFORE UPDATE ON social_media_accounts
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_ambassador_programs_updated_at BEFORE UPDATE ON ambassador_programs
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_ambassador_tasks_updated_at BEFORE UPDATE ON ambassador_tasks
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_ambassador_applications_updated_at BEFORE UPDATE ON ambassador_applications
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_ambassador_task_submissions_updated_at BEFORE UPDATE ON ambassador_task_submissions
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_ambassador_profiles_updated_at BEFORE UPDATE ON ambassador_profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    // RLS (Row Level Security) politikalarını oluştur
    const rlsPoliciesSQL = `
      -- Enable Row Level Security
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
      ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ambassador_levels ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ambassador_programs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ambassador_tasks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ambassador_task_submissions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ambassador_profiles ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      -- Users policies
      DROP POLICY IF EXISTS "Users can view their own profile" ON users;
      CREATE POLICY "Users can view their own profile" ON users
          FOR SELECT USING (id = auth.uid());

      DROP POLICY IF EXISTS "Users can update their own profile" ON users;
      CREATE POLICY "Users can update their own profile" ON users
          FOR UPDATE USING (id = auth.uid());

      DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
      CREATE POLICY "Users can insert their own profile" ON users
          FOR INSERT WITH CHECK (id = auth.uid());

      -- Social media accounts policies
      DROP POLICY IF EXISTS "Users can view their own social media accounts" ON social_media_accounts;
      CREATE POLICY "Users can view their own social media accounts" ON social_media_accounts
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can manage their own social media accounts" ON social_media_accounts;
      CREATE POLICY "Users can manage their own social media accounts" ON social_media_accounts
          FOR ALL USING (user_id = auth.uid());

      -- Campaigns policies (public read, admin write)
      DROP POLICY IF EXISTS "Anyone can view active campaigns" ON campaigns;
      CREATE POLICY "Anyone can view active campaigns" ON campaigns
          FOR SELECT USING (status = 'active');

      DROP POLICY IF EXISTS "Users can view all campaigns" ON campaigns;
      CREATE POLICY "Users can view all campaigns" ON campaigns
          FOR SELECT USING (true);

      -- Applications policies
      DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
      CREATE POLICY "Users can view their own applications" ON applications
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can create their own applications" ON applications;
      CREATE POLICY "Users can create their own applications" ON applications
          FOR INSERT WITH CHECK (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
      CREATE POLICY "Users can update their own applications" ON applications
          FOR UPDATE USING (user_id = auth.uid());

      -- Invitations policies
      DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;
      CREATE POLICY "Users can view their own invitations" ON invitations
          FOR SELECT USING (user_id = auth.uid());

      -- Notifications policies
      DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
      CREATE POLICY "Users can view their own notifications" ON notifications
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
      CREATE POLICY "Users can update their own notifications" ON notifications
          FOR UPDATE USING (user_id = auth.uid());

      -- Wallets policies
      DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
      CREATE POLICY "Users can view their own wallet" ON wallets
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can manage their own wallet" ON wallets;
      CREATE POLICY "Users can manage their own wallet" ON wallets
          FOR ALL USING (user_id = auth.uid());

      -- Promo codes policies
      DROP POLICY IF EXISTS "Users can view their own promo codes" ON promo_codes;
      CREATE POLICY "Users can view their own promo codes" ON promo_codes
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can manage their own promo codes" ON promo_codes;
      CREATE POLICY "Users can manage their own promo codes" ON promo_codes
          FOR ALL USING (user_id = auth.uid());

      -- Transactions policies
      DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
      CREATE POLICY "Users can view their own transactions" ON transactions
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
      CREATE POLICY "Users can create their own transactions" ON transactions
          FOR INSERT WITH CHECK (user_id = auth.uid());

      -- Ambassador policies
      DROP POLICY IF EXISTS "Users can view ambassador data" ON brands;
      CREATE POLICY "Users can view ambassador data" ON brands
          FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can view ambassador levels" ON ambassador_levels;
      CREATE POLICY "Users can view ambassador levels" ON ambassador_levels
          FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can view ambassador programs" ON ambassador_programs;
      CREATE POLICY "Users can view ambassador programs" ON ambassador_programs
          FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can view ambassador tasks" ON ambassador_tasks;
      CREATE POLICY "Users can view ambassador tasks" ON ambassador_tasks
          FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can view their own ambassador applications" ON ambassador_applications;
      CREATE POLICY "Users can view their own ambassador applications" ON ambassador_applications
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can manage their own ambassador applications" ON ambassador_applications;
      CREATE POLICY "Users can manage their own ambassador applications" ON ambassador_applications
          FOR ALL USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can view their own ambassador task submissions" ON ambassador_task_submissions;
      CREATE POLICY "Users can view their own ambassador task submissions" ON ambassador_task_submissions
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can manage their own ambassador task submissions" ON ambassador_task_submissions;
      CREATE POLICY "Users can manage their own ambassador task submissions" ON ambassador_task_submissions
          FOR ALL USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can view their own ambassador profile" ON ambassador_profiles;
      CREATE POLICY "Users can view their own ambassador profile" ON ambassador_profiles
          FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can manage their own ambassador profile" ON ambassador_profiles;
      CREATE POLICY "Users can manage their own ambassador profile" ON ambassador_profiles
          FOR ALL USING (user_id = auth.uid());
    `;

    // SQL'leri sırayla çalıştır
    console.log('📋 Ana şema oluşturuluyor...');
    await executeSQL(mainSchemaSQL);
    
    console.log('👑 Ambassador şeması oluşturuluyor...');
    await executeSQL(ambassadorSchemaSQL);
    
    console.log('🔍 Index\'ler oluşturuluyor...');
    await executeSQL(indexesSQL);
    
    console.log('⚡ Trigger fonksiyonu oluşturuluyor...');
    await executeSQL(triggerFunctionSQL);
    
    console.log('🔄 Trigger\'lar oluşturuluyor...');
    await executeSQL(triggersSQL);
    
    console.log('🔒 RLS politikaları oluşturuluyor...');
    await executeSQL(rlsPoliciesSQL);

    console.log('✅ Veritabanı şeması başarıyla kuruldu!');
    return true;
  } catch (error) {
    console.error('❌ Şema kurulum hatası:', error);
    return false;
  }
};

// SQL çalıştırma fonksiyonu
const executeSQL = async (sql: string) => {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      // Eğer exec_sql fonksiyonu yoksa, doğrudan SQL çalıştırmayı dene
      console.log('exec_sql fonksiyonu bulunamadı, alternatif yöntem deneniyor...');
      // Bu durumda manuel olarak SQL'i çalıştırmak için Supabase Dashboard'ı kullanmanız gerekebilir
      throw new Error('SQL çalıştırma için Supabase Dashboard kullanın');
    }
  } catch (error) {
    console.error('SQL çalıştırma hatası:', error);
    throw error;
  }
};

// Şema durumunu kontrol et
export const checkSchemaStatus = async () => {
  console.log('🔍 Veritabanı şema durumu kontrol ediliyor...');
  
  try {
    const tables = [
      'users',
      'social_media_accounts',
      'campaigns',
      'applications',
      'invitations',
      'notifications',
      'wallets',
      'promo_codes',
      'transactions',
      'brands',
      'ambassador_levels',
      'ambassador_programs',
      'ambassador_tasks',
      'ambassador_applications',
      'ambassador_task_submissions',
      'ambassador_profiles'
    ];

    const missingTables = [];

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          missingTables.push(table);
        }
      } catch (error) {
        missingTables.push(table);
      }
    }

    if (missingTables.length === 0) {
      console.log('✅ Tüm tablolar mevcut!');
      return { status: 'complete', missingTables: [] };
    } else {
      console.log('⚠️ Eksik tablolar:', missingTables);
      return { status: 'incomplete', missingTables };
    }
  } catch (error) {
    console.error('❌ Şema durumu kontrol hatası:', error);
    return { status: 'error', missingTables: [] };
  }
};
