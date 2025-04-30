import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Music } from 'lucide-react-native';

interface ProgramCardProps {
  program: {
    id: number;
    name: string;
    channelName?: string;
    languageName?: string;
    stationName?: string;
  };
  onSelect: (program: any) => void;
}

// Custom Audio Wave Animation
const AudioWave = () => {
  // Create animated values for each bar
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bar3 = useRef(new Animated.Value(0.2)).current;
  const bar4 = useRef(new Animated.Value(0.7)).current;
  const bar5 = useRef(new Animated.Value(0.4)).current;
  
  React.useEffect(() => {
    // Function to create looping animation
    const createAnimation = (value: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: Math.random() * 0.7 + 0.3,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: Math.random() * 0.4 + 0.2,
            duration: duration - 100,
            useNativeDriver: true,
          }),
        ])
      );
    };
    
    // Start animations with different durations
    const anim1 = createAnimation(bar1, 800);
    const anim2 = createAnimation(bar2, 700);
    const anim3 = createAnimation(bar3, 900);
    const anim4 = createAnimation(bar4, 650);
    const anim5 = createAnimation(bar5, 850);
    
    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();
    anim5.start();
    
    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
      anim5.stop();
    };
  }, []);
  
  return (
    <View style={styles.waveContainer}>
      <Animated.View 
        style={[
          styles.bar, 
          { transform: [{ scaleY: bar1 }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bar, 
          { transform: [{ scaleY: bar2 }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bar, 
          { transform: [{ scaleY: bar3 }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bar, 
          { transform: [{ scaleY: bar4 }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.bar, 
          { transform: [{ scaleY: bar5 }] }
        ]} 
      />
    </View>
  );
};

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSelect }) => {
  // Animation for card press effect
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
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onSelect(program)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        {/* Left Content */}
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <View style={styles.iconBadge}>
              <Music size={18} color="#fff" />
            </View>
            <Text style={styles.programName} numberOfLines={1}>
              {program.name}
            </Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.channelText} numberOfLines={1}>
              {program.channelName}
            </Text>
            <View style={styles.dot} />
            <Text style={styles.languageText} numberOfLines={1}>
              {program.languageName}
            </Text>
          </View>
        </View>
        
        {/* Audio Wave Animation */}
        <View style={styles.audioWaveContainer}>
          <AudioWave />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f5',
  },
  touchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 44, // Aligns with text after icon
  },
  channelText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  audioWaveContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
  },
  bar: {
    width: 3,
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
});

export default ProgramCard;