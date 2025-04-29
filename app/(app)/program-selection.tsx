// app/(app)/program-selection.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  BackHandler,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useChannel } from '../../src/context/ChannelContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Search, Radio, ArrowLeft, X } from 'lucide-react-native';
import { useCallback } from 'react';
import SuccessOverlay from '../../components/SuccessOverlay';
import EmptyProgramState from '../../components/EmptyProgramState';
import AnimatedProgramCard from '../../components/AnimatedProgramCard';
import ProgramLoadingSkeleton from '../../components/ProgramLoadingSkeleton';

// Define program interface for mock data and API responses
interface Program {
  id: number;
  name: string;
  description: string;
  duration: string; 
  schedule: string; 
  image?: string;
}


// Placeholder mock data
const generateMockPrograms = (): Program[] => {
  return [
    {
      id: 1,
      name: "Morning Melodies",
      description: "Start your day with soothing classical tunes and light conversations.",
      duration: "2 hours",
      schedule: "Weekdays 7:00 AM - 9:00 AM",
      image: "https://source.unsplash.com/random/300x200/?music,morning"
    },
    {
      id: 2,
      name: "News Roundup",
      description: "Comprehensive coverage of local and international news events.",
      duration: "30 mins",
      schedule: "Daily 12:00 PM - 12:30 PM",
      image: "https://source.unsplash.com/random/300x200/?news"
    },
    {
      id: 3,
      name: "Agricultural Forum",
      description: "Expert discussions on modern farming techniques and agricultural news.",
      duration: "1 hour",
      schedule: "Mondays and Thursdays 3:00 PM - 4:00 PM",
      image: "https://source.unsplash.com/random/300x200/?agriculture"
    },
    {
      id: 4,
      name: "Youth Voice",
      description: "Platform for young voices to discuss issues relevant to the youth.",
      duration: "45 mins",
      schedule: "Weekends 5:00 PM - 5:45 PM",
      image: "https://source.unsplash.com/random/300x200/?youth"
    },
    {
      id: 5,
      name: "Cultural Heritage",
      description: "Celebrating the rich cultural heritage and traditions.",
      duration: "1 hour",
      schedule: "Fridays 7:00 PM - 8:00 PM",
      image: "https://source.unsplash.com/random/300x200/?culture"
    },
    {
      id: 6,
      name: "Science Today",
      description: "Latest developments and discoveries in the world of science.",
      duration: "45 mins",
      schedule: "Wednesdays 6:00 PM - 6:45 PM",
      image: "https://source.unsplash.com/random/300x200/?science"
    },
    {
      id: 7,
      name: "Health Matters",
      description: "Health tips, medical advice, and wellness discussions.",
      duration: "1 hour",
      schedule: "Tuesdays 10:00 AM - 11:00 AM",
      image: "https://source.unsplash.com/random/300x200/?health"
    },
    {
      id: 8,
      name: "Evening Classical",
      description: "Classical music from renowned composers.",
      duration: "2 hours",
      schedule: "Daily 8:00 PM - 10:00 PM",
      image: "https://source.unsplash.com/random/300x200/?classical,music"
    },
    {
      id: 9,
      name: "Book Club",
      description: "Discussions on popular and classic literature.",
      duration: "45 mins",
      schedule: "Saturdays 4:00 PM - 4:45 PM",
      image: "https://source.unsplash.com/random/300x200/?books"
    },
    {
      id: 10,
      name: "Sports Arena",
      description: "Coverage of local and international sports events.",
      duration: "1 hour",
      schedule: "Weekends 11:00 AM - 12:00 PM",
      image: "https://source.unsplash.com/random/300x200/?sports"
    },
    {
      id: 11,
      name: "Tech Talk",
      description: "Latest in technology and digital innovations.",
      duration: "45 mins",
      schedule: "Thursdays 7:00 PM - 7:45 PM",
      image: "https://source.unsplash.com/random/300x200/?technology"
    },
    {
      id: 12,
      name: "Artistic Expressions",
      description: "Showcasing various art forms and artists.",
      duration: "1 hour",
      schedule: "Sundays 3:00 PM - 4:00 PM",
      image: "https://source.unsplash.com/random/300x200/?art"
    },
    {
      id: 13,
      name: "Finance for Everyone",
      description: "Financial advice and economic discussions for the common person.",
      duration: "30 mins",
      schedule: "Weekdays 6:30 PM - 7:00 PM",
      image: "https://source.unsplash.com/random/300x200/?finance"
    },
    {
      id: 14,
      name: "Environmental Watch",
      description: "Discussing environmental issues and conservation efforts.",
      duration: "45 mins",
      schedule: "Wednesdays 11:00 AM - 11:45 AM",
      image: "https://source.unsplash.com/random/300x200/?environment"
    },
    {
      id: 15,
      name: "Folk Traditions",
      description: "Exploring folk music and traditions from different regions.",
      duration: "1 hour",
      schedule: "Saturdays 6:00 PM - 7:00 PM",
      image: "https://source.unsplash.com/random/300x200/?folk"
    },
    {
      id: 16,
      name: "Women's Hour",
      description: "Addressing issues relevant to women and celebrating achievements.",
      duration: "1 hour",
      schedule: "Thursdays 10:00 AM - 11:00 AM",
      image: "https://source.unsplash.com/random/300x200/?women"
    },
    {
      id: 17,
      name: "Legal Aid",
      description: "Legal advice and discussions on common legal issues.",
      duration: "45 mins",
      schedule: "Mondays 11:00 AM - 11:45 AM",
      image: "https://source.unsplash.com/random/300x200/?legal"
    },
    {
      id: 18,
      name: "Educational Insights",
      description: "Discussions on education, teaching methods, and learning.",
      duration: "1 hour",
      schedule: "Tuesdays 3:00 PM - 4:00 PM",
      image: "https://source.unsplash.com/random/300x200/?education"
    },
    {
      id: 19,
      name: "Local Heroes",
      description: "Highlighting local individuals making a difference in the community.",
      duration: "30 mins",
      schedule: "Fridays 11:00 AM - 11:30 AM",
      image: "https://source.unsplash.com/random/300x200/?community"
    },
    {
      id: 20,
      name: "Midnight Melodies",
      description: "Soothing music for late-night listeners.",
      duration: "2 hours",
      schedule: "Daily 11:00 PM - 1:00 AM",
      image: "https://source.unsplash.com/random/300x200/?night,music"
    },
    {
      id: 21,
      name: "Abhivyakti",
      description: "Platform for creative expressions through poetry and stories.",
      duration: "45 mins",
      schedule: "Sundays 5:00 PM - 5:45 PM",
      image: "https://source.unsplash.com/random/300x200/?poetry"
    },
    {
      id: 22,
      name: "Travel Diaries",
      description: "Exploring travel destinations and sharing travel experiences.",
      duration: "1 hour",
      schedule: "Saturdays 10:00 AM - 11:00 AM",
      image: "https://source.unsplash.com/random/300x200/?travel"
    }
  ];
};

const ITEMS_PER_BATCH = 10;

// Main component
const ProgramSelectionScreen = () => {
  // URL params
  const params = useLocalSearchParams();
  const router = useRouter();

  // Get channel data from context
  const { selectedChannel, stationName } = useChannel();

  // State variables
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [displayedPrograms, setDisplayedPrograms] = useState<Program[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  
  // Get language from URL params
  const languageId = params.languageId as string;
  const languageName = params.languageName as string;

  // Handle back button presses
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  // Make sure we have the required data
  useEffect(() => {
    if (!selectedChannel || !languageId) {
      console.error('Missing required data', { selectedChannel, languageId });
      router.replace('/(app)/rating-selection');
    }
  }, [selectedChannel, languageId]);

  // Load programs data
  useEffect(() => {
    // Simulate API fetch
    fetchPrograms();
  }, [selectedChannel, languageId]);

  // Initialize displayed programs with first batch
  useEffect(() => {
    if (filteredPrograms.length > 0) {
      setDisplayedPrograms(filteredPrograms.slice(0, ITEMS_PER_BATCH));
    } else {
      setDisplayedPrograms([]);
    }
  }, [filteredPrograms]);

  // Function to fetch programs
  const fetchPrograms = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      // In a real app, you would call an API like:
      // const response = await api.get(`/api/programs/${selectedChannel?.channelId}/${languageId}`);
      // setAllPrograms(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        const mockPrograms = generateMockPrograms();
        setAllPrograms(mockPrograms);
        setFilteredPrograms(mockPrograms);
        setIsLoading(false);
        setIsRefreshing(false);
        
        // Start entrance animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          })
        ]).start();
      }, 800);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle pull-to-refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSearchQuery('');
    fetchPrograms();
  };

  // Handle loading more items
  const handleLoadMore = () => {
    if (isLoadingMore || displayedPrograms.length >= filteredPrograms.length) return;
    
    setIsLoadingMore(true);
    
    // Simulate a network delay
    setTimeout(() => {
      const nextItems = filteredPrograms.slice(
        displayedPrograms.length, 
        displayedPrograms.length + ITEMS_PER_BATCH
      );
      
      setDisplayedPrograms(prevItems => [...prevItems, ...nextItems]);
      setIsLoadingMore(false);
    }, 500);
  };

  // Filter programs based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPrograms(allPrograms);
    } else {
      const filtered = allPrograms.filter(program => 
        program.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPrograms(filtered);
    }
    // Reset displayed programs to first batch whenever search query changes
    if (filteredPrograms.length > 0) {
      setDisplayedPrograms(filteredPrograms.slice(0, ITEMS_PER_BATCH));
    } else {
      setDisplayedPrograms([]);
    }
  }, [searchQuery, allPrograms]);

  // Handle program selection
  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    
    // Show success message
    setShowSuccess(true);
    
    // Navigate back after a delay (this is just a placeholder)
    // In a real implementation, you would navigate to a rating form for this program
    setTimeout(() => {
      setShowSuccess(false);
      // router.push({
      //   pathname: '/(app)/rate-program',
      //   params: {
      //     programId: program.id.toString(),
      //     programName: program.name,
      //     languageId,
      //     languageName
      //   }
      // });
    }, 2000);
  };

  // Navigate back to rating selection screen
  const handleGoBack = () => {
    router.replace('/(app)/rating-selection');
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Render program card
  const renderProgramItem = ({ item }: { item: Program }) => (
    <AnimatedProgramCard program={item} onSelect={handleProgramSelect} />
  );

  // Render list header with search bar
  const renderListHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search programs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <X size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.resultsCount}>
        {filteredPrograms.length === 1 
          ? '1 program found' 
          : `${filteredPrograms.length} programs found`}
      </Text>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <EmptyProgramState 
      hasSearch={searchQuery.length > 0}
      searchQuery={searchQuery}
      onClearSearch={handleClearSearch}
    />
  );

  // Render loading footer
  const renderFooterLoader = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.footerLoaderText}>Loading more programs...</Text>
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexGrow}
        >
          {/* Header */}
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
              
              <View>
                <Text style={styles.headerTitle}>Select Program</Text>
                <View style={styles.channelInfoContainer}>
                  <Radio size={16} color="#f3e8ff" style={styles.channelIcon} />
                  <Text style={styles.channelName}>{selectedChannel?.channelName}</Text>
                </View>
                
                <View style={styles.languageContainer}>
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageText}>{languageName}</Text>
                  </View>
                  
                  {stationName && (
                    <Text style={styles.stationText}>{stationName}</Text>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Program List */}
          {isLoading ? (
            <View style={styles.contentContainer}>
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search size={20} color="#6b7280" style={styles.searchIcon} />
                  <View style={styles.searchInputPlaceholder} />
                </View>
              </View>
              <ProgramLoadingSkeleton count={6} />
            </View>
          ) : (
            <Animated.View 
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: translateY }]
                }
              ]}
            >
              <FlatList
                data={displayedPrograms}
                renderItem={renderProgramItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={isLoadingMore ? renderFooterLoader : null}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
              />
            </Animated.View>
          )}
          
          {/* Success Overlay */}
          <SuccessOverlay
            visible={showSuccess}
            message={`Selected "${selectedProgram?.name}"`}
            subMessage="Ready to rate this program"
            type="program"
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  flexGrow: {
    flex: 1,
  },
  header: {
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 10,
  },
  channelInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelIcon: {
    marginRight: 6,
  },
  channelName: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  languageBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  languageText: {
    color: '#f3e8ff',
    fontSize: 12,
    fontWeight: '500',
  },
  stationText: {
    color: '#fde68a',
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInputPlaceholder: {
    flex: 1,
    height: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    height: '100%',
  },
  clearButton: {
    padding: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    marginLeft: 4,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  clearSearchButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProgramSelectionScreen;