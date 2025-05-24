import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Keyboard,
  Animated,
} from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { api } from '../src/api/config';

interface Station {
  stationId: string;
  stationName: string;
}

interface StationSelectorProps {
  onStationSelect: (station: Station) => void;
  selectedStation: Station | null;
  error?: string;
}

const DEBOUNCE_DELAY = 300;

const StationSelector: React.FC<StationSelectorProps> = ({
  onStationSelect,
  selectedStation,
  error,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isModalVisible) {
      fetchStations();
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setSearchQuery('');
      fadeAnim.setValue(0);
      translateY.setValue(50);
    }
  }, [isModalVisible]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      fetchStations(searchQuery);
    }, DEBOUNCE_DELAY);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const fetchStations = async (query: string = '') => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      console.log(`[StationSelector] Fetching stations with query: "${query}"`);
      
      // Make API call - 400s won't throw errors with our new config
      const response = await api.get('/api/stations/list', {
        params: query ? { q: query } : {}
      });
      
      console.log(`[StationSelector] Response status: ${response.status}`);
      console.log(`[StationSelector] Response data:`, response.data);
      
      // Handle response based on status code
      if (response.status >= 200 && response.status < 300) {
        // Successful response
        const responseData = response.data;
        
        if (Array.isArray(responseData)) {
          console.log(`[StationSelector] Successfully loaded ${responseData.length} stations`);
          setStations(responseData);
          setFilteredStations(responseData);
        } else if (responseData && typeof responseData === 'object') {
          // Handle nested response structures
          const nestedStations = responseData.stations || responseData.data || responseData.list || [];
          if (Array.isArray(nestedStations)) {
            console.log(`[StationSelector] Found stations in nested object: ${nestedStations.length}`);
            setStations(nestedStations);
            setFilteredStations(nestedStations);
          } else {
            console.error('[StationSelector] Unexpected response structure:', responseData);
            setApiError('Unexpected server response format');
            setStations([]);
            setFilteredStations([]);
          }
        } else {
          console.error('[StationSelector] Invalid response data type:', typeof responseData);
          setApiError('Invalid response from server');
          setStations([]);
          setFilteredStations([]);
        }
        
      } else if (response.status >= 400 && response.status < 500) {
        // Client errors (4xx) - handle gracefully
        const errorMessage = response.data?.message || response.data?.error || `Request failed (${response.status})`;
        console.log(`[StationSelector] API returned ${response.status}: ${errorMessage}`);
        setApiError(errorMessage);
        setStations([]);
        setFilteredStations([]);
        
      } else {
        // Unexpected status code
        console.error(`[StationSelector] Unexpected status: ${response.status}`);
        setApiError(`Unexpected server response: ${response.status}`);
        setStations([]);
        setFilteredStations([]);
      }
      
    } catch (error: any) {
      // Only server errors (500+) and network errors reach here
      console.error('[StationSelector] Server/Network error:', error);
      
      let errorMessage = 'Failed to load stations';
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = error.message || 'Server error occurred';
      }
      
      setApiError(errorMessage);
      setStations([]);
      setFilteredStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationSelect = (station: Station) => {
    console.log('[StationSelector] Station selected:', station);
    onStationSelect(station);
    setIsModalVisible(false);
  };

  const handleOpenModal = () => {
    Keyboard.dismiss();
    setIsModalVisible(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderStationItem = ({ item }: { item: Station }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => handleStationSelect(item)}
      activeOpacity={0.7}
    >
      <MapPin size={16} color="#6366f1" style={styles.stationIcon} />
      <Text style={styles.stationName}>{item.stationName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selector,
          selectedStation ? styles.selectorWithValue : null,
          error ? styles.selectorError : null,
        ]}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        {selectedStation ? (
          <Text style={styles.selectorText}>{selectedStation.stationName}</Text>
        ) : (
          <Text style={styles.selectorPlaceholder}>Select Station</Text>
        )}
        <MapPin size={20} color={selectedStation ? "#6366f1" : "#94a3b8"} />
      </TouchableOpacity>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Station</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Search size={20} color="#94a3b8" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search stations..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                  placeholderTextColor="#94a3b8"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <X size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <Animated.View
              style={[
                styles.stationListContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: translateY }]
                }
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text style={styles.loadingText}>Loading stations...</Text>
                </View>
              ) : apiError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.apiErrorText}>{apiError}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => fetchStations(searchQuery)}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredStations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? `No stations found matching "${searchQuery}"`
                      : 'No stations available'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredStations}
                  renderItem={renderStationItem}
                  keyExtractor={item => item.stationId}
                  contentContainerStyle={styles.stationList}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles remain the same as your original
const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  selector: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  selectorWithValue: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  selectorError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  selectorText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
    flex: 1,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingVertical: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  stationListContainer: {
    flex: 1,
  },
  stationList: {
    paddingBottom: 24,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stationIcon: {
    marginRight: 12,
  },
  stationName: {
    fontSize: 16,
    color: '#334155',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  apiErrorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default StationSelector;