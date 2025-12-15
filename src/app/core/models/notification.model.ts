import { NotificationType } from '@core/enums/notification-type.enum';

export interface NotificationMessage {
  title: string;
  titleEn: string;

  message: string;
  messageEn: string;

  content: string; //JSON
  //TODO: WHERE IS Date and type? ASK bACKEND
}

export interface Notification {
  id: string;
  title: string;
  titleEn: string;
  type: NotificationType;
  message: string;
  messageEn: string;
  date: string;
  content: string | null;
  seen: boolean;
}

export interface AllNotifications {
  data: Notification[];
  totalCount: number;
  groupCount: number;
}
