import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo ve Başlık */}
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
          <Text style={styles.subtitle}>
            Siz de Rook AI'ın Influencer Elçisi olun!
          </Text>
        </View>

        {/* Butonlar */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            labelStyle={[styles.buttonText, { color: COLORS.background }]}
            buttonColor={COLORS.text}
          >
            Giriş Yap
          </Button>
          
          <Button
            mode="contained"
            onPress={handleRegister}
            style={[styles.registerButton, { backgroundColor: COLORS.surfaceLight }]}
            labelStyle={[styles.buttonText, { color: COLORS.text }]}
          >
            Kayıt Ol
          </Button>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: height * 0.2,
    paddingBottom: SIZES.spacing.xxl,
  },
  header: {
    alignItems: 'center',
  },
  logoImage: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
    marginBottom: SIZES.spacing.md,
  },
  subtitle: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: SIZES.spacing.md,
  },
  loginButton: {
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
  },
  registerButton: {
    borderRadius: SIZES.radius.lg,
    paddingVertical: SIZES.spacing.md,
  },
  buttonText: {
    fontSize: SIZES.lg,
    fontFamily: FONTS.medium,
  },
});
