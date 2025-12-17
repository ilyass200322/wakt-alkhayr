import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types/models';
import { generateId } from '../utils/helpers';

const NOTIFICATIONS_KEY = '@waqt_lkhair_notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async initialize(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission de notification refusée');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Waqt Lkhair',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2D5A3D',
        });
      }

      return true;
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      return false;
    }
  },

  async scheduleReminder(
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const now = new Date();
      if (triggerDate <= now) {
        console.log('Date de rappel déjà passée');
        return null;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: {
          date: triggerDate,
        },
      });

      const notification: Notification = {
        id: identifier,
        userId: 'current',
        title,
        body,
        type: 'reminder',
        campaignId: data?.campaignId as string,
        read: false,
        scheduledFor: triggerDate,
        createdAt: new Date(),
      };

      await this.saveNotification(notification);

      return identifier;
    } catch (error) {
      console.error('Erreur planification rappel:', error);
      return null;
    }
  },

  async scheduleEngagementReminder(
    campaignTitle: string,
    needLabel: string,
    engagementDate: Date,
    campaignId: string
  ): Promise<string | null> {
    const reminderDate = new Date(engagementDate);
    reminderDate.setHours(reminderDate.getHours() - 2);

    return this.scheduleReminder(
      '⏰ Rappel d\'engagement',
      `N'oubliez pas votre engagement pour "${campaignTitle}" - ${needLabel}`,
      reminderDate,
      { campaignId, type: 'engagement_reminder' }
    );
  },

  async sendThankYouNotification(
    campaignTitle: string,
    engagementType: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💚 Merci pour votre générosité !',
          body: `Votre ${engagementType} pour "${campaignTitle}" a bien été enregistré. Baraka Allahou fik !`,
          sound: 'default',
        },
        trigger: {
          seconds: 2,
        },
      });
    } catch (error) {
      console.error('Erreur notification remerciement:', error);
    }
  },

  async sendUpdateNotification(
    campaignTitle: string,
    updateTitle: string,
    campaignId: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📢 ${campaignTitle}`,
          body: updateTitle,
          data: { campaignId, type: 'campaign_update' },
          sound: 'default',
        },
        trigger: {
          seconds: 1,
        },
      });
    } catch (error) {
      console.error('Erreur notification mise à jour:', error);
    }
  },

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      await this.removeNotification(identifier);
    } catch (error) {
      console.error('Erreur annulation notification:', error);
    }
  },

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Erreur annulation toutes notifications:', error);
    }
  },

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur récupération notifications planifiées:', error);
      return [];
    }
  },

  async saveNotification(notification: Notification): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const notifications: Notification[] = stored ? JSON.parse(stored) : [];
      notifications.unshift(notification);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 50)));
    } catch (error) {
      console.error('Erreur sauvegarde notification:', error);
    }
  },

  async removeNotification(id: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!stored) return;
      const notifications: Notification[] = JSON.parse(stored);
      const filtered = notifications.filter(n => n.id !== id);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  },

  async getStoredNotifications(): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!stored) return;
      const notifications: Notification[] = JSON.parse(stored);
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications[index].read = true;
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Erreur marquage notification lue:', error);
    }
  },

  addNotificationListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};

export default notificationService;
