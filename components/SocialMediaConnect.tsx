import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Card, Button, TextInput, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

interface SocialMediaConnectProps {
  onConnect: (platform: string, username: string) => void;
  connectedAccounts?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  isOptional?: boolean;
}

export default function SocialMediaConnect({ 
  onConnect, 
  connectedAccounts = {}, 
  isOptional = true 
}: SocialMediaConnectProps) {
  const [accounts, setAccounts] = useState({
    instagram: connectedAccounts.instagram || '',
    tiktok: connectedAccounts.tiktok || '',
    youtube: connectedAccounts.youtube || '',
  });

  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = async (platform: string) => {
    const username = accounts[platform as keyof typeof accounts];
    
    if (!username.trim()) {
      Alert.alert('Hata', `Lütfen ${platform} kullanıcı adınızı girin.`);
      return;
    }

    setIsConnecting(platform);
    try {
      // Simüle edilmiş bağlantı işlemi
      await new Promise(resolve => setTimeout(resolve, 1500));
      onConnect(platform, username);
      Alert.alert('Başarılı', `${platform} hesabınız başarıyla bağlandı!`);
    } catch (error) {
      Alert.alert('Hata', `${platform} hesabı bağlanırken bir hata oluştu.`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleInputChange = (platform: string, value: string) => {
    setAccounts(prev => ({ ...prev, [platform]: value }));
  };

  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return {
          name: 'Instagram',
          icon: 'instagram',
          color: COLORS.instagram,
          gradient: ['#833AB4', '#FD1D1D', '#F77737'],
          placeholder: '@kullanıcıadı',
          description: 'Instagram hesabınızı bağlayın'
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          icon: 'music-note',
          color: COLORS.tiktok,
          gradient: ['#000000', '#25F4EE', '#FE2C55'],
          placeholder: '@kullanıcıadı',
          description: 'TikTok hesabınızı bağlayın'
        };
      case 'youtube':
        return {
          name: 'YouTube',
          icon: 'youtube',
          color: COLORS.youtube,
          gradient: ['#FF0000', '#FF6B6B'],
          placeholder: 'Kanal adı veya link',
          description: 'YouTube kanalınızı bağlayın'
        };
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isOptional ? 'Sosyal Medya Hesaplarınızı Bağlayın' : 'Sosyal Medya Hesaplarınızı Bağlayın (İsteğe Bağlı)'}
      </Text>
      <Text style={styles.subtitle}>
        Hesaplarınızı bağlayarak daha iyi bir deneyim yaşayın
      </Text>

      {(['instagram', 'tiktok', 'youtube'] as const).map((platform) => {
        const info = getPlatformInfo(platform);
        if (!info) return null;

        const isConnected = connectedAccounts[platform];
        const isLoading = isConnecting === platform;

        return (
          <Card key={platform} style={styles.card}>
            <LinearGradient
              colors={info.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <IconButton
                      icon={info.icon}
                      iconColor={info.color}
                      size={24}
                      style={styles.platformIcon}
                    />
                    <View style={styles.platformText}>
                      <Text style={styles.platformName}>{info.name}</Text>
                      <Text style={styles.platformDescription}>
                        {isConnected ? 'Bağlandı' : info.description}
                      </Text>
                    </View>
                  </View>
                  
                  {isConnected && (
                    <View style={styles.connectedBadge}>
                      <Text style={styles.connectedText}>✓</Text>
                    </View>
                  )}
                </View>

                {!isConnected && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      label={info.placeholder}
                      value={accounts[platform]}
                      onChangeText={(text) => handleInputChange(platform, text)}
                      style={styles.input}
                      mode="outlined"
                      outlineColor={COLORS.surfaceLight}
                      activeOutlineColor={info.color}
                      textColor={COLORS.text}
                      theme={{ colors: { onSurfaceVariant: COLORS.textSecondary } }}
                      left={<TextInput.Icon icon={info.icon} iconColor={info.color} />}
                    />
                    
                    <Button
                      mode="contained"
                      onPress={() => handleConnect(platform)}
                      loading={isLoading}
                      disabled={isLoading}
                      style={[styles.connectButton, { backgroundColor: COLORS.text }]}
                      labelStyle={[styles.connectButtonText, { color: COLORS.background }]}
                    >
                      {isLoading ? 'Bağlanıyor...' : 'Bağla'}
                    </Button>
                  </View>
                )}

                {isConnected && (
                  <View style={styles.connectedContainer}>
                    <Text style={styles.connectedUsername}>
                      {connectedAccounts[platform]}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => onConnect(platform, '')}
                      style={[styles.disconnectButton, { backgroundColor: COLORS.text }]}
                      labelStyle={[styles.connectButtonText, { color: COLORS.background }]}
                    >
                      Bağlantıyı Kes
                    </Button>
                  </View>
                )}
              </Card.Content>
            </LinearGradient>
          </Card>
        );
      })}

      {isOptional && (
        <View style={styles.skipContainer}>
          <Text style={styles.skipText}>
            Bu adımı atlayabilirsiniz. Daha sonra profilinizden de bağlayabilirsiniz.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xl,
    textAlign: 'center',
  },
  card: {
    marginBottom: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
    minHeight: 120,
  },
  gradientBorder: {
    borderRadius: SIZES.radius.lg,
  },
  cardContent: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    margin: 2,
    borderRadius: SIZES.radius.lg - 2,
    padding: SIZES.spacing.lg,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    margin: 0,
    marginRight: SIZES.spacing.md,
  },
  platformText: {
    flex: 1,
  },
  platformName: {
    fontSize: SIZES.xl,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  platformDescription: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  connectedBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedText: {
    color: COLORS.text,
    fontSize: SIZES.sm,
    fontFamily: FONTS.bold,
  },
  inputContainer: {
    gap: SIZES.spacing.md,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
  },
  connectButton: {
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.spacing.sm,
  },
  connectButtonText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
  },
  connectedContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
  },
  connectedUsername: {
    fontSize: SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  disconnectButton: {
    borderColor: COLORS.error,
  },
  skipContainer: {
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.md,
  },
  skipText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
