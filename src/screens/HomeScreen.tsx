import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  TouchableOpacity, ScrollView,
  StatusBar, Dimensions, Alert, Pressable,
  Animated, Easing
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase'; 
import { translations } from '../constants/translations';
import { useTheme } from '../context/ThemeContext';

// ─── الأنواع ──────────────────────────────────────────────────
type ScreenState = 'welcome' | 'login' | 'signup' | 'home' | 'settings' | 'profile' | 'chat' | 'generalSettings' | 'clinic' | 'vitals';

interface HomeProps {
  onNavigate: (screen: ScreenState) => void;
}

const { width: SW } = Dimensions.get('window');

// ─── Grid Button ─────────────────────────────────────────────
const GridBtn = ({ icon, label, accent, onPress, index }: any) => {
  const { isDarkMode } = useTheme();

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        delay: index * 150 + 400,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 150 + 400,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[
      gridStyles.btnWrapper,
      { opacity, transform: [{ scale }, { translateY }] }
    ]}>
      <Pressable 
        style={[gridStyles.btn, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[gridStyles.iconCircle, { backgroundColor: accent + '15' }]}>
          <MaterialCommunityIcons name={icon} size={30} color={accent} />
        </View>
        <Text style={[gridStyles.label, { color: isDarkMode ? '#FFFFFF' : '#191D32' }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── ECG ─────────────────────────────────────────────────────
const ECGLine = ({ color, bpm }: { color: string; bpm: number }) => {
  const pts = [[0,20],[10,20],[16,4],[18,32],[20,20],[46,10],[48,28],[50,20],[76,5],[78,33],[100,20]];
  const W = SW - 80;

  const scaleY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (bpm > 0) {
      const duration = (60 / bpm) * 1000;

      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleY, {
            toValue: 1.1,
            duration: duration * 0.3,
            useNativeDriver: true
          }),
          Animated.timing(scaleY, {
            toValue: 1,
            duration: duration * 0.7,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [bpm]);

  return (
    <Animated.View style={[ecgStyles.wrapper, { transform: [{ scaleY }] }]}>
      {pts.map(([x, y], i) => {
        if (i === 0) return null;
        const [px, py] = pts[i - 1];
        const scaleX = W / 100;
        const x1 = px * scaleX, x2 = x * scaleX;
        const dx = x2 - x1, dy = y - py;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View key={i} style={{ 
            position: 'absolute', left: x1, top: py, width: len, height: 2.5, 
            backgroundColor: color, transform: [{ rotate: `${angle}deg` }] 
          }} />
        );
      })}
    </Animated.View>
  );
};

// ─── Skeleton ────────────────────────────────────────────────
const SkeletonLoader = () => {
  const { colors, isDarkMode } = useTheme();

  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const skeletonColor = isDarkMode ? '#1E293B' : '#E2E8F0';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.header}>
         <Animated.View style={[s.skeletonText, { width: 120, height: 40, backgroundColor: skeletonColor, opacity }]} />
      </View>
    </SafeAreaView>
  );
};

// ─── Main Screen ─────────────────────────────────────────────
export default function HomeScreen({ onNavigate }: HomeProps) {
  const { colors, isDarkMode } = useTheme();
  const lang = 'ar';
  const t = translations[lang];

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState({ heart_rate: 0 });

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchData();

    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(contentTranslateY, { toValue: 0, useNativeDriver: true })
    ]).start();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    if (profile) setUserName(profile.full_name);

    const { data: pData } = await supabase.from('patients').select('*').eq('user_id', user.id).single();
    if (pData) {
      setPatient(pData);
      const { data: health } = await supabase.from('patient_health').select('heart_rate').eq('patient_id', pData.id).order('created_at', { ascending: false }).limit(1).single();
      if (health) setVitals(health);
    }

    setLoading(false);
  };

  const triggerSOS = () => {
    Alert.alert("تأكيد الطوارئ", "هل تريد إرسال استغاثة؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "إرسال", style: "destructive", onPress: async () => {
          await supabase.from('alerts').insert([{ patient_id: patient?.id, alert_type: 'SOS', status: 'active' }]);
        }
      }
    ]);
  };

  if (loading) return <SkeletonLoader />;

  const isDanger = vitals.heart_rate > 100 || (vitals.heart_rate < 50 && vitals.heart_rate > 0);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <Animated.View style={[s.header, { opacity: headerOpacity }]}>
        <Text style={[s.greetName, { color: colors.text }]}>{userName}</Text>
      </Animated.View>

      <Animated.ScrollView 
        contentContainerStyle={s.scrollContent} 
        style={{ transform: [{ translateY: contentTranslateY }] }}
      >
        <View style={[s.ecgCard]}>
          <Text style={s.ecgValue}>{vitals.heart_rate} BPM</Text>
          <ECGLine color={isDanger ? '#FF3B3B' : colors.primary} bpm={vitals.heart_rate} />
        </View>

        <View style={s.grid}>
          <GridBtn index={0} icon="alert-octagon" label={t.sos} accent="#FF3B3B" onPress={triggerSOS} />
          <GridBtn index={1} icon="heart-pulse" label={t.vitals} accent={colors.primary} onPress={() => onNavigate('vitals')} />
          <GridBtn index={2} icon="chat-outline" label={t.chat} accent="#64748B" onPress={() => onNavigate('chat')} />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  greetName: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  ecgCard: { backgroundColor: '#191D32', borderRadius: 25, padding: 25, marginBottom: 20 },
  ecgValue: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  skeletonText: { borderRadius: 8 }
});

const gridStyles = StyleSheet.create({
  btnWrapper: { width: '48%', marginBottom: 15 },
  btn: { width: '100%', borderRadius: 25, padding: 20, alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: 'bold' },
});

const ecgStyles = StyleSheet.create({ wrapper: { height: 40, overflow: 'hidden' } });