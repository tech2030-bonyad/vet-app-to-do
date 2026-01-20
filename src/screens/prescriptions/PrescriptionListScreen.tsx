import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { usePrescriptionStore } from '../../store/prescriptionStore';
import { PrescriptionCard } from '../../components/prescriptions/PrescriptionCard';
import { Prescription, PrescriptionFilters } from '../../types/prescription';
import { Colors, Typography, Spacing } from '../../constants/theme';

/**
 * PrescriptionListScreen - Main screen for viewing all pet prescriptions
 * Features: Search, filter, sort, and navigation to detail views
 */
export default function PrescriptionListScreen() {
  const router = useRouter();
  const { prescriptions, fetchPrescriptions, isLoading } = usePrescriptionStore();
  
  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PrescriptionFilters>({ status: 'all' });
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch prescriptions data
  const { data, isLoading: queryLoading, refetch } = useQuery({
    queryKey: ['prescriptions', filters],
    queryFn: () => fetchPrescriptions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and search prescriptions
  const filteredPrescriptions = useMemo(() => {
    let filtered = prescriptions || [];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (prescription) =>
          prescription.medicationName.toLowerCase().includes(query) ||
          prescription.petName.toLowerCase().includes(query) ||
          prescription.veterinarianName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(
        (prescription) => prescription.status === filters.status
      );
    }

    // Sort prescriptions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime();
        case 'name':
          return a.medicationName.localeCompare(b.medicationName);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [prescriptions, searchQuery, filters, sortBy]);

  /**
   * Handle prescription card press - navigate to detail screen
   */
  const handlePrescriptionPress = (prescription: Prescription) => {
    router.push({
      pathname: '/prescriptions/[id]',
      params: { id: prescription.id },
    });
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: Partial<PrescriptionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  /**
   * Clear all filters and search
   */
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ status: 'all' });
    setSortBy('date');
  };

  /**
   * Render empty state when no prescriptions found
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical-outline" size={64} color={Colors.gray400} />
      <Text style={styles.emptyStateTitle}>No Prescriptions Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || filters.status !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Your pet prescriptions will appear here'}
      </Text>
      {(searchQuery || filters.status !== 'all') && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Render filter pills
   */
  const renderFilterPills = () => (
    <View style={styles.filterPills}>
      {['all', 'active', 'completed', 'discontinued'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterPill,
            filters.status === status && styles.filterPillActive,
          ]}
          onPress={() => handleFilterChange({ status: status as any })}
        >
          <Text
            style={[
              styles.filterPillText,
              filters.status === status && styles.filterPillTextActive,
            ]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  /**
   * Render prescription item
   */
  const renderPrescriptionItem = ({ item }: { item: Prescription }) => (
    <PrescriptionCard
      prescription={item}
      onPress={() => handlePrescriptionPress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
        <TouchableOpacity
          style={styles.timelineButton}
          onPress={() => router.push('/prescriptions/timeline')}
        >
          <Ionicons name="time-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.gray400}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const nextSort = sortBy === 'date' ? 'name' : sortBy === 'name' ? 'status' : 'date';
            setSortBy(nextSort);
          }}
        >
          <Ionicons name="swap-vertical-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      {renderFilterPills()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredPrescriptions.length} prescription{filteredPrescriptions.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.sortText}>Sorted by {sortBy}</Text>
      </View>

      {/* Prescription List */}
      <FlatList
        data={filteredPrescriptions}
        renderItem={renderPrescriptionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={queryLoading}
            onRefresh={refetch}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  timelineButton: {
    padding: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  sortButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPills: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    ...Typography.caption,
    color: Colors.gray600,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: Colors.white,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  resultsText: {
    ...Typography.caption,
    color: Colors.gray600,
  },
  sortText: {
    ...Typography.caption,
    color: Colors.gray500,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Colors.gray600,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  clearFiltersButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  clearFiltersText: {
    ...Typography.button,
    color: Colors.white,
  },
});