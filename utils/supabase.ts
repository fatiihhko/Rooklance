import { createClient } from '@supabase/supabase-js';

// Supabase konfigürasyonu
const supabaseUrl = 'https://mjsyncolifymfgswymip.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qc3luY29saWZ5bWZnc3d5bWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzQwODEsImV4cCI6MjA3MDg1MDA4MX0.njcUGvzGTEiT1YYsLyq266dirML4BsirJKzRQ3P1kdE';

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Test bağlantısı
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    // Users tablosunu kontrol et
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection test successful - users table exists');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Veritabanı bağlantısını test et
export const checkAndCreateMissingTables = async () => {
  try {
    console.log('Veritabanı bağlantısı test ediliyor...');
    
    // Wallets tablosunu kontrol et
    const { error: walletsError } = await supabase.from('wallets').select('count').limit(1);
    if (walletsError) {
      console.error('Wallets tablosu bulunamadı:', walletsError.message);
      console.log('Lütfen Supabase Dashboard\'da SQL Editor\'ü kullanarak tabloları oluşturun.');
    } else {
      console.log('Wallets tablosu mevcut');
    }
    
    // Promo codes tablosunu kontrol et
    const { error: promoCodesError } = await supabase.from('promo_codes').select('count').limit(1);
    if (promoCodesError) {
      console.error('Promo codes tablosu bulunamadı:', promoCodesError.message);
    } else {
      console.log('Promo codes tablosu mevcut');
    }
    
    // Transactions tablosunu kontrol et
    const { error: transactionsError } = await supabase.from('transactions').select('count').limit(1);
    if (transactionsError) {
      console.error('Transactions tablosu bulunamadı:', transactionsError.message);
    } else {
      console.log('Transactions tablosu mevcut');
    }
    
    return true;
  } catch (error) {
    console.error('Veritabanı kontrol hatası:', error);
    return false;
  }
};

// Tip tanımlamaları
export interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  user_id: string;
  code: string;
  discount: string;
  description: string;
  valid_until: string;
  is_used: boolean;
  color_start: string;
  color_end: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'earning' | 'campaign_payment';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  campaign_id?: string;
  application_id?: string;
  created_at: string;
}

// Wallet işlemleri
export const walletService = {
  // Kullanıcının cüzdan bilgilerini getir
  async getWalletData(userId: string): Promise<WalletData | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Cüzdan bilgileri alınamadı:', error);
      return null;
    }
  },

  // Cüzdan oluştur veya güncelle
  async upsertWallet(userId: string, balance: number, totalEarnings: number): Promise<WalletData | null> {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .upsert({
          user_id: userId,
          balance,
          total_earnings: totalEarnings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Cüzdan güncellenemedi:', error);
      return null;
    }
  },

  // Para çekme işlemi
  async withdrawMoney(userId: string, amount: number): Promise<boolean> {
    try {
      // Önce mevcut bakiyeyi kontrol et
      const wallet = await this.getWalletData(userId);
      if (!wallet || wallet.balance < amount) {
        throw new Error('Yetersiz bakiye');
      }

      // Bakiyeyi güncelle
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: wallet.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (walletError) throw walletError;

      // İşlem kaydı oluştur
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: -amount,
          type: 'withdrawal',
          description: 'Para çekme işlemi',
          status: 'pending'
        });

      if (transactionError) throw transactionError;

      return true;
    } catch (error) {
      console.error('Para çekme işlemi başarısız:', error);
      return false;
    }
  }
};

// Promo kod işlemleri
export const promoCodeService = {
  // Kullanıcının promo kodlarını getir
  async getPromoCodes(userId: string): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Promo kodlar alınamadı:', error);
      return [];
    }
  },

  // Promo kod kullan
  async usePromoCode(userId: string, codeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({
          is_used: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', codeId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Promo kod kullanılamadı:', error);
      return false;
    }
  },

  // Yeni promo kod ekle
  async addPromoCode(promoCode: Omit<PromoCode, 'id' | 'created_at'>): Promise<PromoCode | null> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert(promoCode)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Promo kod eklenemedi:', error);
      return null;
    }
  }
};

// İşlem geçmişi
export const transactionService = {
  // Kullanıcının işlem geçmişini getir
  async getTransactions(userId: string, limit = 20): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('İşlem geçmişi alınamadı:', error);
      return [];
    }
  },

  // Yeni işlem ekle
  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: transaction.user_id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          status: transaction.status,
          campaign_id: transaction.campaign_id,
          application_id: transaction.application_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('İşlem eklenemedi:', error);
      return null;
    }
  },

  // Kampanya ödemesi ekle
  async addCampaignPayment(userId: string, amount: number, campaignId: string, applicationId: string): Promise<boolean> {
    try {
      // Önce cüzdanı güncelle
      const wallet = await walletService.getWalletData(userId);
      if (!wallet) {
        throw new Error('Cüzdan bulunamadı');
      }

      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: wallet.balance + amount,
          total_earnings: wallet.total_earnings + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (walletError) throw walletError;

      // İşlem kaydı oluştur
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'campaign_payment',
          description: 'Kampanya ödemesi',
          status: 'completed',
          campaign_id: campaignId,
          application_id: applicationId
        });

      if (transactionError) throw transactionError;

      return true;
    } catch (error) {
      console.error('Kampanya ödemesi eklenemedi:', error);
      return false;
    }
  }
};
