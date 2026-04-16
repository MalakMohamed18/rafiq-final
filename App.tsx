import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text,TouchableOpacity } from 'react-native';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// استيراد الـ ThemeProvider والـ Hook الخاص بالثيم
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// استيراد الشاشات
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import GeneralSettingsScreen from './src/screens/GeneralSettingsScreen';
import AddPatientScreen from './src/screens/AddPatientScreen';
import VitalsScreen from './src/screens/VitalsScreen';

type ScreenState = 
  | 'welcome' | 'login' | 'signup' | 'home' | 'settings' 
  | 'profile' | 'chat' | 'generalSettings' | 'clinic' 
  | 'addPatient' | 'vitals';

function AppContent() {
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('welcome');

  // دالة التحقق من وجود مريض مضاف مسبقاً
  const checkPatientStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (data && data.length > 0) {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('addPatient');
      }
    } catch (err) {
      console.error("Error checking patient status:", err);
      setCurrentScreen('home'); // احتياطياً لو حصل خطأ نفتح الهوم
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    // 1. التحقق من المستخدم عند فتح التطبيق
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkPatientStatus(user.id);
      } else {
        setInitializing(false);
      }
    });

    // 2. مراقبة تغير حالة التسجيل (دخول/خروج)
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        checkPatientStatus(currentUser.id);
      } else {
        setInitializing(false);
        setCurrentScreen('welcome');
      }
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  // شاشة التحميل (Activity Indicator)
  if (initializing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!user ? (
        <>
          {currentScreen === 'welcome' && (
            <WelcomeScreen 
              onLoginPress={() => setCurrentScreen('login')} 
              onRegisterPress={() => setCurrentScreen('signup')} 
            />
          )}
          {currentScreen === 'login' && <LoginScreen onGoToSignup={() => setCurrentScreen('signup')} />}
          {currentScreen === 'signup' && <SignUpScreen onGoToLogin={() => setCurrentScreen('login')} />}
        </>
      ) : (
        <>
          {currentScreen === 'addPatient' && (
            <AddPatientScreen onSuccess={() => checkPatientStatus(user.id)} />
          )}
          {currentScreen === 'home' && <HomeScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'settings' && (
            <SettingsScreen 
              onBack={() => setCurrentScreen('home')}
              onNavigateToProfile={() => setCurrentScreen('profile')}
              onNavigateToGeneralSettings={() => setCurrentScreen('generalSettings')}
              onLogout={() => supabase.auth.signOut()}
            />
          )}
          {currentScreen === 'vitals' && <VitalsScreen onBack={() => setCurrentScreen('home')} />}
          {currentScreen === 'chat' && <ChatScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'generalSettings' && (
            <GeneralSettingsScreen onBack={() => setCurrentScreen('settings')} />
          )}
          {currentScreen === 'profile' && <ProfileScreen onBack={() => setCurrentScreen('settings')} />}
          {currentScreen === 'clinic' && (
            <View style={styles.center}>
              <MaterialCommunityIcons name="stethoscope" size={80} color={colors.primary} />
              <Text style={{ color: colors.text, marginTop: 20, fontSize: 18 }}>قريباً: العيادة الذكية</Text>
              <TouchableOpacity onPress={() => setCurrentScreen('home')} style={{marginTop: 20}}>
                 <Text style={{color: colors.primary}}>العودة للرئيسية</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// المكون الرئيسي
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});