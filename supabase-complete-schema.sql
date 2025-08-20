-- Rooklance Complete App Database Schema

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
    delivery_time INTEGER, -- days
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

-- Create RLS policies
-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Social media accounts policies
CREATE POLICY "Users can view their own social media accounts" ON social_media_accounts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own social media accounts" ON social_media_accounts
    FOR ALL USING (user_id = auth.uid());

-- Campaigns policies (public read, admin write)
CREATE POLICY "Anyone can view active campaigns" ON campaigns
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view all campaigns" ON campaigns
    FOR SELECT USING (true);

-- Applications policies
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own applications" ON applications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE USING (user_id = auth.uid());

-- Invitations policies
CREATE POLICY "Users can view their own invitations" ON invitations
    FOR SELECT USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Wallets policies
CREATE POLICY "Users can view their own wallet" ON wallets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own wallet" ON wallets
    FOR ALL USING (user_id = auth.uid());

-- Promo codes policies
CREATE POLICY "Users can view their own promo codes" ON promo_codes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own promo codes" ON promo_codes
    FOR ALL USING (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" ON transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Insert sample data
-- Sample user (you'll need to create this user in Supabase Auth first)
INSERT INTO users (id, email, first_name, last_name, profile_image, bio, follower_count, content_categories) VALUES 
('demo-user-123', 'ahmet.yilmaz@example.com', 'Ahmet', 'Yılmaz', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=faces', 'Moda ve yaşam tarzı içerik üreticisi. İstanbul merkezli. Markalarla işbirliği için DM atabilirsiniz.', 17000, ARRAY['Moda', 'Yaşam Tarzı', 'Seyahat'])
ON CONFLICT (id) DO NOTHING;

-- Sample social media accounts
INSERT INTO social_media_accounts (user_id, platform, username, followers, verified) VALUES 
('demo-user-123', 'instagram', '@ahmetyilmaz', 5000, false),
('demo-user-123', 'tiktok', '@ahmetyilmaz', 10000, false),
('demo-user-123', 'youtube', 'UC123456789', 2000, false)
ON CONFLICT (user_id, platform) DO NOTHING;

-- Sample campaigns
INSERT INTO campaigns (id, title, description, brand, creators, budget, budget_currency, platforms, category, requirements, example_content, min_followers, deadline, status, is_special_invitation, image_url) VALUES 
('campaign-quantum', '🛰️✨ Quantum Orbit Labs – Bilim & Teknoloji Savunucuları Kampanyası', 'Quantum Orbit Labs, kuantum nokta sensörleri ve ileri görüntüleme malzemeleri ile teknolojinin sınırlarını zorluyor. Amacımız: Influencer''ların yaratacağı içeriklerle kuantum teknolojilerinin günlük yaşam ve endüstrideki önemini anlatmak ve marka bilinirliğini artırmak.', 'Quantum Orbit Labs', NULL, 35000, '₺', ARRAY['instagram', 'tiktok', 'youtube', 'linkedin'], 'technology', ARRAY['Min. 5K takipçi, teknoloji / mühendislik / bilim iletişimi yapan influencer', 'Instagram Reel / TikTok → "Kuantum teknolojileri geleceğimizi nasıl değiştiriyor?" temalı kısa video', 'YouTube (Opsiyonel) → Quantum Orbit Labs''in geliştirdiği sensörlerin kullanım alanlarını anlatan içerik', 'LinkedIn / Blog Post → "Quantum Orbit Labs ile geleceğin görüntüleme teknolojileri" başlıklı profesyonel paylaşım', '#FutureInSight hashtag''i ile tüm paylaşımların etkileşimini toplamak'], ARRAY['"Kuantum teknolojileri geleceğimizi nasıl değiştiriyor?" temalı kısa video', 'Quantum Orbit Labs''in geliştirdiği sensörlerin kullanım alanlarını (otomotiv, robotik, sağlık) anlatan içerik', '"Quantum Orbit Labs ile geleceğin görüntüleme teknolojileri" başlıklı profesyonel paylaşım', 'Kuantum teknolojilerinin günlük yaşam ve endüstrideki uygulamaları'], 5000, '2025-09-15', 'active', true, 'https://quantumorbitlabs.com/wp-content/uploads/2024/08/agrotech-agroalimentario-arquime.jpg'),
('campaign-tooa', '🍨✨ TooA Milano PRO – Lansman Kampanyası', 'TooA Milano PRO ile evde dakikalar içinde gerçek İtalyan dondurması yap! Kişiselleştirilebilir kıvam ayarları, uygulama bağımsız kullanım kolaylığı ve %100 Made in Italy kalitesiyle TooA artık Türkiye''de. 💡 Hedefimiz: Influencer''ların içerikleriyle "evde İtalyan dondurma keyfi" konseptini yaymak ve marka bilinirliğini artırmak.', 'TooA Milano PRO', NULL, 50000, '₺', ARRAY['instagram', 'tiktok', 'youtube'], 'food', ARRAY['Min. 10K takipçi, lifestyle / food / family içerik üreten influencer', 'Instagram Reel / TikTok → "Evde kendi İtalyan dondurmamı yaptım!" temalı kısa video', 'Instagram Post → TooA Milano PRO ile hazırlanan özel tatlı/kokteyl paylaşımı', 'Story Serisi → Cihazın kolay kullanımı ve farklı kıvam seçenekleri anlatımı', 'Blog / YouTube (Opsiyonel) → "Evde profesyonel dondurma deneyimi" incelemesi'], ARRAY['"Evde kendi İtalyan dondurmamı yaptım!" temalı kısa video', 'TooA Milano PRO ile hazırlanan özel tatlı/kokteyl paylaşımı', 'Cihazın kolay kullanımı ve farklı kıvam seçenekleri anlatımı', '"Evde profesyonel dondurma deneyimi" incelemesi'], 10000, '2025-09-10', 'active', true, 'https://cdn.shopify.com/s/files/1/0556/1244/0919/files/Italian_ice_cream_2.png?v=1751453419'),
('campaign-qora', '🌿✨ Qora – Bilim & Doğa Kampı Kampanyası', '🚀 Meraklı Çocuklar İçin Bilim ve Doğanın Buluştuğu Yer! Qora''da çocuklar bilim deneyleri 🔬, doğa keşifleri 🌲, robotik & teknoloji 🤖, yaratıcı sanat atölyeleri 🎨 ve ekoloji projeleri ♻️ ile dolu unutulmaz bir deneyim yaşıyor. 💡 Amacımız: Çocukların merak duygusunu tetiklemek, bilim & doğayla bağ kurmasını sağlamak ve yarının mucitlerini yetiştirmek.', 'Qora Science Camp', NULL, 20000, '₺', ARRAY['instagram', 'tiktok'], 'lifestyle', ARRAY['Min. 5K takipçi, aile/ebeveyn odaklı içerik üreten influencer', 'Instagram Post + Reel → Çocuğunuzla kamptaki bir etkinliği paylaşın', 'TikTok Video → "Bir Gün Qora Kampında" konseptiyle eğlenceli vlog', 'Blog / Story Serisi → "Qora''da Öğrendiklerimiz" başlığıyla deneyimi aktarın', '#QoraScienceCamp hashtag''iyle paylaşımlar → WOM etkisini artırmak'], ARRAY['Fizik Deneyi 🔭, Orman Yürüyüşü 🌳, Robotik Çalışma 🤖 etkinlikleri', '"Bir Gün Qora Kampında" konseptiyle eğlenceli vlog', '"Qora''da Öğrendiklerimiz" başlığıyla deneyim aktarımı', 'Kamp atmosferini yansıtan aile içerikleri'], 5000, '2025-09-05', 'active', true, 'https://framerusercontent.com/images/lQdRYkpuhhFIGjHmJs1dYqg2mk0.jpeg?scale-down-to=1024'),
('campaign-1', '#TeamWater Farkındalık Kampanyası', 'Su kıtlığı ve temiz su erişimi konusunda farkındalık yaratmayı amaçlayan global kampanya.', 'MrBeast & Mark Rober', ARRAY['MrBeast', 'Mark Rober'], 40000, '₺', ARRAY['youtube', 'instagram', 'tiktok'], 'lifestyle', ARRAY['En az 5.000 takipçiye sahip olmak', 'Su tasarrufu ve temiz su konularında içerik üretmeye istekli olmak'], ARRAY['Su tasarrufu için pratik ipuçları içeren video', 'Temiz su erişimi olmayan bölgeler hakkında bilgilendirici içerik'], 5000, '2025-12-15', 'active', true, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'),
('campaign-2', 'Revolve @ Coachella', 'Coachella festivalinde Revolve markasını temsil edecek influencerlar arıyoruz.', 'Revolve', NULL, 15000, '₺', ARRAY['instagram', 'tiktok'], 'fashion', ARRAY['En az 20.000 takipçiye sahip olmak', 'Moda ve yaşam tarzı içerik üretmek'], ARRAY['Festival outfit videoları', 'Revolve ürünlerinin günlük kullanımı'], 20000, '2025-03-20', 'active', false, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop'),
('campaign-3', 'L''Oréal x Urban Decay', 'Urban Decay koleksiyonunu tanıtacak güzellik influencerları arıyoruz.', 'L''Oréal', NULL, 8000, '₺', ARRAY['instagram', 'tiktok'], 'beauty', ARRAY['En az 10.000 takipçiye sahip olmak', 'Güzellik ve makyaj içerik üretmek'], ARRAY['Urban Decay ile yaratıcı makyaj tutorialları', 'Ürün değerlendirme videoları'], 10000, '2025-05-10', 'active', false, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop'),
('campaign-4', 'Daadi Snacks ''De-influencer'' Kampanyası', 'De-influencer trendini kullanarak atıştırmalık ürünlerimizi tanıtacak yaratıcı içerik üreticileri arıyoruz.', 'Daadi Snacks', NULL, 3000, '₺', ARRAY['tiktok', 'instagram'], 'food', ARRAY['En az 5.000 takipçiye sahip olmak', 'De-influencer tarzında içerik üretmek'], ARRAY['De-influencer tarzında ürün tanıtımları', 'Atıştırmalık karşılaştırma videoları'], 5000, '2025-06-30', 'active', false, 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop'),
('campaign-5', 'Samsung Olimpiyat Kampanyası', 'Paris 2024 Olimpiyatları için Samsung ürünlerini tanıtacak özel davetli influencerlar arıyoruz.', 'Samsung', NULL, 25000, '₺', ARRAY['instagram', 'youtube', 'tiktok'], 'technology', ARRAY['En az 50.000 takipçiye sahip olmak', 'Teknoloji içerik üretmek'], ARRAY['Samsung ürünleri ile Olimpiyat içerikleri', 'Teknoloji ve spor entegrasyonu'], 50000, '2024-07-01', 'active', true, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Sample applications
INSERT INTO applications (id, user_id, campaign_id, status, personal_message, applied_at) VALUES 
('app-1', 'demo-user-123', 'campaign-1', 'pending', 'Su tasarrufu konusunda çok duyarlıyım ve bu kampanyada yer almak istiyorum.', '2025-05-15'),
('app-2', 'demo-user-123', 'campaign-2', 'accepted', 'Festival atmosferini çok seviyorum ve Revolve ile çalışmak harika olur.', '2025-03-05'),
('app-3', 'demo-user-123', 'campaign-3', 'rejected', 'Güzellik içerikleri üretiyorum ve Urban Decay ile çalışmak istiyorum.', '2025-02-20'),
('app-4', 'demo-user-123', 'campaign-4', 'completed', 'De-influencer tarzında içerikler üretiyorum ve bu kampanya çok ilgimi çekti.', '2025-01-10')
ON CONFLICT (id) DO NOTHING;

-- Sample invitations
INSERT INTO invitations (id, user_id, campaign_id, is_special, sent_at, expires_at) VALUES 
('inv-quantum', 'demo-user-123', 'campaign-quantum', true, '2025-01-27', '2025-02-15'),
('inv-tooa', 'demo-user-123', 'campaign-tooa', true, '2025-01-26', '2025-02-10'),
('inv-qora', 'demo-user-123', 'campaign-qora', true, '2025-01-25', '2025-02-10'),
('inv-1', 'demo-user-123', 'campaign-1', true, '2025-01-05', '2025-01-20'),
('inv-2', 'demo-user-123', 'campaign-5', true, '2024-12-15', '2024-12-30')
ON CONFLICT (id) DO NOTHING;

-- Sample notifications
INSERT INTO notifications (id, user_id, type, title, message, data, is_read) VALUES 
('notif-quantum', 'demo-user-123', 'new_invitation', '🛰️✨ Quantum Orbit Labs - Bilim & Teknoloji Daveti!', 'Kuantum teknolojilerinin geleceğini keşfedin! Innovation Kit hediye + 35.000₺ bütçe!', '{"campaignId": "campaign-quantum", "invitationId": "inv-quantum"}', false),
('notif-tooa', 'demo-user-123', 'new_invitation', '🍨✨ TooA Milano PRO - Özel Lansman Daveti!', 'Evde İtalyan dondurması yapma keyfi! TooA Milano PRO cihazı hediye + 50.000₺ bütçe!', '{"campaignId": "campaign-tooa", "invitationId": "inv-tooa"}', false),
('notif-qora', 'demo-user-123', 'new_invitation', '🌿✨ Qora Bilim & Doğa Kampı - Özel Davet!', 'Ailelere özel Qora Science Camp kampanyası için özel davet aldınız! Çocuğunuzla birlikte ücretsiz kampa katılma şansı!', '{"campaignId": "campaign-qora", "invitationId": "inv-qora"}', false),
('notif-1', 'demo-user-123', 'application_accepted', 'Başvurunuz Kabul Edildi!', 'Revolve @ Coachella kampanyası için başvurunuz kabul edildi.', '{"campaignId": "campaign-2", "applicationId": "app-2"}', false),
('notif-2', 'demo-user-123', 'new_invitation', 'Yeni Özel Davet', 'Samsung Olimpiyat Kampanyası için özel davet aldınız.', '{"campaignId": "campaign-5", "invitationId": "inv-2"}', false),
('notif-3', 'demo-user-123', 'payment_received', 'Ödeme Alındı', 'Daadi Snacks kampanyası için 3.000 ₺ ödemeniz hesabınıza yatırıldı.', '{"campaignId": "campaign-4", "amount": 3000, "currency": "₺"}', true)
ON CONFLICT (id) DO NOTHING;

-- Sample wallet
INSERT INTO wallets (user_id, balance, total_earnings) VALUES 
('demo-user-123', 1250.75, 8500.00)
ON CONFLICT (user_id) DO NOTHING;

-- Sample promo codes
INSERT INTO promo_codes (user_id, code, discount, description, valid_until, is_used, color_start, color_end) VALUES 
('demo-user-123', 'ROOKLANCE20', '20₺', 'Tüm ürünlerde %20 indirim', '2024-12-31', false, '#6366f1', '#8b5cf6'),
('demo-user-123', 'NEWUSER30', '30₺', 'Yeni kullanıcılar için', '2024-11-20', false, '#ec4899', '#f43f5e'),
('demo-user-123', 'FLASH25', '25₺', 'Flash satışlarda %25 indirim', '2024-11-15', false, '#10b981', '#6366f1'),
('demo-user-123', 'VIP100', '100₺', 'VIP üyeler için özel indirim', '2024-10-30', true, '#f59e0b', '#ef4444'),
('demo-user-123', 'WELCOME50', '50₺', 'İlk siparişinizde %50 indirim', '2024-12-31', false, '#06b6d4', '#6366f1')
ON CONFLICT DO NOTHING;

-- Sample transactions
INSERT INTO transactions (user_id, amount, type, description, status, campaign_id, application_id) VALUES 
('demo-user-123', 500.00, 'earning', 'Referans kazancı', 'completed', NULL, NULL),
('demo-user-123', -200.00, 'withdrawal', 'Para çekme işlemi', 'completed', NULL, NULL),
('demo-user-123', 150.75, 'earning', 'Komisyon kazancı', 'completed', NULL, NULL),
('demo-user-123', 3000.00, 'campaign_payment', 'Daadi Snacks kampanya ödemesi', 'completed', 'campaign-4', 'app-4')
ON CONFLICT DO NOTHING;
