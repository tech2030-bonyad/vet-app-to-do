import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { usePrescriptionStore } from '../../store/prescriptionStore';
import { generatePrescriptionPDF, sharePDF } from '../../utils/pdfShare';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { format } from 'date-fns';

/**
 * PrescriptionDetailScreen - Detailed view of a single prescription
 * Features: Complete prescription info, PDF generation, sharing
 */
export default function PrescriptionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPrescriptionById } = usePrescriptionStore();
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch prescription details
  const { data: prescription, isLoading, error } = useQuery({
    queryKey: ['prescription', id],
    queryFn: () => getPrescriptionById(id!),
    enabled: !!id,
  });

  /**
   * Generate and share prescription PDF
   */
  const handleSharePDF = async () => {
    if (!prescription) return;

    try {
      setIsGeneratingPDF(true);
      const pdfUri = await generatePrescriptionPDF(prescription);
      await sharePDF(pdfUri, `${prescription.medicationName}_prescription.pdf`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /**
   * Handle prescription actions (refill, discontinue, etc.)
   */
  const handlePrescriptionAction = (action: 'refill' | 'discontinue' | 'contact') => {
    switch (action) {
      case 'refill':
        Alert.alert(
          'Request Refill',
          'Would you like to request a refill for this prescription?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Request', onPress: () => console.log('Refill requested') },
          ]
        );
        break;
      case 'discontinue':
        Alert.alert(
          'Discontinue Prescription',
          'Are you sure you want to mark this prescription as discontinued?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Discontinue', style: 'destructive', onPress: () => console.log('Discontinued') },
          ]
        );
        break;
      case 'contact':
        Alert.alert(
          'Contact Veterinarian',
          'Would you like to contact the prescribing veterinarian?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => console.log('Calling vet') },
            { text: 'Message', onPress: () => console.log('Messaging vet') },
          ]
        );
        break;
    }
  };

  /**
   * Get status color based on prescription status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return Colors.success;
      case 'completed':
        return Colors.gray500;
      case 'discontinued':
        return Colors.error;
      default:
        return Colors.gray400;
    }
  };

  /**
   * Render prescription info section
   */
  const renderInfoSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  /**
   * Render info row
   */
  const renderInfoRow = (label: string, value: string, icon?: string) => (
    <View style={styles.infoRow}>
      {icon && <Ionicons name={icon as any} size={20} color={Colors.gray500} />}
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading prescription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !prescription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Prescription Not Found</Text>
          <Text style={styles.errorText}>
            The prescription you're looking for could not be found.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Prescription Details</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleSharePDF}
          disabled={isGeneratingPDF}
        >
          <Ionicons
            name={isGeneratingPDF ? "hourglass-outline" : "share-outline"}
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Medication Header */}
        <View style={styles.medicationHeader}>
          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{prescription.medicationName}</Text>
            <Text style={styles.petName}>for {prescription.petName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) }]}>
            <Text style={styles.statusText}>
              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Dosage Information */}
        {renderInfoSection('Dosage & Instructions', (
          <>
            {renderInfoRow('Dosage', prescription.dosage, 'medical-outline')}
            {renderInfoRow('Frequency', prescription.frequency, 'time-outline')}
            {renderInfoRow('Duration', prescription.duration, 'calendar-outline')}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsLabel}>Instructions</Text>
              <Text style={styles.instructionsText}>{prescription.instructions}</Text>
            </View>
          </>
        ))}

        {/* Prescription Details */}
        {renderInfoSection('Prescription Details', (
          <>
            {renderInfoRow(
              'Prescribed Date',
              format(new Date(prescription.prescribedDate), 'MMM dd, yyyy'),
              'document-text-outline'
            )}
            {renderInfoRow(
              'Start Date',
              format(new Date(prescription.startDate), 'MMM dd, yyyy'),
              'play-outline'
            )}
            {renderInfoRow(
              'End Date',
              format(new Date(prescription.endDate), 'MMM dd, yyyy'),
              'stop-outline'
            )}
            {renderInfoRow(
              'Refills',
              `${prescription.refillsRemaining} of ${prescription.totalRefills} remaining`,
              'refresh-outline'
            )}
          </>
        ))}

        {/* Veterinarian Information */}
        {renderInfoSection('Veterinarian', (
          <>
            {renderInfoRow('Doctor', prescription.veterinarianName, 'person-outline')}
            {renderInfoRow('Clinic', prescription.clinicName, 'business-outline')}
            {prescription.pharmacy && renderInfoRow('Pharmacy', prescription.pharmacy, 'storefront-outline')}
          </>
        ))}

        {/* Additional Information */}
        {(prescription.sideEffects?.length || prescription.notes || prescription.cost) && (
          renderInfoSection('Additional Information', (
            <>
              {prescription.cost && renderInfoRow('Cost', `$${prescription.cost.toFixed(2)}`, 'card-outline')}
              {prescription.sideEffects && prescription.sideEffects.length > 0 && (
                <View style={styles.sideEffectsContainer}>
                  <Text style={styles.sideEffectsLabel}>Possible Side Effects</Text>
                  {prescription.sideEffects.map((effect, index) => (
                    <Text key={index} style={styles.sideEffectItem}>• {effect}</Text>
                  ))}
                </View>
              )}
              {prescription.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes</Text>
                  <Text style={styles.notesText}>{prescription.notes}</Text>
                </View>
              )}
            </>
          ))
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {prescription.status === 'active' && prescription.refillsRemaining > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handlePrescriptionAction('refill')}
            >
              <Ionicons name="refresh-outline" size={20} color={Colors.white} />
              <Text style={styles.primaryButtonText}>Request Refill</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => handlePrescriptionAction('contact')}
          >
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Contact Vet</Text>
          </TouchableOpacity>

          {prescription.status === 'active' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => handlePrescriptionAction('discontinue')}
            >
              <Ionicons name="stop-outline" size={20} color={Colors.error} />
              <Text style={styles.dangerButtonText}>Discontinue</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  shareButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    marginBottom: Spacing.lg,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  petName: {
    ...Typography.body,
    color: Colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  instructionsContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
  },
  instructionsLabel: {
    ...Typography.caption,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },
  instructionsText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 20,
  },
  sideEffectsContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.warning + '10',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  sideEffectsLabel: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  sideEffectItem: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.info + '10',
    borderRadius: 8,
  },
  notesLabel: {
    ...Typography.caption,
    color: Colors.info,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  notesText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  dangerButtonText: {
    ...Typography.button,
    color: Colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.gray500,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.error,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});