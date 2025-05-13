import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerLoading from './ShimmerLoading';

interface ProgramLoadingSkeletonProps {
  count?: number;
}

const ProgramLoadingSkeleton: React.FC<ProgramLoadingSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.cardContainer}>
          <ShimmerLoading
            width={100}
            height={120}
            borderRadius={0}
          />
          
          <View style={styles.contentContainer}>
            <ShimmerLoading
              width="85%"
              height={22}
              style={styles.titleSkeleton}
            />
            
            <ShimmerLoading
              width="95%"
              height={16}
              style={styles.descriptionSkeleton}
            />
            
            <ShimmerLoading
              width="90%"
              height={16}
              style={styles.descriptionSkeleton}
            />
            
            <View style={styles.metadataContainer}>
              <ShimmerLoading
                width={90}
                height={14}
                style={styles.metadataSkeleton}
              />
              
              <ShimmerLoading
                width={140}
                height={14}
                style={styles.metadataSkeleton}
              />
            </View>
          </View>
        </View>
      ))}
    </>
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
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  descriptionSkeleton: {
    marginBottom: 6,
  },
  metadataContainer: {
    marginTop: 8,
    gap: 6,
  },
  metadataSkeleton: {
    marginBottom: 4,
  },
});

export default ProgramLoadingSkeleton;