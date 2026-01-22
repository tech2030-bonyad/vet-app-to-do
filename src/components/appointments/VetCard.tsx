import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Veterinarian } from '../../types/appointment';

interface VetCardProps {
  vet: Veterinarian;
  onSelect: (vet: Veterinarian) => void;
  isSelected?: boolean;
}

export const VetCard: React.FC<VetCardProps> = ({
  vet,
  onSelect,
  isSelected = false,
}) => {
  const handlePress = () => {
    if (vet.isAvailable) {
      onSelect(vet);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        !vet.isAvailable && styles.unavailableContainer,
      ]}
      onPress={handlePress}
      disabled={!vet.isAvailable}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: vet.avatar }}
            style={styles.avatar}
            defaultSource={require('../../../assets/default-avatar.png')}
          />
          {!vet.isAvailable && (
            <View style={styles.unavailableBadge}>
              <Ionicons name="close" size={12} color="white" />
            </View>
          )}
        </View>

        {/* Vet Information */}
        <View style={styles.info}>
          <Text style={[
            styles.name,
            !vet.isAvailable && styles.unavailableText
          ]}>
            {vet.name}
          </Text>
          
          <Text style={[
            styles.specialization,
            !vet.isAvailable && styles.unavailableText
          ]}>
            {vet.specialization}
          </Text>

          <View style={styles.details}>
            {/* Rating */}
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{vet.rating}</Text>
            </View>

            {/* Experience */}
            <View style={styles.experience}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.experienceText}>
                {vet.experience} years
              </Text>
            </View>
          </View>

          {/* Availability Status */}
          <View style={styles.availability}>
            <View style={[
              styles.statusDot,
              vet.isAvailable ? styles.availableDot : styles.unavailableDot
            ]} />
            <Text style={[
              styles.statusText,
              !vet.isAvailable && styles.unavailableText
            ]}>
              {vet.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  unavailableContainer: {
    opacity: 0.6,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9ecef',
  },
  unavailableBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  experience: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availableDot: {
    backgroundColor: '#28a745',
  },
  unavailableDot: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  unavailableText: {
    color: '#999',
  },
  selectedIndicator: {
    marginLeft: 12,
  },
});