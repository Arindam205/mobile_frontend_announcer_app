import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Get window dimensions
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Use object literals instead of enum
const BadgeType = {
  NONE: 'none',
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  DIAMOND: 'diamond'
};

// Badge Images
const badgeImages = {
  [BadgeType.BRONZE]: require('../../assets/images/bronze-medal.png'),
  [BadgeType.SILVER]: require('../../assets/images/silver-medal.png'),
  [BadgeType.GOLD]: require('../../assets/images/gold-medal.png'),
  [BadgeType.DIAMOND]: require('../../assets/images/diamond.png'),
};

// RatingBadge Component
const RatingBadge = ({ 
  type, 
  current, 
  required, 
  size = 'small' 
}: {
  type: string;
  current: number;
  required: number;
  size?: 'small' | 'large';
}) => {
  // For small badges, display in the format "current/required"
  if (size === 'small') {
    return (
      <View style={styles.smallBadgeWrapper}>
        <View style={styles.smallBadge}>
          {type !== BadgeType.NONE ? (
            <Image 
              source={badgeImages[type]} 
              style={styles.badgeImage} 
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.badgeIcon}>⭐</Text>
          )}
        </View>
        <Text style={styles.badgeProgressText}>{current}/{required}</Text>
      </View>
    );
  }
  
  // For large badge (main display)
  return (
    <View style={styles.largeBadge}>
      {type !== BadgeType.NONE ? (
        <Image 
          source={badgeImages[type]} 
          style={styles.largeBadgeImage} 
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.largeIcon}>⭐</Text>
      )}
    </View>
  );
};

// BadgeDisplay Component
const BadgeDisplay = ({ totalRatings }: { totalRatings: number }) => {
  // Define badge thresholds
  const badges = [
    { type: BadgeType.BRONZE, required: 30 },
    { type: BadgeType.SILVER, required: 100 },
    { type: BadgeType.GOLD, required: 150 },
    { type: BadgeType.DIAMOND, required: 300 }
  ];
  
  // Determine the highest badge earned
  let highestBadge = BadgeType.NONE;
  
  for (const badge of badges) {
    if (totalRatings >= badge.required) {
      highestBadge = badge.type;
    } else {
      break;
    }
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.yourRatingsText}>Your Ratings {totalRatings}</Text>
      
      {/* Main Badge Display */}
      <View style={styles.mainBadgeContainer}>
        <View style={styles.mainBadgeCircle}>
          {highestBadge !== BadgeType.NONE ? (
            <RatingBadge 
              type={highestBadge} 
              current={totalRatings} 
              required={0} 
              size="large" 
            />
          ) : (
            <View style={styles.emptyBadge}>
              <Text style={styles.emptyBadgeText}>⭐</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Badge Progress Display */}
      <View style={styles.badgeProgressContainer}>
        {badges.map((badge, index) => (
          <RatingBadge 
            key={index}
            type={badge.type}
            current={Math.min(totalRatings, badge.required)}
            required={badge.required}
            size="small"
          />
        ))}
      </View>
    </View>
  );
};

// LogoutModal Component
const LogoutModal = ({ 
  visible, 
  onClose, 
  onLogout 
}: {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Log Out</Text>
          <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.logoutButtonModal]} 
              onPress={onLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ProfileHeader Component
const ProfileHeader = ({ 
  name, 
  totalRatings, 
  onLogout 
}: {
  name: string;
  totalRatings: number;
  onLogout: () => void;
}) => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(false);
    onLogout();
  };

  return (
    <SafeAreaView style={styles.headerContainer}>
      {/* Add LinearGradient to match the index page */}
      <LinearGradient
        colors={["#3b82f6", "#8b5cf6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          {/* Empty space on the left to help with centering */}
          <View style={styles.spacer}></View>
          
          {/* Centered content */}
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="headset" size={48} color="white" />
            </View>
            <Text style={styles.nameText}>{name}</Text>
          </View>
          
          {/* Logout button on the right */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => setLogoutModalVisible(true)}
          >
            <View style={styles.logoutIconContainer}>
              <Ionicons name="exit-outline" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Logout Modal */}
      <LogoutModal 
        visible={logoutModalVisible} 
        onClose={() => setLogoutModalVisible(false)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

// RatingSummary Component
const RatingSummary = ({ 
  totalRatings, 
  announcerRatings, 
  programRatings 
}: {
  totalRatings: number;
  announcerRatings: number;
  programRatings: number;
}) => {
  return (
    <View style={styles.summaryContainer}>
      <LinearGradient
        colors={['#6A11CB', '#8E2DE2']}
        style={styles.card}
      >
        <Text style={styles.label}>TOTAL{'\n'}RATINGS</Text>
        <Text style={styles.value}>{totalRatings}</Text>
      </LinearGradient>
      
      <LinearGradient
        colors={['#8E2DE2', '#A56AE3']}
        style={styles.card}
      >
        <Text style={styles.label}>ANNOUNCER{'\n'}RATINGS</Text>
        <Text style={styles.value}>{announcerRatings}</Text>
      </LinearGradient>
      
      <LinearGradient
        colors={['#A56AE3', '#BB9AFF']}
        style={styles.card}
      >
        <Text style={styles.label}>PROGRAM{'\n'}RATINGS</Text>
        <Text style={styles.value}>{programRatings}</Text>
      </LinearGradient>
    </View>
  );
};

// Interface for the user profile data
interface UserProfile {
  name: string;
  totalRatings: number;
  announcerRatings: number;
  programRatings: number;
}

// ProfileScreen Component
function ProfileScreen() {
  // Only get the logout function once to avoid redeclaration
  const { logout } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    totalRatings: 35,
    announcerRatings: 24,
    programRatings: 11
  });

  // Fetch user data from SecureStore where the login response is saved
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await SecureStore.getItemAsync('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          // Use the real name from userData
          if (parsedData.name) {
            setUserProfile(prev => ({
              ...prev,
              name: parsedData.name
            }));
          }
        } else {
          // Try to read from login response directly if available
          const loginData = await SecureStore.getItemAsync('loginResponse');
          if (loginData) {
            const parsedLoginData = JSON.parse(loginData);
            if (parsedLoginData.name) {
              setUserProfile(prev => ({
                ...prev,
                name: parsedLoginData.name
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View style={styles.containerMain}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header with user name and logout button */}
        <ProfileHeader 
          name={userProfile.name} 
          totalRatings={userProfile.totalRatings}
          onLogout={handleLogout}
        />
        
        {/* Badge Display Section */}
        <View style={styles.contentContainer}>
          <BadgeDisplay totalRatings={userProfile.totalRatings} />
          
          {/* Rating Summary Cards */}
          <RatingSummary
            totalRatings={userProfile.totalRatings}
            announcerRatings={userProfile.announcerRatings}
            programRatings={userProfile.programRatings}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Main Component Export
const Profile = () => {
  return (
    <SafeAreaProvider>
      <ProfileScreen />
    </SafeAreaProvider>
  );
};

export default Profile;

// Styles
const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 0, // Removed top padding so header can overlap
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 15,
    marginTop: -40, // Increased overlap with the header (from -25 to -40)
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 20,
  },
  yourRatingsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  headerContainer: {
    height: windowHeight / 3, // Makes header one-third of screen height
  },
  // Add gradient container
  headerGradient: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 40, // Increased for better positioning with taller header
    width: '100%',
  },
  spacer: {
    width: 40, // Same width as the logout button for balance
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 20, // Added to better center in the larger header
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  nameText: {
    color: 'white',
    fontSize: 24, // Increased from 20 to 24 (20% larger)
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  logoutButtonModal: {
    backgroundColor: '#3b82f6', // Updated to match the gradient color
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
  },
  ratingsContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  ratingsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  mainBadgeContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  mainBadgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadgeText: {
    fontSize: 32,
    color: '#FFD700',
  },
  badgeProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 5,
  },
  smallBadgeWrapper: {
    alignItems: 'center',
    width: windowWidth / 5,
  },
  smallBadge: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeImage: {
    width: 38,
    height: 38,
  },
  largeBadgeImage: {
    width: 75,
    height: 75,
  },
  badgeProgressText: {
    fontSize: 12,
    color: '#666',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  largeBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeIcon: {
    fontSize: 38,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 15,
  },
  card: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  value: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});