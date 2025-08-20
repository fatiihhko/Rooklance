# Supabase Kurulum ve Mock Veri Aktarım Rehberi

Bu rehber, Rooklance uygulamasının mock verilerini Supabase veritabanına aktarmanız için adım adım talimatları içerir.

## 📋 Ön Gereksinimler

1. **Supabase Hesabı**: [supabase.com](https://supabase.com) adresinden ücretsiz hesap oluşturun
2. **Yeni Proje**: Supabase'de yeni bir proje oluşturun
3. **Environment Variables**: Proje ayarlarından API anahtarlarını alın

## 🚀 Kurulum Adımları

### 1. Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje adını "rooklance" olarak belirleyin
4. Veritabanı şifresini not edin
5. Bölge olarak size en yakın bölgeyi seçin
6. "Create new project" butonuna tıklayın

### 2. Environment Variables Ayarlama

Proje oluşturulduktan sonra:

1. **Settings > API** bölümüne gidin
2. **Project URL** ve **anon public** API key'ini kopyalayın
3. Proje kök dizininde `.env` dosyası oluşturun:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Veritabanı Şemasını Oluşturma

Supabase SQL Editor'da aşağıdaki dosyaları sırasıyla çalıştırın:

#### 3.1 Ana Şema
```sql
-- supabase-complete-schema.sql dosyasının içeriğini kopyalayıp yapıştırın
```

#### 3.2 Ambassador Şeması
```sql
-- supabase-ambassador-schema.sql dosyasının içeriğini kopyalayıp yapıştırın
```

### 4. Mock Verileri Aktarma

#### Yöntem 1: Uygulama Üzerinden (Önerilen)

1. Uygulamayı başlatın:
```bash
npm start
```

2. Expo Go uygulamasında QR kodu tarayın veya simülatörde açın

3. Uygulamada `/seed-data` sayfasına gidin

4. "🚀 Mock Verileri Ekle" butonuna tıklayın

5. İşlem tamamlanana kadar bekleyin

#### Yöntem 2: Manuel SQL ile

Supabase SQL Editor'da aşağıdaki komutları çalıştırın:

```sql
-- Demo kullanıcı oluşturma
INSERT INTO users (id, email, first_name, last_name, profile_image, bio, follower_count, content_categories, is_ambassador, ambassador_level) VALUES 
('demo-user-123', 'ahmet.yilmaz@example.com', 'Ahmet', 'Yılmaz', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=faces', 'Moda ve yaşam tarzı içerik üreticisi. İstanbul merkezli. Markalarla işbirliği için DM atabilirsiniz.', 17000, ARRAY['Moda', 'Yaşam Tarzı', 'Seyahat'], true, 2)
ON CONFLICT (id) DO NOTHING;

-- Sosyal medya hesapları
INSERT INTO social_media_accounts (user_id, platform, username, followers, verified) VALUES 
('demo-user-123', 'instagram', '@ahmetyilmaz', 5000, false),
('demo-user-123', 'tiktok', '@ahmetyilmaz', 10000, false),
('demo-user-123', 'youtube', 'UC123456789', 2000, false)
ON CONFLICT (user_id, platform) DO NOTHING;
```

## 📊 Eklenecek Veriler

### Kampanyalar
- 🛰️ Quantum Orbit Labs – Bilim & Teknoloji Kampanyası
- 🍨 TooA Milano PRO – Lansman Kampanyası  
- 🌿 Qora – Bilim & Doğa Kampı Kampanyası
- #TeamWater Farkındalık Kampanyası
- Revolve @ Coachella
- L'Oréal x Urban Decay
- Daadi Snacks 'De-influencer' Kampanyası
- Samsung Olimpiyat Kampanyası
- Calvin Klein x Yaz Koleksiyonu

### Ambassador Sistemi
- **Markalar**: L'Oréal Paris, Nike, Apple, Qora Science Camp, TooA Milano PRO
- **Seviyeler**: Bronze, Silver, Gold, Platinum, Diamond
- **Programlar**: Her marka için özel elçi programları
- **Görevler**: Toplam 15 farklı görev (içerik üretimi, sosyal medya, ürün değerlendirmesi)

### Kullanıcı Verileri
- Demo kullanıcı profili
- Sosyal medya hesapları (Instagram, TikTok, YouTube)
- Başvurular ve davetler
- Bildirimler
- Cüzdan ve işlem geçmişi
- Promo kodları

## 🔍 Veri Kontrolü

Verilerin başarıyla eklendiğini kontrol etmek için:

1. Uygulamada "📊 Verileri Kontrol Et" butonuna tıklayın
2. Supabase Dashboard > Table Editor'da tabloları inceleyin
3. SQL Editor'da test sorguları çalıştırın:

```sql
-- Kampanya sayısını kontrol et
SELECT COUNT(*) FROM campaigns;

-- Ambassador markalarını kontrol et
SELECT name, industry FROM brands;

-- Kullanıcı verilerini kontrol et
SELECT first_name, last_name, email FROM users;
```

## 🛠️ Sorun Giderme

### Bağlantı Hatası
- Environment variables'ların doğru ayarlandığından emin olun
- Supabase projesinin aktif olduğunu kontrol edin
- API anahtarlarının doğru olduğunu doğrulayın

### Veri Ekleme Hatası
- Şema dosyalarının doğru sırayla çalıştırıldığından emin olun
- Tablo yapılarının doğru oluşturulduğunu kontrol edin
- RLS (Row Level Security) politikalarını kontrol edin

### Performans Sorunları
- Büyük veri setleri için batch insert kullanın
- Index'lerin oluşturulduğundan emin olun
- Supabase plan limitlerini kontrol edin

## 📱 Admin Panel Entegrasyonu

Mock veriler Supabase'e aktarıldıktan sonra:

1. **Admin panelinizde** Supabase bağlantısını kurun
2. **Aynı environment variables**'ları kullanın
3. **Supabase client**'ı yapılandırın
4. **Tablolara erişim** için gerekli izinleri ayarlayın

### Admin Panel için Örnek Kod

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Kampanyaları getir
const { data: campaigns } = await supabase
  .from('campaigns')
  .select('*')

// Ambassador verilerini getir
const { data: brands } = await supabase
  .from('brands')
  .select('*')
```

## 🔒 Güvenlik Notları

- **Production ortamında** RLS politikalarını gözden geçirin
- **API anahtarlarını** güvenli şekilde saklayın
- **Kullanıcı izinlerini** dikkatli yapılandırın
- **Backup** almayı unutmayın

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Supabase Dashboard'da hata mesajlarını inceleyin
3. Network sekmesinde API çağrılarını kontrol edin
4. Gerekirse verileri temizleyip yeniden ekleyin

---

**Not**: Bu rehber geliştirme ortamı için hazırlanmıştır. Production ortamında ek güvenlik önlemleri alınması gerekir.
