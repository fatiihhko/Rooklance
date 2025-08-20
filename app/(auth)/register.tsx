import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Image, Animated } from 'react-native';
import { TextInput, Button, Card, IconButton, ProgressBar } from 'react-native-paper';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import SocialMediaConnect from '../../components/SocialMediaConnect';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [socialMedia, setSocialMedia] = useState({
    instagram: '',
    tiktok: '',
    youtube: '',
  });

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaConnect = (platform: string, username: string) => {
    setSocialMedia(prev => ({ ...prev, [platform]: username }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleRegister = async () => {
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        socialMedia: Object.values(socialMedia).some(value => value) ? socialMedia : undefined,
      });
    router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Hata', 'Kayıt olurken bir hata oluştu.');
    }
  };

  const progress = currentStep / 2;

  return (
          <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[COLORS.background, COLORS.surface]}
          style={styles.gradient}
        >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress} 
              color={COLORS.primary} 
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              Adım {currentStep} / 2
            </Text>
          </View>

          {currentStep === 1 ? (
            /* Step 1: Personal Information */
            <>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Kişisel Bilgilerinizi Girin</Text>
                <Text style={styles.welcomeSubtitle}>
                  Hesabınızı oluşturmak için gerekli bilgileri doldurun
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* Ad Soyad Row */}
                <View style={styles.inputRow}>
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'firstName' && styles.inputWrapperFocused
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <IconButton
                        icon="account"
                        iconColor={focusedInput === 'firstName' ? COLORS.primary : COLORS.textSecondary}
                        size={20}
                        style={styles.inputIcon}
                      />
                    </View>
              <TextInput
                label="Ad"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                      onFocus={() => setFocusedInput('firstName')}
                      onBlur={() => setFocusedInput(null)}
                      style={styles.modernInput}
                      mode="flat"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                textColor={COLORS.text}
                      theme={{ 
                        colors: { 
                          onSurfaceVariant: COLORS.textSecondary,
                          surface: 'transparent'
                        } 
                      }}
                    />
                  </View>
                  
                  <View style={[
                    styles.inputWrapper,
                    focusedInput === 'lastName' && styles.inputWrapperFocused
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <IconButton
                        icon="account"
                        iconColor={focusedInput === 'lastName' ? COLORS.primary : COLORS.textSecondary}
                        size={20}
                        style={styles.inputIcon}
                      />
                    </View>
              <TextInput
                label="Soyad"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                      onFocus={() => setFocusedInput('lastName')}
                      onBlur={() => setFocusedInput(null)}
                      style={styles.modernInput}
                      mode="flat"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                textColor={COLORS.text}
                      theme={{ 
                        colors: { 
                          onSurfaceVariant: COLORS.textSecondary,
                          surface: 'transparent'
                        } 
                      }}
                    />
                  </View>
            </View>

                {/* E-posta */}
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <IconButton
                      icon="email"
                      iconColor={focusedInput === 'email' ? COLORS.primary : COLORS.textSecondary}
                      size={20}
                      style={styles.inputIcon}
                    />
                  </View>
            <TextInput
                    label="E-posta Adresi"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    style={styles.modernInput}
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
              textColor={COLORS.text}
              keyboardType="email-address"
              autoCapitalize="none"
                    theme={{ 
                      colors: { 
                        onSurfaceVariant: COLORS.textSecondary,
                        surface: 'transparent'
                      } 
                    }}
                  />
                </View>

                {/* Şifre */}
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <IconButton
                      icon="lock"
                      iconColor={focusedInput === 'password' ? COLORS.primary : COLORS.textSecondary}
                      size={20}
                      style={styles.inputIcon}
                    />
                  </View>
            <TextInput
              label="Şifre"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    style={styles.modernInput}
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
              textColor={COLORS.text}
              secureTextEntry
                    theme={{ 
                      colors: { 
                        onSurfaceVariant: COLORS.textSecondary,
                        surface: 'transparent'
                      } 
                    }}
                  />
                </View>

                {/* Şifre Tekrar */}
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'confirmPassword' && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <IconButton
                      icon="lock-check"
                      iconColor={focusedInput === 'confirmPassword' ? COLORS.primary : COLORS.textSecondary}
                      size={20}
                      style={styles.inputIcon}
                    />
                  </View>
            <TextInput
              label="Şifre Tekrar"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                    style={styles.modernInput}
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
              textColor={COLORS.text}
              secureTextEntry
                    theme={{ 
                      colors: { 
                        onSurfaceVariant: COLORS.textSecondary,
                        surface: 'transparent'
                      } 
                    }}
                  />
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleNextStep}
                style={styles.nextButton}
                labelStyle={[styles.buttonText, { color: COLORS.background }]}
                buttonColor={COLORS.text}
              >
                Devam Et
              </Button>
            </>
          ) : (
            /* Step 2: Social Media */
            <>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Sosyal Medya Hesaplarınızı Bağlayın</Text>
                <Text style={styles.welcomeSubtitle}>
                  Bu adım isteğe bağlıdır, daha sonra da yapabilirsiniz
                </Text>
              </View>

              <SocialMediaConnect
                onConnect={handleSocialMediaConnect}
                connectedAccounts={socialMedia}
                isOptional={true}
              />

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handlePreviousStep}
                  style={[styles.previousButton, { backgroundColor: COLORS.surfaceLight }]}
                  labelStyle={[styles.buttonText, { color: COLORS.text }]}
                >
                  Geri
                </Button>

        <Button
          mode="contained"
          onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
          style={styles.registerButton}
                  labelStyle={[styles.buttonText, { color: COLORS.background }]}
                  buttonColor={COLORS.text}
        >
                  {isLoading ? 'Kayıt Oluşturuluyor...' : 'Hesabı Oluştur'}
        </Button>
              </View>
            </>
          )}
              </ScrollView>
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
  },

  scrollContent: {
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.lg,
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

  progressContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceLight,
  },
  progressText: {
    fontSize: SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.spacing.sm,
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
  formContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    ...SHADOWS.small,
    marginBottom: SIZES.spacing.lg,
  },
  inputIconContainer: {
    position: 'absolute',
    left: SIZES.spacing.sm,
    top: 12,
    zIndex: 1,
  },
  inputIcon: {
    margin: 0,
    backgroundColor: 'transparent',
  },
  modernInput: {
    backgroundColor: 'transparent',
    paddingLeft: SIZES.spacing.xl + SIZES.spacing.md,
    paddingRight: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    fontSize: SIZES.md,
    fontFamily: FONTS.regular,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...SHADOWS.medium,
  },
  nextButton: {
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  previousButton: {
    flex: 1,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  registerButton: {
    flex: 1,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
    ...SHADOWS.small,
  },
  buttonText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
  },
});
