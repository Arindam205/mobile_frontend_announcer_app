import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Animated,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radio, ChevronRight } from 'lucide-react-native';
import { api } from '../../src/api/config';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useChannel } from '../../src/context/ChannelContext';

// Define interfaces
interface Channel {
  channelId: number;
  channelName: string;
  frequencyDetails: string;
  description: string;
}

interface StationResponse {
  stationId: string;
  stationName: string;
  channels: Channel[];
}

// Waveform component
const WaveformAnimation = () => {
  // Create animated values for each bar
  const animations = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.5)).current,
    useRef(new Animated.Value(0.7)).current,
    useRef(new Animated.Value(0.4)).current,
    useRef(new Animated.Value(0.6)).current,
  ];

  // Animation sequence for each bar
  useEffect(() => {
    const createAnimation = (value : Animated.Value) => {
      return Animated.sequence([
        Animated.timing(value, {
          toValue: Math.random() * 0.7 + 0.3, // Random height between 0.3 and 1.0
          duration: 700 + Math.random() * 500, // Random duration
          useNativeDriver: false,
        }),
        Animated.timing(value, {
          toValue: Math.random() * 0.5 + 0.2, // Random height between 0.2 and 0.7
          duration: 700 + Math.random() * 500, // Random duration
          useNativeDriver: false,
        })
      ]);
    };

    // Start animations
    const startAnimations = () => {
      const animationSequence = animations.map(anim => createAnimation(anim));
      Animated.parallel(animationSequence).start(() => startAnimations());
    };

    startAnimations();

    return () => {
      animations.forEach(anim => anim.stopAnimation());
    };
  }, []);

  return (
    <View style={styles.waveformContainer}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }
          ]}
        />
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const [stationData, setStationData] = useState<StationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { setSelectedChannelData } = useChannel();

  // Add back button handler to exit app
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // Exit the app when back button is pressed on home screen
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        }
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/stations/my-channels');
      setStationData(response.data);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError('Failed to load channels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChannelSelect = (channel: Channel, stationName: string) => {
    // Set selected channel data in context
    setSelectedChannelData(channel, stationName);
    
    // Navigate to rating selection screen
    router.push('/(app)/rating-selection');
  };

  const renderChannelCard = (channel: Channel, index: number) => {
    // Define gradient colors based on index
    const gradients : [string, string][] = [
      ['#2563eb', '#1d4ed8'],
      ['#0ea5e9', '#0369a1'],
      ['#3b82f6', '#2563eb'],
      ['#0c4a6e', '#082f49']
    ];
    const gradientColors = gradients[index % gradients.length];

    return (
      <TouchableOpacity 
        key={channel.channelId}
        onPress={() => handleChannelSelect(channel, stationData?.stationName || '')}
        style={styles.channelCard}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.channelContent}>
            <View style={styles.channelInfo}>
              <Radio size={24} color="rgba(255,255,255,0.8)" />
              <Text style={styles.channelName}>{channel.channelName}</Text>
            </View>
            <Text style={styles.channelFrequency}>{channel.frequencyDetails}</Text>
            {stationData?.stationName && (
              <View style={styles.stationBadge}>
                <Text style={styles.stationName}>{stationData.stationName}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionContainer}>
            <WaveformAnimation />
            <ChevronRight size={24} color="white" style={styles.chevronIcon} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading channels...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={fetchChannels} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Rate Announcer and Program</Text>
        <Text style={styles.subheading}>Select a channel to rate</Text>

        {stationData?.channels.length ? (
          <View style={styles.channelsContainer}>
            {stationData.channels.map((channel, index) => 
              renderChannelCard(channel, index)
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No channels available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollContent: {
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  channelsContainer: {
    gap: 16,
  },
  channelCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    height: 120,
  },
  channelContent: {
    flex: 1,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  channelFrequency: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 36,
    marginTop: 4,
  },
  stationBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  stationName: {
    fontSize: 13,
    color: 'white',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  waveformContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  waveformBar: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 1.5,
    borderRadius: 2,
  },
  chevronIcon: {
    marginLeft: 5,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#6b7280',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'red',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
  },
});