import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Pressable,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  onNavigateToProfile: () => void;
  onNavigateToGeneralSettings: () => void;
  onLogout: () => void;
  onBack: () => void;
}

// ✅ Setting Item
const SettingItem = ({
  icon,
  label,
  onPress,
  index,
  colors,
  isDestructive = false
}: any) => {

  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        width: '100%',
        opacity: fade,
        transform: [
          { scale },
          {
            translateY: fade.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            })
          }
        ]
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.menuItem,
          {
            backgroundColor: colors.card,
            opacity: pressed ? 0.9 : 1,
          }
        ]}
      >
        {!isDestructive && (
          <MaterialCommunityIcons
            name="chevron-left"
            size={20}
            color={colors.subText}
            style={{ opacity: 0.4 }}
          />
        )}

        <Text
          style={[
            styles.menuText,
            {
              color: isDestructive ? "#FF4B4B" : colors.text,
              textAlign: 'right',
              fontWeight: isDestructive ? 'bold' : '600'
            }
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDestructive
                ? '#FF4B4B15'
                : colors.primary + '15'
            }
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={isDestructive ? "#FF4B4B" : colors.primary}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const SettingsScreen: React.FC<SettingsProps> = ({
  onNavigateToProfile,
  onNavigateToGeneralSettings,
  onLogout,
  onBack,
}) => {

  const { colors, isDarkMode } = useTheme();

  const headerFade = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#191D32' }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backCircle}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-right" size={26} color="#FFF" />
        </TouchableOpacity>

        <Animated.Text
          style={[
            styles.headerTitle,
            { opacity: headerFade }
          ]}
        >
          الإعدادات
        </Animated.Text>

        <View style={{ width: 45 }} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              })
            }]
          }
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>
          الحساب والتطبيق
        </Text>

        <SettingItem
          index={1}
          icon="account-circle-outline"
          label="الملف الشخصي"
          onPress={onNavigateToProfile}
          colors={colors}
        />

        <SettingItem
          index={2}
          icon="palette-outline"
          label="المظهر والتفضيلات"
          onPress={onNavigateToGeneralSettings}
          colors={colors}
        />

        <SettingItem
          index={3}
          icon="bell-outline"
          label="التنبيهات"
          onPress={() => {}}
          colors={colors}
        />

        <View style={[styles.divider, { backgroundColor: colors.subText + '10' }]} />

        <SettingItem
          index={4}
          icon="logout-variant"
          label="تسجيل الخروج"
          onPress={onLogout}
          colors={colors}
          isDestructive
        />

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.versionBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.versionText, { color: colors.subText }]}>
              نسخة رفيق v2.0.4
            </Text>
          </View>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 90,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold'
  },

  content: {
    flex: 1,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingTop: 35,
    paddingHorizontal: 20
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'right',
    marginRight: 10,
    opacity: 0.6,
    letterSpacing: 0.5
  },

  menuItem: {
    height: 70,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },

  menuText: {
    flex: 1,
    fontSize: 16,
    marginRight: 15
  },

  divider: {
    height: 1.5,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 15,
  },

  footer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center'
  },

  versionBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },

  versionText: {
    fontSize: 11,
    fontWeight: 'bold',
    opacity: 0.7
  }
});

export default SettingsScreen;