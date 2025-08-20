import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { seedAllData, testDatabaseConnection } from '../utils/supabase-seed-data';
import { checkSupabaseData } from '../utils/supabase-test';

export default function SeedDataScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleSeedData = async () => {
    setLoading(true);
    setStatus('Veriler ekleniyor...');
    
    try {
      const success = await seedAllData();
      if (success) {
        setStatus('✅ Tüm veriler başarıyla eklendi!');
        Alert.alert('Başarılı', 'Mock veriler Supabase\'e aktarıldı!');
      } else {
        setStatus('❌ Veri ekleme hatası!');
        Alert.alert('Hata', 'Veriler eklenirken bir hata oluştu!');
      }
    } catch (error) {
      console.error('Seed data error:', error);
      setStatus('❌ Beklenmeyen hata!');
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setStatus('Bağlantı test ediliyor...');
    
    try {
      const success = await testDatabaseConnection();
      if (success) {
        setStatus('✅ Veritabanı bağlantısı başarılı!');
        Alert.alert('Başarılı', 'Supabase bağlantısı çalışıyor!');
      } else {
        setStatus('❌ Bağlantı hatası!');
        Alert.alert('Hata', 'Supabase bağlantısında sorun var!');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setStatus('❌ Bağlantı testi hatası!');
      Alert.alert('Hata', 'Bağlantı testi sırasında hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckData = async () => {
    setLoading(true);
    setStatus('Veriler kontrol ediliyor...');
    
    try {
      const success = await checkSupabaseData();
      if (success) {
        setStatus('✅ Veri kontrolü tamamlandı!');
        Alert.alert('Başarılı', 'Veriler kontrol edildi!');
      } else {
        setStatus('❌ Veri kontrolü hatası!');
        Alert.alert('Hata', 'Veri kontrolü sırasında hata oluştu!');
      }
    } catch (error) {
      console.error('Data check error:', error);
      setStatus('❌ Veri kontrolü hatası!');
      Alert.alert('Hata', 'Veri kontrolü sırasında hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase Veri Yönetimi</Text>
        <Text style={styles.subtitle}>Mock verileri Supabase'e aktarın</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSeedData}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Ekleniyor...' : '🚀 Mock Verileri Ekle'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleTestConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Test Ediliyor...' : '🔍 Bağlantıyı Test Et'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={handleCheckData}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Kontrol Ediliyor...' : '📊 Verileri Kontrol Et'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>📋 Eklenecek Veriler:</Text>
        <Text style={styles.infoText}>• Kullanıcı profili ve sosyal medya hesapları</Text>
        <Text style={styles.infoText}>• Kampanyalar (Quantum Orbit Labs, TooA, Qora, vb.)</Text>
        <Text style={styles.infoText}>• Başvurular ve davetler</Text>
        <Text style={styles.infoText}>• Bildirimler</Text>
        <Text style={styles.infoText}>• Cüzdan ve işlem geçmişi</Text>
        <Text style={styles.infoText}>• Ambassador sistemi (markalar, programlar, görevler)</Text>
        <Text style={styles.infoText}>• Promo kodları</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    padding: 15,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  infoButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
