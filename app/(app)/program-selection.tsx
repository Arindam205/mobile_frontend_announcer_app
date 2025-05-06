import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Search, X } from 'lucide-react-native';
import EmptyProgramState from '../../components/EmptyProgramState';
import ProgramLoadingSkeleton from '../../components/ProgramLoadingSkeleton';
import MicAnimation from '../../components/MicAnimation';
import { api } from '../../src/api/config';
import ProgramCard from '../../components/ProgramCard';

// Define program interface for API response
interface Program {
  id: number;
  name: string;
  languageId: number;
  languageName: string;
  stationId: string;
  stationName: string;
  channelId: number;
  channelName: string;
  category: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

const ITEMS_PER_BATCH = 10;
const DEBOUNCE_DELAY = 500; // 500ms debounce delay

// Create a separate SearchBar component to maintain its own state
// This is crucial to prevent keyboard dismissal issues
const SearchBar = ({ 
  onSearch, 
  initialValue = '',
  onClear,
  isSearching
}: { 
  onSearch: (query: string) => void,
  initialValue?: string,
  onClear: () => void,
  isSearching: boolean
}) => {
  const [searchText, setSearchText] = useState(initialValue);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  // Debounced search with its own internal state
  const handleTextChange = (text: string) => {
    setSearchText(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If empty, immediately notify parent
    if (text.trim() === '') {
      onSearch('');
      return;
    }
    
    // Otherwise debounce
    searchTimeoutRef.current = setTimeout(() => {
      onSearch(text);
    }, DEBOUNCE_DELAY);
  };
  
  // Clear search within the component
  const clearSearch = () => {
    setSearchText('');
    onClear();
    
    // Maintain focus when clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search programs..."
          value={searchText}
          onChangeText={handleTextChange}
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          autoCapitalize="none"
          // Essential props to prevent keyboard dismissal
          keyboardType="default"
          blurOnSubmit={false}
          autoCorrect={false}
          spellCheck={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity 
            onPress={clearSearch}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <X size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.resultsCountContainer}>
        <Text style={styles.resultsCount}>
          {isSearching ? 'Searching...' : ''}
        </Text>
        
        {isSearching && (
          <ActivityIndicator 
            size="small" 
            color="#6366f1" 
            style={styles.searchingIndicator} 
          />
        )}
      </View>
    </View>
  );
};

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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
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
        router.replace('/(app)/rating-selection');
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [router])
  );

  // Make sure we have the required data
  useEffect(() => {
    if (!selectedChannel || !languageId) {
      console.error('Missing required data', { selectedChannel, languageId });
      router.replace('/(app)/rating-selection');
    }
  }, [selectedChannel, languageId, router]);

  // Initialize displayed programs with first batch when filtered programs change
  useEffect(() => {
    if (filteredPrograms.length > 0) {
      setDisplayedPrograms(filteredPrograms.slice(0, ITEMS_PER_BATCH));
    } else {
      setDisplayedPrograms([]);
    }
  }, [filteredPrograms]);

  // Handle search from the SearchBar component
  const handleSearch = useCallback((query: string) => {
    setIsSearching(true);
    
    // If search is empty, restore original list
    if (query.trim() === '') {
      setFilteredPrograms(allPrograms);
      setIsSearching(false);
      return;
    }
    
    // Filter the programs
    const filtered = allPrograms.filter(program => 
      program.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredPrograms(filtered);
    setIsSearching(false);
  }, [allPrograms]);

  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setFilteredPrograms(allPrograms);
    setIsSearching(false);
  }, [allPrograms]);

  // Function to fetch programs
  const fetchPrograms = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      setApiError(null);
      
      // Make sure we have both channelId and languageId
      if (!selectedChannel?.channelId || !languageId) {
        console.error('Missing required parameters for API call', { 
          channelId: selectedChannel?.channelId, 
          languageId 
        });
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      // Call the API with channel and language parameters
      const response = await api.get(`/api/programs/by-channel-language`, {
        params: {
          channelId: selectedChannel.channelId,
          languageId: languageId
        }
      });
      
      // Set the programs data from API response
      setAllPrograms(response.data);
      setFilteredPrograms(response.data);
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
    } catch (error) {
      console.error('Error fetching programs:', error);
      setIsLoading(false);
      setIsRefreshing(false);
      setApiError('Failed to load programs. Please try again.');
      setAllPrograms([]);
      setFilteredPrograms([]);
    }
  };
  
  // Load programs data when component mounts
  useEffect(() => {
    fetchPrograms();
  }, [selectedChannel, languageId]);
  
  // Handle pull-to-refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPrograms();
  };

  // Handle loading more items
  const handleLoadMore = () => {
    if (isLoadingMore || displayedPrograms.length >= filteredPrograms.length) return;
    
    setIsLoadingMore(true);
    
    // Load next batch after a short delay
    setTimeout(() => {
      const nextItems = filteredPrograms.slice(
        displayedPrograms.length, 
        displayedPrograms.length + ITEMS_PER_BATCH
      );
      
      setDisplayedPrograms(prevItems => [...prevItems, ...nextItems]);
      setIsLoadingMore(false);
    }, 300);
  };

  // Handle program selection - Redirect to rate-program
  const handleProgramSelect = (program: any) => {
    // Navigate directly to rate-program page with the necessary parameters
    router.push({
      pathname: '/(app)/rate-program',
      params: {
        programId: program.id.toString(),
        programName: program.name,
        languageId,
        languageName
      }
    });
  };

  // Render program card
  const renderProgramItem = ({ item }: { item: Program }) => (
    <ProgramCard 
      program={{
        id: item.id,
        name: item.name,
        channelName: item.channelName,
        languageName: item.languageName,
        stationName: item.stationName
      }} 
      onSelect={handleProgramSelect} 
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <EmptyProgramState 
      hasSearch={isSearching}
      searchQuery={''}
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
        <View style={styles.flexGrow}>
          {/* Header */}
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Select Program</Text>
              
              <View style={styles.channelInfoContainer}>
                <View>
                  <Text style={styles.channelName}>{selectedChannel?.channelName}</Text>
                  <Text style={styles.stationNameText}>{stationName}</Text>
                  <Text style={styles.languageNameText}>{languageName}</Text>
                </View>
              </View>
              
              {/* Mic animation in the header */}
              <View style={styles.micAnimationContainer}>
                <MicAnimation size={35} color="#fff" />
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
              {/* Search bar outside FlatList */}
              <SearchBar 
                onSearch={handleSearch} 
                onClear={handleClearSearch}
                isSearching={isSearching}
              />
              
              <FlatList
                data={displayedPrograms}
                renderItem={renderProgramItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
                ListFooterComponent={isLoadingMore ? renderFooterLoader : null}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                contentInsetAdjustmentBehavior="automatic"
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                // Critical props to prevent keyboard issues
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                removeClippedSubviews={false}
              />
            </Animated.View>
          )}
          
          {/* API Error display */}
          {apiError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{apiError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => fetchPrograms()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    paddingTop: 14,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    height: 168,
  },
  headerContent: {
    flex: 1,
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
    letterSpacing: 1.2,
  },
  channelInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  channelName: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
  },
  stationNameText: {
    fontSize: 14,
    color: '#FDE68A',
    marginTop: 4,
  },
  languageNameText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  micAnimationContainer: {
    position: 'absolute',
    top: 10,
    right: 0,
    width: 100,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 5,
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
  resultsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  searchingIndicator: {
    marginLeft: 10,
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
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProgramSelectionScreen;