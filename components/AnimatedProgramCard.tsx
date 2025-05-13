import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Music, Clock, Calendar } from 'lucide-react-native';

interface Program {
  id: number;
  name: string;
  description: string;
  duration: string;
  schedule: string;
  image?: string;
}

interface AnimatedProgramCardProps {
  program: Program;
  onSelect: (program: Program) => void;
}

const AnimatedProgramCard: React.FC<AnimatedProgramCardProps> = ({
  program,
  onSelect,
}) => {
  // Animation values - only use scale with native driver
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onSelect(program)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          {program.image ? (
            <Image source={{ uri: program.image }} style={styles.image} />
          ) : (
            <View style={styles.fallbackImage}>
              <Music size={30} color="#8b5cf6" />
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>{program.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{program.description}</Text>
          
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Clock size={14} color="#6b7280" />
              <Text style={styles.metadataText}>{program.duration}</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Calendar size={14} color="#6b7280" />
              <Text style={styles.metadataText} numberOfLines={1}>{program.schedule}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  touchable: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageContainer: {
    width: 100,
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    flex: 1,
  },
  metadataContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default AnimatedProgramCard;