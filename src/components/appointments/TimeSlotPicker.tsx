import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TimeSlot } from '../../types/appointment';

interface TimeSlotPickerProps {
  timeSlots: string[];
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
  bookedSlots?: string[];
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  timeSlots,
  selectedSlot,
  onSlotSelect,
  bookedSlots = [],
}) => {
  const isSlotBooked = (slot: string): boolean => {
    return bookedSlots.includes(slot);
  };

  const formatTime = (time: string): string => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderTimeSlot = (slot: string, index: number) => {
    const isSelected = selectedSlot === slot;
    const isBooked = isSlotBooked(slot);
    const isDisabled = isBooked;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.timeSlot,
          isSelected && styles.selectedSlot,
          isBooked && styles.bookedSlot,
        ]}
        onPress={() => !isDisabled && onSlotSelect(slot)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.timeText,
          isSelected && styles.selectedTimeText,
          isBooked && styles.bookedTimeText,
        ]}>
          {formatTime(slot)}
        </Text>
        {isBooked && (
          <Text style={styles.bookedLabel}>Booked</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Group time slots by morning, afternoon, evening
  const groupTimeSlots = () => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    timeSlots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupTimeSlots();

  const renderTimeGroup = (title: string, slots: string[]) => {
    if (slots.length === 0) return null;

    return (
      <View style={styles.timeGroup}>
        <Text style={styles.groupTitle}>{title}</Text>
        <View style={styles.slotsContainer}>
          {slots.map((slot, index) => renderTimeSlot(slot, index))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Available Time Slots</Text>
        
        {timeSlots.length === 0 ? (
          <View style={styles.noSlotsContainer}>
            <Text style={styles.noSlotsText}>
              No available time slots for this date
            </Text>
          </View>
        ) : (
          <>
            {renderTimeGroup('Morning', morning)}
            {renderTimeGroup('Afternoon', afternoon)}
            {renderTimeGroup('Evening', evening)}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  timeGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  bookedSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    opacity: 0.6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedTimeText: {
    color: 'white',
  },
  bookedTimeText: {
    color: '#999',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});