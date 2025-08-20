# Rooklance - Influencer Marka Eşleştirme Platformu

Rooklance, influencerlar ve markaları buluşturan modern ve vizyoner bir mobil uygulamadır. Koyu mor-siyah renk teması ile tasarlanmış, kullanıcı dostu arayüzü ile influencerların kampanyaları keşfetmesini ve markalarla eşleşmesini sağlar.

## 🚀 Özellikler

### 📱 Ana Özellikler
- **Kampanya Keşfi**: Filtreleme ve arama özellikleri ile kampanyaları keşfedin
- **Başvuru Yönetimi**: Kampanya başvurularınızı takip edin
- **Özel Davetler**: Size özel kampanya davetlerini görün
- **Profil Yönetimi**: Sosyal medya hesaplarınızı ve profil bilgilerinizi yönetin

### 🎨 Tasarım Özellikleri
- **Modern UI/UX**: Koyu mor-siyah renk teması
- **Responsive Tasarım**: Tüm ekran boyutlarına uyumlu
- **Animasyonlar**: Hover efektleri ve geçiş animasyonları
- **Türkçe Dil Desteği**: Tamamen Türkçe arayüz

### 🔧 Teknik Özellikler
- **React Native + TypeScript**: Modern geliştirme teknolojileri
- **Expo Router**: Dosya tabanlı navigasyon
- **React Native Paper**: Material Design bileşenleri
- **Supabase**: Backend ve veritabanı entegrasyonu

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Expo CLI
- iOS Simulator veya Android Emulator (opsiyonel)

## 🛠️ Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd Rooklance
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Supabase Kurulumu:**
   - [Supabase](https://supabase.com) hesabı oluşturun
   - Yeni bir proje oluşturun
   - `supabase-schema.sql` dosyasını Supabase SQL Editor'da çalıştırın
   - Proje ayarlarından URL ve Anon Key'i alın

4. **Environment Değişkenleri:**
   - `.env` dosyası oluşturun:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Uygulamayı başlatın:**
```bash
npm start
```

6. **Geliştirme seçenekleri:**
- iOS Simulator: `npm run ios`
- Android Emulator: `npm run android`
- Web: `npm run web`

## 📱 Ekranlar

### 🔐 Kimlik Doğrulama
- **Hoş Geldin Ekranı**: Gradient arka plan ile karşılama
- **Kayıt Olma**: Kişisel bilgiler ve sosyal medya hesapları
- **Giriş Yapma**: E-posta ve şifre ile giriş

### 🏠 Ana Ekranlar
- **Kampanyalar**: Filtreleme ve arama ile kampanya listesi
- **Başvurularım**: Başvuru durumlarını takip etme
- **Davetler**: Özel kampanya davetleri
- **Profil**: Kullanıcı profili ve ayarlar

### 📄 Detay Sayfaları
- **Kampanya Detayı**: Detaylı kampanya bilgileri ve başvuru
- **Başvuru Formu**: Kişisel mesaj ile başvuru gönderme

## 🎯 Kampanya Örnekleri

Uygulama şu kampanya türlerini destekler:

| Kampanya | Bütçe | Platform | Kategori |
|----------|-------|----------|----------|
| #TeamWater Farkındalık | 40K ₺ | YouTube, Instagram, TikTok | Yaşam Tarzı |
| Revolve @ Coachella | 15K ₺ | Instagram, TikTok | Moda |
| L'Oréal x Urban Decay | 8K ₺ | Instagram, TikTok | Güzellik |
| Daadi Snacks | 3K ₺ | TikTok, Instagram | Yemek |
| Samsung Olimpiyat | 25K ₺ | Instagram, YouTube, TikTok | Teknoloji |

## 🏗️ Proje Yapısı

```
Rooklance/
├── app/                    # Expo Router sayfaları
│   ├── (auth)/            # Kimlik doğrulama sayfaları
│   ├── (tabs)/            # Ana tab sayfaları
│   └── campaign/          # Kampanya detay sayfaları
├── components/            # Yeniden kullanılabilir bileşenler
├── constants/             # Sabitler ve tema
├── types/                 # TypeScript tip tanımları
├── utils/                 # Yardımcı fonksiyonlar
└── assets/               # Resimler ve ikonlar
```

## 🎨 Tema ve Renkler

```typescript
// Ana renkler
primary: '#6B46C1'        // Koyu mor
background: '#0F0F23'     // Koyu siyah-mor
surface: '#1A1A2E'        // Yüzey rengi
text: '#FFFFFF'           // Beyaz metin
```

## 🔮 Gelecek Özellikler

- [x] Supabase entegrasyonu
- [ ] Gerçek zamanlı bildirimler
- [ ] Sosyal medya API entegrasyonu
- [ ] Takipçi sayısı otomatik çekme
- [ ] Gelişmiş filtreleme
- [ ] Push bildirimleri
- [ ] Offline desteği
- [ ] Çoklu dil desteği

## 🗄️ Supabase Entegrasyonu

### Veritabanı Şeması
Uygulama aşağıdaki tabloları kullanır:

- **users**: Kullanıcı profilleri ve temel bilgiler
- **social_media_accounts**: Sosyal medya hesapları ve takipçi sayıları
- **campaigns**: Kampanya bilgileri ve detayları
- **applications**: Kampanya başvuruları
- **invitations**: Özel kampanya davetleri
- **notifications**: Kullanıcı bildirimleri
- **wallets**: Kullanıcı cüzdan bilgileri (bakiye, toplam kazanç)
- **promo_codes**: Promosyon kodları ve kullanım durumları
- **transactions**: Para çekme, kazanç ve kampanya ödemeleri

### API Servisleri
- **userService**: Kullanıcı profili ve sosyal medya yönetimi
- **campaignService**: Kampanya listeleme ve filtreleme
- **applicationService**: Başvuru yönetimi
- **invitationService**: Davet yönetimi
- **notificationService**: Bildirim yönetimi
- **walletService**: Cüzdan işlemleri (bakiye görüntüleme, para çekme)
- **promoCodeService**: Promosyon kod yönetimi
- **transactionService**: İşlem geçmişi ve kampanya ödemeleri

### Özellikler
- **Gerçek Zamanlı Veri**: Supabase realtime ile anlık güncellemeler
- **Filtreleme**: Kampanya arama ve filtreleme
- **Bildirimler**: Otomatik bildirim sistemi
- **Ödemeler**: Kampanya ödemeleri otomatik cüzdana yansıma
- **Güvenlik**: Row Level Security (RLS) ile kullanıcı bazlı erişim
- **Performans**: Optimize edilmiş indeksler ve sorgular

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje Sahibi**: Rook Tech
- **E-posta**: info@rooktech.ai
- **Website**: https://rooktech.ai

---

**Rooklance** - Influencerlar ve markaları buluşturan platform 🚀
