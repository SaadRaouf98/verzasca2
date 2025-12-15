export interface NotificationPreference {
  isSMSEnabled: boolean;
  isEmailEnabled: boolean;
  isRealtimeEnabled: boolean;
  id: string;
  name: string;
}

export interface AllNotificationPreferences {
  data: NotificationPreference[];
  totalCount: number;
  groupCount: number;
}

export interface UpdateNotificationPreferenceCommand {
  isSMSEnabled: boolean;
  isEmailEnabled: boolean;
  isRealtimeEnabled: boolean;
  id: string;
  name: string;
}

export interface MyNotificationPreference {
  isSMSEnabled: boolean;
  isEmailEnabled: boolean;
  isRealtimeEnabled: boolean;
}

export interface UpdateMyNotificationPreferenceCommand {
  isSMSEnabled: boolean;
  isEmailEnabled: boolean;
  isRealtimeEnabled: boolean;
}
