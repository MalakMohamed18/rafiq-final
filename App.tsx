import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

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
import EmergencyCenter from './src/screens/EmergencyCenter';
import NotificationsScreen from './src/screens/NotificationsScreen';

type ScreenState = 
  | 'welcome' | 'login' | 'signup' | 'home' | 'settings' 
  | 'profile' | 'chat' | 'generalSettings' | 'clinic' 
  | 'addPatient' | 'vitals' | 'emergency' | 'notifications';

function AppContent() {
  const { colors } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('welcome');

  const checkPatientStatus = async (userId: string) => {
    try {
      const { data } = await supabase
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
      setCurrentScreen('home');
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkPatientStatus(user.id);
      } else {
        setInitializing(false);
      }
    });

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentScreen('welcome'); 
    } catch (error: any) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
    }
  };

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

          {currentScreen === 'home' && (
            <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen 
              onBack={() => setCurrentScreen('home')} 
              onNavigate={(screen) => setCurrentScreen(screen)} 
              onLogout={handleLogout} 
            />
          )}

          {currentScreen === 'notifications' && (
            <NotificationsScreen onNavigate={(screen) => setCurrentScreen(screen)} />
          )}

          {currentScreen === 'emergency' && (
            <EmergencyCenter onNavigate={(screen) => setCurrentScreen(screen)} />
          )}

          {currentScreen === 'vitals' && (
             <VitalsScreen onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'chat' && (
             <ChatScreen onNavigate={(screen) => setCurrentScreen(screen)} />
          )}

          {currentScreen === 'generalSettings' && (
            <GeneralSettingsScreen onBack={() => setCurrentScreen('settings')} />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen 
              onBack={() => setCurrentScreen('settings')} 
              onNavigate={(screen) => setCurrentScreen(screen)} 
            />
          )}

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

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});