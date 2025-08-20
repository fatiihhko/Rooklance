import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../utils/supabase-services';
import { supabase, testSupabaseConnection } from '../utils/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateSocialMedia: (platform: string, username: string) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      console.log('Loading user from storage...');
      const userData = await AsyncStorage.getItem('user');
      console.log('User data from storage:', userData);
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('No user data found in storage');
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Supabase Auth ile giriş yap
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        throw new Error(authError.message || 'Giriş başarısız');
      }
      
      if (!authData.user) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      // Kullanıcı profilini getir
      const userProfile = await userService.getUserProfile(authData.user.id);
      
      if (userProfile) {
        // Profil varsa kullan
        setUser(userProfile);
        await saveUserToStorage(userProfile);
      } else {
        // Profil yoksa e-posta adresinden oluştur
        const emailUsername = email.split('@')[0];
        
        let firstName = emailUsername;
        let lastName = 'Kullanıcı';
        
        if (emailUsername.includes('.')) {
          const parts = emailUsername.split('.');
          firstName = parts[0];
          lastName = parts[1] || 'Kullanıcı';
        }
        
        const finalFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const finalLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
        
        const userData: User = {
          id: authData.user.id,
          email,
          firstName: finalFirstName,
          lastName: finalLastName,
          profileImage: 'https://via.placeholder.com/100',
          socialMedia: {},
          followerCount: 0,
          contentCategories: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setUser(userData);
        await saveUserToStorage(userData);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      console.log('Registering user with real data:', userData);
      
      // Önce Supabase bağlantısını test et
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest) {
        throw new Error('Supabase bağlantısı başarısız');
      }
      
      // Önce Supabase Auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });
      
      if (authError) {
        console.error('Auth registration error:', authError);
        throw new Error(authError.message || 'Kayıt başarısız');
      }
      
      if (!authData.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }
      
      console.log('Auth registration successful, user ID:', authData.user.id);
      
      // Kullanıcı profilini oluştur
      const profileData = await userService.createUser({
        id: authData.user.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: 'https://via.placeholder.com/100'
      });
      
      if (profileData) {
        console.log('Profile created successfully:', profileData);
        setUser(profileData);
        await saveUserToStorage(profileData);
      } else {
        // Profil oluşturulamazsa, local olarak oluştur
        const newUser: User = {
          id: authData.user.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImage: 'https://via.placeholder.com/100',
          socialMedia: {},
          followerCount: 0,
          contentCategories: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Profile created locally:', newUser);
        setUser(newUser);
        await saveUserToStorage(newUser);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Supabase Auth'dan çıkış yap
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Auth logout error:', error);
      }
      
      // Local storage'ı temizle
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSocialMedia = async (platform: string, username: string) => {
    if (!user) return;
    
    try {
      // Supabase'de sosyal medya hesaplarını güncelle
      const socialMediaData = {
        ...user.socialMedia,
        [platform]: { username, followers: 0, verified: false }
      };
      
      const success = await userService.updateSocialMediaAccounts(user.id, socialMediaData);
      
      if (success) {
        // Supabase'den güncel kullanıcı verilerini al
        const updatedUser = await userService.getUserProfile(user.id);
        if (updatedUser) {
          setUser(updatedUser);
          await saveUserToStorage(updatedUser);
        }
      } else {
        // Supabase güncelleme başarısızsa, sadece local'i güncelle
        const localUpdatedUser = {
          ...user,
          socialMedia: {
            ...user.socialMedia,
            [platform]: username
          }
        };
        setUser(localUpdatedUser);
        await saveUserToStorage(localUpdatedUser);
      }
    } catch (error) {
      console.error('Sosyal medya güncelleme hatası:', error);
      // Hata durumunda sadece local'i güncelle
      const localUpdatedUser = {
        ...user,
        socialMedia: {
          ...user.socialMedia,
          [platform]: username
        }
      };
      setUser(localUpdatedUser);
      await saveUserToStorage(localUpdatedUser);
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    if (!user) return;
    
    try {
      // Supabase'de profil resmini güncelle
      const updatedUser = await userService.updateUserProfile(user.id, {
        profileImage: imageUri
      });
      
      if (updatedUser) {
        setUser(updatedUser);
        await saveUserToStorage(updatedUser);
      } else {
        // Supabase güncelleme başarısızsa, sadece local'i güncelle
        const localUpdatedUser = {
          ...user,
          profileImage: imageUri
        };
        setUser(localUpdatedUser);
        await saveUserToStorage(localUpdatedUser);
      }
    } catch (error) {
      console.error('Profil resmi güncelleme hatası:', error);
      // Hata durumunda sadece local'i güncelle
      const localUpdatedUser = {
        ...user,
        profileImage: imageUri
      };
      setUser(localUpdatedUser);
      await saveUserToStorage(localUpdatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateSocialMedia,
    updateProfileImage,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
