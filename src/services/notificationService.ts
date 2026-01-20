import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  categoryId?: string;
}

export interface ScheduledNotification {
  id: string;
  type: 'appointment' | 'prescription' | 'order';
  scheduledTime: Date;
  data: NotificationData;
}

export interface NotificationPreferences {
  appointments: {
    enabled: boolean;
    reminderTime: number; // minutes before appointment
    sound: boolean;
  };
  prescriptions: {
    enabled: boolean;
    dailyReminder: boolean;
    refillReminder: boolean;
    reminderTime: string; // HH:MM format
    sound: boolean;
  };
  orders: {
    enabled: boolean;
    statusUpdates: boolean;
    deliveryUpdates: boolean;
    sound: boolean;
  };
  general: {
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
  };
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service and request permissions
   */
  async initialize(): Promise<boolean> {
    try {
      // Register for push notifications
      const token = await this.registerForPushNotificationsAsync();
      if (token) {
        this.expoPushToken = token;
      }

      // Set up notification categories
      await this.setupNotificationCategories();

      // Set up listeners
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  /**
   * Request notification permissions and get push token
   */
  private async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create specific channels for different notification types
      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Appointment Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });

      await Notifications.setNotificationChannelAsync('prescriptions', {
        name: 'Prescription Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });

      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo push token:', token);
      } catch (error) {
        console.error('Failed to get Expo push token:', error);
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  /**
   * Set up notification categories with actions
   */
  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('appointment', [
      {
        identifier: 'reschedule',
        buttonTitle: 'Reschedule',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'confirm',
        buttonTitle: 'Confirm',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('prescription', [
      {
        identifier: 'taken',
        buttonTitle: 'Mark as Taken',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Remind Later',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('order', [
      {
        identifier: 'track',
        buttonTitle: 'Track Order',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Handle foreground notification
        this.handleForegroundNotification(notification);
      }
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification received in foreground
   */
  private handleForegroundNotification(notification: Notifications.Notification): void {
    // You can customize foreground notification behavior here
    // For example, show an in-app notification banner
  }

  /**
   * Handle user interaction with notification
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification, actionIdentifier } = response;
    const notificationData = notification.request.content.data;

    switch (actionIdentifier) {
      case 'reschedule':
        // Navigate to reschedule screen
        console.log('Reschedule appointment:', notificationData);
        break;
      case 'confirm':
        // Confirm appointment
        console.log('Confirm appointment:', notificationData);
        break;
      case 'taken':
        // Mark prescription as taken
        console.log('Mark prescription as taken:', notificationData);
        break;
      case 'snooze':
        // Snooze prescription reminder
        this.snoozePrescriptionReminder(notificationData);
        break;
      case 'track':
        // Navigate to order tracking
        console.log('Track order:', notificationData);
        break;
      default:
        // Default tap action - navigate to relevant screen
        this.handleDefaultTap(notification);
        break;
    }
  }

  /**
   * Schedule appointment reminder
   */
  async scheduleAppointmentReminder(
    appointmentId: string,
    appointmentTime: Date,
    patientName: string,
    doctorName: string,
    reminderMinutes: number = 30
  ): Promise<string | null> {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences.appointments.enabled) {
        return null;
      }

      const reminderTime = new Date(appointmentTime.getTime() - reminderMinutes * 60 * 1000);
      
      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) {
        return null;
      }

      // Check quiet hours
      if (this.isInQuietHours(reminderTime, preferences.general.quietHours)) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Appointment Reminder',
          body: `Your appointment with Dr. ${doctorName} is in ${reminderMinutes} minutes`,
          data: {
            type: 'appointment',
            appointmentId,
            patientName,
            doctorName,
            appointmentTime: appointmentTime.toISOString(),
          },
          categoryIdentifier: 'appointment',
          sound: preferences.appointments.sound ? 'default' : undefined,
        },
        trigger: {
          date: reminderTime,
        },
      });

      // Store scheduled notification info
      await this.storeScheduledNotification({
        id: notificationId,
        type: 'appointment',
        scheduledTime: reminderTime,
        data: {
          id: appointmentId,
          title: 'Appointment Reminder',
          body: `Your appointment with Dr. ${doctorName} is in ${reminderMinutes} minutes`,
          data: {
            type: 'appointment',
            appointmentId,
            patientName,
            doctorName,
            appointmentTime: appointmentTime.toISOString(),
          },
          categoryId: 'appointment',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule appointment reminder:', error);
      return null;
    }
  }

  /**
   * Schedule prescription reminder
   */
  async schedulePrescriptionReminder(
    prescriptionId: string,
    medicationName: string,
    dosage: string,
    reminderTime: Date,
    isRecurring: boolean = true
  ): Promise<string | null> {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences.prescriptions.enabled) {
        return null;
      }

      // Check quiet hours
      if (this.isInQuietHours(reminderTime, preferences.general.quietHours)) {
        return null;
      }

      const trigger = isRecurring
        ? {
            hour: reminderTime.getHours(),
            minute: reminderTime.getMinutes(),
            repeats: true,
          }
        : {
            date: reminderTime,
          };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medication Reminder',
          body: `Time to take your ${medicationName} (${dosage})`,
          data: {
            type: 'prescription',
            prescriptionId,
            medicationName,
            dosage,
            reminderTime: reminderTime.toISOString(),
          },
          categoryIdentifier: 'prescription',
          sound: preferences.prescriptions.sound ? 'default' : undefined,
        },
        trigger,
      });

      // Store scheduled notification info
      await this.storeScheduledNotification({
        id: notificationId,
        type: 'prescription',
        scheduledTime: reminderTime,
        data: {
          id: prescriptionId,
          title: 'Medication Reminder',
          body: `Time to take your ${medicationName} (${dosage})`,
          data: {
            type: 'prescription',
            prescriptionId,
            medicationName,
            dosage,
            reminderTime: reminderTime.toISOString(),
          },
          categoryId: 'prescription',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule prescription reminder:', error);
      return null;
    }
  }

  /**
   * Send order status notification
   */
  async sendOrderStatusNotification(
    orderId: string,
    status: string,
    message: string
  ): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences();
      
      if (!preferences.orders.enabled || !preferences.orders.statusUpdates) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Order Update',
          body: message,
          data: {
            type: 'order',
            orderId,
            status,
          },
          categoryIdentifier: 'order',
          sound: preferences.orders.sound ? 'default' : undefined,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send order status notification:', error);
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await this.removeScheduledNotification(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications of a specific type
   */
  async cancelNotificationsByType(type: 'appointment' | 'prescription' | 'order'): Promise<void> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();
      const notificationsToCancel = scheduledNotifications.filter(n => n.type === type);

      for (const notification of notificationsToCancel) {
        await this.cancelNotification(notification.id);
      }
    } catch (error) {
      console.error('Failed to cancel notifications by type:', error);
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
    }

    // Return default preferences
    return {
      appointments: {
        enabled: true,
        reminderTime: 30,
        sound: true,
      },
      prescriptions: {
        enabled: true,
        dailyReminder: true,
        refillReminder: true,
        reminderTime: '09:00',
        sound: true,
      },
      orders: {
        enabled: true,
        statusUpdates: true,
        deliveryUpdates: true,
        sound: true,
      },
      general: {
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      },
    };
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  /**
   * Check if time is within quiet hours
   */
  private isInQuietHours(time: Date, quietHours: NotificationPreferences['general']['quietHours']): boolean {
    if (!quietHours.enabled) {
      return false;
    }

    const timeStr = time.toTimeString().substring(0, 5); // HH:MM format
    const { start, end } = quietHours;

    if (start <= end) {
      // Same day quiet hours (e.g., 22:00 - 23:59)
      return timeStr >= start && timeStr <= end;
    } else {
      // Overnight quiet hours (e.g., 22:00 - 08:00)
      return timeStr >= start || timeStr <= end;
    }
  }

  /**
   * Snooze prescription reminder
   */
  private async snoozePrescriptionReminder(notificationData: any): Promise<void> {
    const snoozeTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes later
    
    await this.schedulePrescriptionReminder(
      notificationData.prescriptionId,
      notificationData.medicationName,
      notificationData.dosage,
      snoozeTime,
      false // Not recurring for snoozed reminder
    );
  }

  /**
   * Handle default notification tap
   */
  private handleDefaultTap(notification: Notifications.Notification): void {
    const data = notification.request.content.data;
    
    // Navigate to appropriate screen based on notification type
    switch (data?.type) {
      case 'appointment':
        // Navigate to appointment details
        console.log('Navigate to appointment:', data.appointmentId);
        break;
      case 'prescription':
        // Navigate to prescription details
        console.log('Navigate to prescription:', data.prescriptionId);
        break;
      case 'order':
        // Navigate to order details
        console.log('Navigate to order:', data.orderId);
        break;
    }
  }

  /**
   * Store scheduled notification info
   */
  private async storeScheduledNotification(notification: ScheduledNotification): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('scheduledNotifications');
      const notifications: ScheduledNotification[] = stored ? JSON.parse(stored) : [];
      notifications.push(notification);
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store scheduled notification:', error);
    }
  }

  /**
   * Remove scheduled notification info
   */
  private async removeScheduledNotification(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('scheduledNotifications');
      if (stored) {
        const notifications: ScheduledNotification[] = JSON.parse(stored);
        const filtered = notifications.filter(n => n.id !== notificationId);
        await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Failed to remove scheduled notification:', error);
    }
  }

  /**
   * Get scheduled notifications
   */
  private async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const stored = await AsyncStorage.getItem('scheduledNotifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default NotificationService.getInstance();