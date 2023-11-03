export interface NotificationLogs {
  id: number;
  creationDate: Date | string;
  notificationType: NotificationType;
  userId: string;
  groupId: string;
  notificationId: number;
  notificationName: string;
  entityEntryId: number;
  subject: string;
  phone: string;
  email: string;
  smsContent: string;
  emailContent: string;
  systemNotificationContent: string;
  pushNotificationSeen: boolean;
}
export enum NotificationType {
  SMS = 1,
  Email = 2,
  WhatsApp = 3,
  PushNotification = 4
}