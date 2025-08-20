import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Card, IconButton, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    try {
      await login(formData.email, formData.password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu.');
    }
  };

  return (
          <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[COLORS.background, COLORS.surface]}
          style={styles.gradient}
        >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SIZES.spacing.md }]}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-left"
              iconColor={COLORS.text}
              size={24}
              onPress={() => router.back()}
            />
          </View>
          
          <View style={styles.headerCenter}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
            </View>
          </View>
          

        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Tekrar Giriş Yapın</Text>
          <Text style={styles.welcomeSubtitle}>
            Hesabınıza erişmek için bilgilerinizi girin
          </Text>
        </View>

        {/* Form */}
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="E-posta"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              style={styles.input}
              mode="outlined"
              outlineColor={COLORS.surfaceLight}
              activeOutlineColor={COLORS.primary}
              textColor={COLORS.text}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{ colors: { onSurfaceVariant: COLORS.textSecondary } }}
              left={<TextInput.Icon icon="email" color={COLORS.primary} />}
            />

            <TextInput
              label="Şifre"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              style={styles.input}
              mode="outlined"
              outlineColor={COLORS.surfaceLight}
              activeOutlineColor={COLORS.primary}
              textColor={COLORS.text}
              secureTextEntry
              theme={{ colors: { onSurfaceVariant: COLORS.textSecondary } }}
              left={<TextInput.Icon icon="lock" color={COLORS.primary} />}
            />

            <Button
              mode="text"
              onPress={() => Alert.alert('Bilgi', 'Şifre sıfırlama özelliği yakında eklenecek.')}
              textColor={COLORS.primary}
              style={styles.forgotPassword}
            >
              Şifremi Unuttum
            </Button>
          </Card.Content>
        </Card>

        {/* Giriş Butonu */}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.loginButton}
          labelStyle={[styles.buttonText, { color: COLORS.background }]}
          buttonColor={COLORS.text}
        >
          {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </Button>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text style={styles.dividerText}>veya</Text>
          <Divider style={styles.divider} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Bilgi', 'Sosyal medya ile giriş yakında eklenecek.')}
            style={styles.socialButton}
            textColor={COLORS.instagram}
            icon="instagram"
          >
            Instagram ile Giriş
          </Button>
        </View>

        {/* Kayıt Ol Linki */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Hesabınız yok mu? </Text>
          <Button
            mode="text"
            onPress={() => router.push('/(auth)/register')}
            textColor={COLORS.primary}
            style={styles.registerLink}
          >
            Kayıt Ol
          </Button>
        </View>
        </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.xl,
    paddingHorizontal: SIZES.spacing.lg,
  },
  headerLeft: {
    position: 'absolute',
    left: SIZES.spacing.lg,
    top: 0,
    zIndex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 30,
    resizeMode: 'contain',
  },

  welcomeContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  welcomeTitle: {
    fontSize: SIZES.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.xl,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  input: {
    marginBottom: SIZES.spacing.lg,
    backgroundColor: COLORS.surfaceLight,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: SIZES.spacing.sm,
  },
  loginButton: {
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
    ...SHADOWS.small,
  },
  buttonText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.spacing.lg,
  },
  divider: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  dividerText: {
    marginHorizontal: SIZES.spacing.md,
    fontSize: SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  socialContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  socialButton: {
    borderRadius: SIZES.radius.lg,
    borderColor: COLORS.instagram,
    borderWidth: 1,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: SIZES.spacing.lg,
  },
  registerText: {
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  registerLink: {
    marginLeft: SIZES.spacing.xs,
  },
});
