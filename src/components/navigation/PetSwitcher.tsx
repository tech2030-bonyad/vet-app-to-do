import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '../../stores/petStore';
import { Pet } from '../../types/pet';

interface PetSwitcherProps {
  onPetChange?: (pet: Pet) => void;
}

/**
 * Pet switcher component
 * Allows users to select and switch between their pets
 */
export default function PetSwitcher({ onPetChange }: PetSwitcherProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { pets, activePet, setActivePet, isLoading } = usePetStore();

  /**
   * Handle pet selection
   */
  const handlePetSelect = (pet: Pet) => {
    try {
      setActivePet(pet);
      setIsModalVisible(false);
      onPetChange?.(pet);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch pet. Please try again.');
      console.error('Error switching pet:', error);
    }
  };

  /**
   * Render pet item in the list
   */
  const renderPetItem = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petItem,
        activePet?.id === item.id && styles.activePetItem,
      ]}
      onPress={() => handlePetSelect(item)}
      accessibilityLabel={`Select ${item.name}`}
      accessibilityRole="button"
    >
      <View style={styles.petItemContent}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.petPhoto} />
        ) : (
          <View style={[styles.petPhoto, styles.placeholderPhoto]}>
            <Ionicons name="paw" size={24} color="#8E8E93" />
          </View>
        )}
        
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.breed}</Text>
          <Text style={styles.petAge}>
            {item.age} {item.age === 1 ? 'year' : 'years'} old
          </Text>
        </View>
        
        {activePet?.id === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </View>
    </TouchableOpacity>
  );

  // Don't render if no pets
  if (!pets.length) {
    return null;
  }

  // Don't render if only one pet
  if (pets.length === 1) {
    return (
      <View style={styles.singlePetContainer}>
        <Text style={styles.singlePetText}>{activePet?.name}</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.switcher}
        onPress={() => setIsModalVisible(true)}
        disabled={isLoading}
        accessibilityLabel="Switch pet"
        accessibilityRole="button"
        accessibilityHint="Opens pet selection menu"
      >
        <View style={styles.switcherContent}>
          {activePet?.photo ? (
            <Image source={{ uri: activePet.photo }} style={styles.activePetPhoto} />
          ) : (
            <View style={[styles.activePetPhoto, styles.placeholderPhoto]}>
              <Ionicons name="paw" size={16} color="#8E8E93" />
            </View>
          )}
          
          <Text style={styles.activePetName} numberOfLines={1}>
            {activePet?.name || 'Select Pet'}
          </Text>
          
          <Ionicons name="chevron-down" size={16} color="#8E8E93" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Select Pet</Text>
            
            <View style={styles.closeButton} />
          </View>
          
          <FlatList
            data={pets}
            renderItem={renderPetItem}
            keyExtractor={(item) => item.id}
            style={styles.petList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.petListContent}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  switcher: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  switcherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePetPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  placeholderPhoto: {
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePetName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginRight: 4,
    flex: 1,
  },
  singlePetContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  singlePetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    minWidth: 60,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  petList: {
    flex: 1,
  },
  petListContent: {
    padding: 16,
  },
  petItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activePetItem: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  petItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  petAge: {
    fontSize: 12,
    color: '#8E8E93',
  },
});