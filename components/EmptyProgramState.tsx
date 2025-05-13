import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Music, Search } from 'lucide-react-native';

interface EmptyProgramStateProps {
  hasSearch: boolean;
  searchQuery: string;
  onClearSearch: () => void;
}

const EmptyProgramState: React.FC<EmptyProgramStateProps> = ({
  hasSearch,
  searchQuery,
  onClearSearch
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin)
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin)
          })
        ])
      )
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-15deg', '15deg']
                })
              }
            ]
          }}
        >
          <Music size={64} color="#d1d5db" />
        </Animated.View>
        
        {hasSearch && (
          <View style={styles.searchIconContainer}>
            <Search size={24} color="#6b7280" />
          </View>
        )}
      </View>
      
      <Text style={styles.title}>
        {hasSearch ? 'No programs found' : 'No programs available'}
      </Text>
      
      <Text style={styles.description}>
        {hasSearch 
          ? `We couldn't find any programs matching "${searchQuery}"`
          : 'There are no programs available for this channel and language'}
      </Text>
      
      {hasSearch && (
        <TouchableOpacity 
          style={styles.button}
          onPress={onClearSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  searchIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyProgramState;