import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pet } from '../../types/pet';

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  onPress,
  onEdit,
  onDelete,
}) => {
  /**
   * Get appropriate icon based on pet species
   */
  const getSpeciesIcon = (species: string): keyof typeof Ionicons.glyphMap => {
    switch (species.toLowerCase()) {
      case 'dog':
        return 'paw';
      case 'cat':
        return 'paw';
      case 'bird':
        return 'airplane';
      case 'fish':
        return 'fish';
      case 'rabbit':
        return 'leaf';
      default:
        return 'heart';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {pet.imageUri ? (
          <Image source={{ uri: pet.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name={getSpeciesIcon(pet.species)}
              size={40}
              color="#999"
            />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{pet.name}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.species}>{pet.species}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.breed}>{pet.breed}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{pet.age} years</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="scale-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{pet.weight} kg</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name={pet.gender === 'male' ? 'male' : 'female'}
              size={14}
              color={pet.gender === 'male' ? '#007AFF' : '#FF69B4'}
            />
            <Text style={styles.metaText}>
              {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          {pet.isVaccinated && (
            <View style={[styles.statusBadge, styles.vaccinatedBadge]}>
              <Ionicons name="shield-checkmark" size={12} color="#34C759" />
              <Text style={styles.statusText}>Vaccinated</Text>
            </View>
          )}
          {pet.isNeutered && (
            <View style={[styles.statusBadge, styles.neuteredBadge]}>
              <Ionicons name="checkmark-circle" size={12} color="#007AFF" />
              <Text style={styles.statusText}>Neutered</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    marginRight: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  species: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 8,
    color: '#ccc',
  },
  breed: {
    fontSize: 14,
    color: '#666',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  vaccinatedBadge: {
    backgroundColor: '#E8F5E8',
  },
  neuteredBadge: {
    backgroundColor: '#E8F4FD',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
  },
});