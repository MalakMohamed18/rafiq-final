import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ onBack }: { onBack: () => void }) => {
  const { colors, isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: isDarkMode ? colors.card : '#D1E9F6' }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>الملف الشخصي</Text>
      </View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY }] }}
      >
        
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.card, borderColor: colors.text }]}>
             <MaterialCommunityIcons name="account-outline" size={80} color={colors.subText} />
          </View>
          <TouchableOpacity>
            <Text style={[styles.editPhotoText, { color: colors.primary }]}>تعديل الصورة</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          {['الاسم: سيف', 'السنة: 17', 'فصيلة الدم: B+', 'حساسية: حساسية مفرطة'].map((info, index) => (
            <View key={index} style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.subText} />
              <Text style={[styles.infoText, { color: colors.text }]}>{info}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[styles.bottomTab, { backgroundColor: colors.card, borderTopColor: colors.navBorder }]}>
        {['cog', 'chat-outline', 'stethoscope', 'heart-pulse'].map((icon, index) => (
          <View key={index} style={[styles.tabItem, index === 3 && styles.activeTab]}>
            {index === 1 && <View style={styles.badge}><Text style={styles.badgeText}>1</Text></View>}
            <MaterialCommunityIcons 
              name={icon as any} 
              size={28} 
              color={index === 3 ? colors.primary : colors.subText} 
            />
            <Text style={[styles.tabLabel, { color: index === 3 ? colors.primary : colors.subText }]}>
              {['الإعدادات', 'دردشة', 'العيادة', 'رئيسية'][index]}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  backButton: { position: 'absolute', left: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { alignItems: 'center', paddingTop: 30, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  editPhotoText: { marginTop: 10, fontSize: 16, fontWeight: '500' },
  infoContainer: { width: '90%' },
  infoCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 18, borderRadius: 12, marginBottom: 12, elevation: 2 },
  infoText: { flex: 1, textAlign: 'right', fontSize: 18, fontWeight: '500' },
  bottomTab: { position: 'absolute', bottom: 0, flexDirection: 'row', height: 80, width: '100%', borderTopWidth: 1, paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, marginTop: 4, textAlign: 'center' },
  activeTab: { borderTopWidth: 2 },
  badge: { position: 'absolute', top: 5, right: 20, backgroundColor: '#E74C3C', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});

export default ProfileScreen;