-- Rooklance Ambassador System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    commission_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage
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
    deadline_days INTEGER, -- days to complete
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

-- Update users table to add ambassador fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_ambassador BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ambassador_level INTEGER DEFAULT 1;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ambassador_programs_brand_id ON ambassador_programs(brand_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_tasks_program_id ON ambassador_tasks(program_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_user_id ON ambassador_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_program_id ON ambassador_applications(program_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_task_submissions_user_id ON ambassador_task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_task_submissions_task_id ON ambassador_task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_profiles_user_id ON ambassador_profiles(user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Insert sample ambassador levels
INSERT INTO ambassador_levels (level, name, description, min_tasks_completed, min_earnings, benefits, badge_icon) VALUES 
(1, 'Bronze Elçi', 'Yeni başlayan elçi seviyesi', 0, 0.00, ARRAY['Temel görevlere erişim', 'Marka brief''lerine erişim'], '🥉'),
(2, 'Silver Elçi', 'Deneyimli elçi seviyesi', 5, 1000.00, ARRAY['Özel görevlere erişim', 'Yüksek komisyon oranları'], '🥈'),
(3, 'Gold Elçi', 'Uzman elçi seviyesi', 15, 5000.00, ARRAY['VIP görevlere erişim', 'Öncelikli destek'], '🥇'),
(4, 'Platinum Elçi', 'Premium elçi seviyesi', 30, 15000.00, ARRAY['Exclusive görevlere erişim', 'Kişisel marka danışmanı'], '💎'),
(5, 'Diamond Elçi', 'Elite elçi seviyesi', 50, 30000.00, ARRAY['Tüm görevlere erişim', 'Özel etkinlikler', 'Marka ortaklıkları'], '👑')
ON CONFLICT (level) DO NOTHING;

-- Insert sample brands
INSERT INTO brands (id, name, description, logo_url, website_url, industry, brief_video_url, detailed_brief, requirements, benefits) VALUES 
('brand-1', 'L''Oréal Paris', 'Dünya''nın en büyük güzellik markalarından biri. Cilt bakımı, makyaj ve saç bakımı ürünleri ile kadınların güzelliğini ortaya çıkarıyor.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop', 'https://www.lorealparis.com.tr', 'beauty', 'https://example.com/loreal-brief.mp4', 'L''Oréal Paris olarak, güzellik tutkunu influencerlar ile çalışarak markamızın değerlerini ve ürünlerimizi hedef kitlemize ulaştırmayı hedefliyoruz. Elçilerimizden beklediğimiz: 1) Ürünlerimizi doğal ve samimi bir şekilde tanıtmaları 2) Kendi güzellik rutinlerinde markamızı entegre etmeleri 3) Takipçileriyle güzellik ipuçlarını paylaşmaları 4) Marka değerlerimizi yansıtan içerik üretmeleri', ARRAY['En az 10.000 takipçiye sahip olmak', 'Güzellik içerikleri üretmek', 'Profesyonel fotoğraf çekimleri yapabilmek'], ARRAY['Ücretsiz ürün gönderimi', 'Yüksek komisyon oranları', 'Marka etkinliklerine davet', 'Özel indirimler']),
('brand-2', 'Nike', 'Just Do It sloganı ile spor ve yaşam tarzı alanında lider marka. Spor ayakkabıları, giyim ve ekipmanları ile performans ve stil sunuyor.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop', 'https://www.nike.com', 'sports', 'https://example.com/nike-brief.mp4', 'Nike olarak, spor tutkunu ve aktif yaşam tarzını benimseyen influencerlar ile çalışarak "Just Do It" ruhunu yaymayı hedefliyoruz. Elçilerimizden beklediğimiz: 1) Spor aktivitelerinde Nike ürünlerini kullanmaları 2) Motivasyonel içerikler üretmeleri 3) Fitness ve sağlıklı yaşam ipuçları paylaşmaları 4) Spor etkinliklerinde markamızı temsil etmeleri', ARRAY['En az 15.000 takipçiye sahip olmak', 'Spor içerikleri üretmek', 'Aktif yaşam tarzına sahip olmak'], ARRAY['Yeni ürün öncelikli erişim', 'Spor etkinliklerine davet', 'Yüksek komisyon oranları', 'Özel koleksiyonlara erişim']),
('brand-3', 'Apple', 'Teknoloji dünyasının öncü markası. iPhone, iPad, Mac ve diğer yenilikçi ürünleri ile hayatı kolaylaştırıyor.', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop', 'https://www.apple.com', 'technology', 'https://example.com/apple-brief.mp4', 'Apple olarak, teknoloji tutkunu ve yaratıcı influencerlar ile çalışarak ürünlerimizin potansiyelini göstermeyi hedefliyoruz. Elçilerimizden beklediğimiz: 1) Apple ekosistemini etkili kullanmaları 2) Yaratıcı içerikler üretmeleri 3) Teknoloji trendlerini takip etmeleri 4) Ürün özelliklerini doğru şekilde tanıtmaları', ARRAY['En az 20.000 takipçiye sahip olmak', 'Teknoloji içerikleri üretmek', 'Apple ürünlerini kullanmak'], ARRAY['Yeni ürün öncelikli erişim', 'Apple Store etkinlikleri', 'Yüksek komisyon oranları', 'Teknik destek'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample ambassador programs
INSERT INTO ambassador_programs (id, brand_id, title, description, requirements, benefits, commission_rate) VALUES 
('program-1', 'brand-1', 'L''Oréal Paris Güzellik Elçisi', 'L''Oréal Paris markasının güzellik elçisi olarak görev yapacak influencerlar arıyoruz.', ARRAY['Güzellik içerikleri üretmek', 'Haftada en az 2 içerik paylaşmak', 'Marka değerlerini yansıtmak'], ARRAY['Ücretsiz ürün gönderimi', 'Yüksek komisyon oranları', 'Marka etkinliklerine davet'], 15.00),
('program-2', 'brand-2', 'Nike Spor Elçisi', 'Nike markasının spor elçisi olarak görev yapacak influencerlar arıyoruz.', ARRAY['Spor içerikleri üretmek', 'Aktif yaşam tarzını yansıtmak', 'Motivasyonel içerikler paylaşmak'], ARRAY['Yeni ürün öncelikli erişim', 'Spor etkinliklerine davet', 'Yüksek komisyon oranları'], 20.00),
('program-3', 'brand-3', 'Apple Teknoloji Elçisi', 'Apple markasının teknoloji elçisi olarak görev yapacak influencerlar arıyoruz.', ARRAY['Teknoloji içerikleri üretmek', 'Apple ekosistemini kullanmak', 'Yaratıcı içerikler üretmek'], ARRAY['Yeni ürün öncelikli erişim', 'Apple Store etkinlikleri', 'Yüksek komisyon oranları'], 25.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample ambassador tasks
INSERT INTO ambassador_tasks (id, program_id, title, description, task_type, requirements, deliverables, reward_amount, deadline_days, priority) VALUES 
('task-1', 'program-1', 'L''Oréal Ürün Tanıtımı', 'L''Oréal Paris''in yeni cilt bakım ürününü tanıtan bir video içerik oluşturun.', 'content_creation', ARRAY['En az 60 saniye video', 'Ürün özelliklerini vurgulama', 'Doğal ve samimi ton'], ARRAY['Instagram Reels video', 'YouTube Shorts video', 'TikTok video'], 500.00, 7, 'normal'),
('task-2', 'program-1', 'Güzellik Rutini Paylaşımı', 'Günlük güzellik rutininizde L''Oréal ürünlerini kullanarak bir paylaşım yapın.', 'social_media', ARRAY['En az 3 ürün kullanımı', 'Rutin açıklaması', 'Hashtag kullanımı'], ARRAY['Instagram post', 'Instagram story'], 300.00, 3, 'normal'),
('task-3', 'program-2', 'Nike Spor Ayakkabı Testi', 'Nike''ın yeni spor ayakkabısını test ederek bir değerlendirme videosu çekin.', 'product_review', ARRAY['En az 3 dakika video', 'Performans testi', 'Konfor değerlendirmesi'], ARRAY['YouTube video', 'Instagram Reels'], 800.00, 10, 'high'),
('task-4', 'program-2', 'Fitness Motivasyonu', 'Nike ürünleri ile fitness antrenmanınızı paylaşın ve takipçilerinizi motive edin.', 'content_creation', ARRAY['En az 2 dakika video', 'Motivasyonel mesaj', 'Nike ürün kullanımı'], ARRAY['Instagram Reels', 'TikTok video'], 400.00, 5, 'normal'),
('task-5', 'program-3', 'iPhone Özellik Tanıtımı', 'iPhone''un yeni özelliklerini tanıtan yaratıcı bir içerik oluşturun.', 'content_creation', ARRAY['En az 2 dakika video', 'Özellik açıklaması', 'Yaratıcı yaklaşım'], ARRAY['YouTube video', 'Instagram Reels'], 600.00, 7, 'normal'),
('task-6', 'program-3', 'MacBook Kullanım Rehberi', 'MacBook kullanımı ile ilgili faydalı ipuçları içeren bir rehber hazırlayın.', 'content_creation', ARRAY['En az 5 dakika video', 'Pratik ipuçları', 'Ekran kaydı'], ARRAY['YouTube video', 'Blog post'], 700.00, 14, 'normal')
ON CONFLICT (id) DO NOTHING;




