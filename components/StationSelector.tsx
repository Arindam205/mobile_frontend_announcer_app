// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Modal,
//   Keyboard,
//   Animated,
// } from 'react-native';
// import { Search, X, MapPin } from 'lucide-react-native';
// import { api } from '../src/api/config';

// interface Station {
//   stationId: string;
//   stationName: string;
// }

// interface StationSelectorProps {
//   onStationSelect: (station: Station) => void;
//   selectedStation: Station | null;
//   error?: string;
// }

// const DEBOUNCE_DELAY = 300; // ms to wait between keystrokes before searching

// const StationSelector: React.FC<StationSelectorProps> = ({
//   onStationSelect,
//   selectedStation,
//   error,
// }) => {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [stations, setStations] = useState<Station[]>([]);
//   const [filteredStations, setFilteredStations] = useState<Station[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState<string | null>(null);
  
//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const translateY = useRef(new Animated.Value(50)).current;
  
//   // For debouncing search
//   const searchTimeout = useRef<NodeJS.Timeout | null>(null);

//   // Fetch stations when modal opens
//   useEffect(() => {
//     if (isModalVisible) {
//       fetchStations();
      
//       // Animate modal content
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(translateY, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       // Reset search and animations when modal closes
//       setSearchQuery('');
//       fadeAnim.setValue(0);
//       translateY.setValue(50);
//     }
//   }, [isModalVisible]);

//   // Update filtered stations when search query changes
//   useEffect(() => {
//     // Clear any existing timeout
//     if (searchTimeout.current) {
//       clearTimeout(searchTimeout.current);
//     }
    
//     // Set a new timeout for debouncing
//     searchTimeout.current = setTimeout(() => {
//       if (searchQuery.trim() === '') {
//         setFilteredStations(stations);
//         return;
//       }
      
//       // If we have the station list already, filter locally
//       if (stations.length > 0 && searchQuery.length <= 2) {
//         const filtered = stations.filter(station =>
//           station.stationName.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//         setFilteredStations(filtered);
//       } else {
//         // For longer queries, use the API for better filtering
//         fetchStations(searchQuery);
//       }
//     }, DEBOUNCE_DELAY);
    
//     return () => {
//       if (searchTimeout.current) {
//         clearTimeout(searchTimeout.current);
//       }
//     };
//   }, [searchQuery, stations]);

//   const fetchStations = async (query: string = '') => {
//     try {
//       setIsLoading(true);
//       setApiError(null);
      
//       const response = await api.get('/api/stations/list', {
//         params: { q: query }
//       });
      
//       if (response.data && Array.isArray(response.data)) {
//         setStations(response.data);
//         setFilteredStations(response.data);
//       } else {
//         setApiError('Invalid response from server');
//         setStations([]);
//         setFilteredStations([]);
//       }
//     } catch (error) {
//       console.error('Error fetching stations:', error);
//       setApiError('Failed to load stations. Please try again.');
//       setStations([]);
//       setFilteredStations([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStationSelect = (station: Station) => {
//     onStationSelect(station);
//     setIsModalVisible(false);
//   };

//   const handleOpenModal = () => {
//     Keyboard.dismiss();
//     setIsModalVisible(true);
//   };

//   const clearSearch = () => {
//     setSearchQuery('');
//     setFilteredStations(stations);
//   };

//   const renderStationItem = ({ item }: { item: Station }) => (
//     <TouchableOpacity
//       style={styles.stationItem}
//       onPress={() => handleStationSelect(item)}
//       activeOpacity={0.7}
//     >
//       <MapPin size={16} color="#6366f1" style={styles.stationIcon} />
//       <Text style={styles.stationName}>{item.stationName}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[
//           styles.selector,
//           selectedStation ? styles.selectorWithValue : null,
//           error ? styles.selectorError : null,
//         ]}
//         onPress={handleOpenModal}
//         activeOpacity={0.8}
//       >
//         {selectedStation ? (
//           <Text style={styles.selectorText}>{selectedStation.stationName}</Text>
//         ) : (
//           <Text style={styles.selectorPlaceholder}>Select Station</Text>
//         )}
//         <MapPin size={20} color={selectedStation ? "#6366f1" : "#94a3b8"} />
//       </TouchableOpacity>
      
//       {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
//       <Modal
//         visible={isModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setIsModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Station</Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setIsModalVisible(false)}
//               >
//                 <X size={24} color="#64748b" />
//               </TouchableOpacity>
//             </View>
            
//             <View style={styles.searchContainer}>
//               <View style={styles.searchInputWrapper}>
//                 <Search size={20} color="#94a3b8" style={styles.searchIcon} />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Search stations..."
//                   value={searchQuery}
//                   onChangeText={setSearchQuery}
//                   autoFocus={true}
//                   placeholderTextColor="#94a3b8"
//                 />
//                 {searchQuery.length > 0 && (
//                   <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
//                     <X size={18} color="#94a3b8" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
            
//             <Animated.View
//               style={[
//                 styles.stationListContainer,
//                 {
//                   opacity: fadeAnim,
//                   transform: [{ translateY: translateY }]
//                 }
//               ]}
//             >
//               {isLoading ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="large" color="#6366f1" />
//                   <Text style={styles.loadingText}>Loading stations...</Text>
//                 </View>
//               ) : apiError ? (
//                 <View style={styles.errorContainer}>
//                   <Text style={styles.apiErrorText}>{apiError}</Text>
//                   <TouchableOpacity
//                     style={styles.retryButton}
//                     onPress={() => fetchStations(searchQuery)}
//                   >
//                     <Text style={styles.retryButtonText}>Retry</Text>
//                   </TouchableOpacity>
//                 </View>
//               ) : filteredStations.length === 0 ? (
//                 <View style={styles.emptyContainer}>
//                   <Text style={styles.emptyText}>
//                     {searchQuery
//                       ? `No stations found matching "${searchQuery}"`
//                       : 'No stations available'}
//                   </Text>
//                 </View>
//               ) : (
//                 <FlatList
//                   data={filteredStations}
//                   renderItem={renderStationItem}
//                   keyExtractor={item => item.stationId}
//                   contentContainerStyle={styles.stationList}
//                   showsVerticalScrollIndicator={true}
//                   keyboardShouldPersistTaps="handled"
//                 />
//               )}
//             </Animated.View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     marginBottom: 20,
//   },
//   selector: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//   },
//   selectorWithValue: {
//     borderColor: '#6366f1',
//     backgroundColor: '#f8fafc',
//   },
//   selectorError: {
//     borderColor: '#DC2626',
//     backgroundColor: '#FEF2F2',
//   },
//   selectorText: {
//     fontSize: 16,
//     color: '#1e293b',
//     flex: 1,
//   },
//   selectorPlaceholder: {
//     fontSize: 16,
//     color: '#94a3b8',
//     flex: 1,
//   },
//   errorText: {
//     color: '#DC2626',
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 2,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: '80%',
//     padding: 16,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e2e8f0',
//     paddingBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#0f172a',
//     flex: 1,
//     textAlign: 'center',
//   },
//   closeButton: {
//     padding: 4,
//   },
//   searchContainer: {
//     paddingVertical: 16,
//   },
//   searchInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#f8fafc',
//     height: 46,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#0f172a',
//     height: '100%',
//   },
//   clearButton: {
//     padding: 4,
//   },
//   stationListContainer: {
//     flex: 1,
//   },
//   stationList: {
//     paddingBottom: 24,
//   },
//   stationItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f5f9',
//   },
//   stationIcon: {
//     marginRight: 12,
//   },
//   stationName: {
//     fontSize: 16,
//     color: '#334155',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#64748b',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   apiErrorText: {
//     fontSize: 16,
//     color: '#ef4444',
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   retryButton: {
//     backgroundColor: '#6366f1',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#64748b',
//     textAlign: 'center',
//   },
// });

// export default StationSelector;

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

const DEBOUNCE_DELAY = 300; // ms to wait between keystrokes before searching

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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  
  // For debouncing search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch stations when modal opens
  useEffect(() => {
    if (isModalVisible) {
      fetchStations();
      
      // Animate modal content
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
      // Reset search and animations when modal closes
      setSearchQuery('');
      fadeAnim.setValue(0);
      translateY.setValue(50);
    }
  }, [isModalVisible]);

  // Update filtered stations when search query changes
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set a new timeout for debouncing
    searchTimeout.current = setTimeout(() => {
      // Only make API calls when necessary
      if (searchQuery.trim() === '') {
        // For empty search, use the API to get all stations
        fetchStations('');
      } else {
        // For non-empty search, use the API with the query
        fetchStations(searchQuery);
      }
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
      
      // Log to debug API calls
      console.log(`Fetching stations with query: "${query}"`);
      
      const response = await api.get('/api/stations/list', {
        params: { q: query }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setStations(response.data);
        setFilteredStations(response.data);
      } else {
        setApiError('Invalid response from server');
        setStations([]);
        setFilteredStations([]);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      setApiError('Failed to load stations. Please try again.');
      setStations([]);
      setFilteredStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStationSelect = (station: Station) => {
    onStationSelect(station);
    setIsModalVisible(false);
  };

  const handleOpenModal = () => {
    Keyboard.dismiss();
    setIsModalVisible(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    // After clearing, we'll trigger a fetch for all stations through the useEffect
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
                  initialNumToRender={15}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                  removeClippedSubviews={true}
                  getItemLayout={(data, index) => (
                    {length: 56, offset: 56 * index, index}
                  )}
                />
              )}
            </Animated.View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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