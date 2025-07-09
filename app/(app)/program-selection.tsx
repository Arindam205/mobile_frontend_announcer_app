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
  TouchableWithoutFeedback,
  Keyboard,
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

// Define the paginated response interface
interface PaginatedResponse {
  content: Program[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

const ITEMS_PER_PAGE = 10; // Default size for pagination
const DEBOUNCE_DELAY = 500; // 500ms debounce delay

// Create a separate SearchBar component to maintain its own state
const SearchBar = ({ 
  onSearch, 
  initialValue = '',
  onClear,
  isSearching,
  currentQuery
}: { 
  onSearch: (query: string) => void,
  initialValue?: string,
  onClear: () => void,
  isSearching: boolean,
  currentQuery: string
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
          style={[styles.searchInput, styles.inputFlex]}
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
            style={styles.clearButton}
            activeOpacity={0.7}
            onPress={clearSearch}
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
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  
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
        // Just use router.back() instead of router.replace
        // This preserves the navigation history
        router.replace('/(app)/rating-selection');
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [router])
  );

  // Log params when the component focuses
  useFocusEffect(
    useCallback(() => {
      console.log("[ProgramSelection] Screen focused with params:", { 
        languageId, 
        languageName, 
        selectedChannel: selectedChannel?.channelId
      });
    }, [languageId, languageName, selectedChannel])
  );

  // Make sure we have the required data
  useEffect(() => {
    if (!selectedChannel || !languageId) {
      console.error('Missing required data', { selectedChannel, languageId });
      
      // Instead of immediate navigate, display error and then navigate
      setApiError('Missing required channel or language information. Redirecting to home...');
      
      // Give user a moment to see the error before redirecting
      setTimeout(() => {
        router.replace('/(app)/rating-selection');
      }, 1500);
    }
  }, [selectedChannel, languageId, router]);

  // Removed the useEffect that was setting displayedPrograms based on filteredPrograms
  // We're now handling it directly in the fetchPrograms and handleSearch functions

  // Handle search from the SearchBar component
  const handleSearch = useCallback((query: string) => {
    setIsSearching(true);
    setCurrentSearchQuery(query);
    
    // Reset pagination state for new searches
    setCurrentPage(0);
    setHasMorePages(true);
    
    // If search is empty, restore original list
    if (query.trim() === '') {
      // Reset all programs and fetch first page again
      setAllPrograms([]);
      setFilteredPrograms([]);
      setDisplayedPrograms([]);
      fetchPrograms(0);
      setIsSearching(false);
      return;
    }
    
    // For non-empty search, filter the programs locally
    // Note: If you want server-side search, you would need to modify the API endpoint
    // to accept a search parameter
    const filtered = allPrograms.filter(program => 
      program.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredPrograms(filtered);
    setDisplayedPrograms(filtered);
    setIsSearching(false);
  }, [allPrograms]);

  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setCurrentSearchQuery('');
    setCurrentPage(0);
    setHasMorePages(true);
    
    // Reset programs and fetch first page again
    setAllPrograms([]);
    setFilteredPrograms([]);
    fetchPrograms(0);
    setIsSearching(false);
  }, []);

  // Function to fetch programs with pagination
  // Replace the fetchPrograms function in app/(app)/program-selection.tsx

const fetchPrograms = async (page: number = 0, refresh: boolean = false) => {
  try {
    if (!refresh && !isRefreshing && page === 0) {
      setIsLoading(true);
    }
    
    if (page > 0) {
      setIsLoadingMore(true);
    }
    
    setApiError(null);
    
    if (!selectedChannel?.channelId || !languageId) {
      console.error('Missing required parameters for API call', { 
        channelId: selectedChannel?.channelId, 
        languageId 
      });
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
      return;
    }
    
    console.log(`[ProgramSelection] Fetching programs page ${page}`);
    
    const response = await api.get<PaginatedResponse>(`/api/programs/by-channel-language`, {
      params: {
        channelId: selectedChannel.channelId,
        languageId: languageId,
        page: page,
        size: ITEMS_PER_PAGE
      }
    });
    
    console.log('[ProgramSelection] Programs response status:', response.status);
    console.log('[ProgramSelection] Programs response data:', response.data);
    
    if (response.status >= 200 && response.status < 300) {
      // Successful response
      const paginatedResponse = response.data;
      const newPrograms = paginatedResponse.content;
      
      // Update pagination state
      setTotalPages(paginatedResponse.totalPages);
      setCurrentPage(paginatedResponse.pageable.pageNumber);
      setHasMorePages(!paginatedResponse.last);
      
      // Handle program data
      if (refresh || page === 0) {
        setAllPrograms(newPrograms);
        setFilteredPrograms(newPrograms);
        setDisplayedPrograms(newPrograms);
      } else {
        setAllPrograms(prev => [...prev, ...newPrograms]);
        
        if (currentSearchQuery.trim() !== '') {
          const filteredNewPrograms = newPrograms.filter(program => 
            program.name.toLowerCase().includes(currentSearchQuery.toLowerCase())
          );
          setFilteredPrograms(prev => [...prev, ...filteredNewPrograms]);
          setDisplayedPrograms(prev => [...prev, ...filteredNewPrograms]);
        } else {
          setFilteredPrograms(prev => [...prev, ...newPrograms]);
          setDisplayedPrograms(prev => [...prev, ...newPrograms]);
        }
      }
      
      // Start entrance animations only for first load
      if (page === 0) {
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
      }
    } else if (response.status >= 400 && response.status < 500) {
      // Client error - handle gracefully
      const errorMessage = (response.data as any)?.message || 'Failed to load programs';
      console.log(`[ProgramSelection] API returned ${response.status}: ${errorMessage}`);
      setApiError(errorMessage);
      
      if (page === 0) {
        setAllPrograms([]);
        setFilteredPrograms([]);
        setDisplayedPrograms([]);
      }
    } else {
      // Unexpected status
      setApiError(`Unexpected server response: ${response.status}`);
      if (page === 0) {
        setAllPrograms([]);
        setFilteredPrograms([]);
        setDisplayedPrograms([]);
      }
    }
  } catch (error: any) {
    // Only server errors (500+) and network errors reach here
    console.error('[ProgramSelection] Server/Network error fetching programs:', error);
    setApiError('Failed to load programs. Please try again.');
    
    if (page === 0) {
      setAllPrograms([]);
      setFilteredPrograms([]);
      setDisplayedPrograms([]);
    }
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
    setIsLoadingMore(false);
  }
};
  
  // Load programs data when component mounts
  useEffect(() => {
    if (selectedChannel?.channelId && languageId) {
      fetchPrograms(0, false);
    }
  }, [selectedChannel, languageId]);
  
  // Handle pull-to-refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Reset pagination state
    setCurrentPage(0);
    setHasMorePages(true);
    fetchPrograms(0, true);
  };

  // Handle loading more items
  const handleLoadMore = () => {
    // Don't load more if already loading or no more pages
    if (isLoadingMore || !hasMorePages) {
      return;
    }
    
    // Calculate next page
    const nextPage = currentPage + 1;
    console.log(`[ProgramSelection] Loading more items, next page: ${nextPage}`);
    
    // Fetch next page of results
    fetchPrograms(nextPage);
  };

  // Handle program selection - Redirect to rate-program
  const handleProgramSelect = (program: Program) => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    // Navigate directly to rate-program page with the necessary parameters
    router.replace({
      pathname: '/(app)/rate-program',
      params: {
        programId: program.id.toString(),
        programName: program.name,
        languageId,
        languageName
      }
    });
  };

  // Dismiss keyboard when tapping outside searchbar and program list
  const dismissKeyboard = () => {
    Keyboard.dismiss();
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
      hasSearch={currentSearchQuery.length > 0}
      searchQuery={currentSearchQuery}
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
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                  currentQuery={currentSearchQuery}
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
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  removeClippedSubviews={Platform.OS === 'android'}
                />
              </Animated.View>
            )}
            
            {/* API Error display */}
            {apiError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{apiError}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => fetchPrograms(0, true)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
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
  inputFlex: {
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
    fontSize: 28,
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
    paddingTop: 0,
  },
  searchContainer: {
    paddingTop: 20,
    paddingBottom: 8,
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