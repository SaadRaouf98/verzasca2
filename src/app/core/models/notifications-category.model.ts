import { NotificationCategory } from '@core/enums/notification-category.enum';

interface User {
  id: string;
  name: string;
}

export interface AllNotificationsCategories {
  data: User[];
  totalCount: number;
  groupCount: number;
}

export interface UpdateNotificationsCategoryUsersCommand {
  category: NotificationCategory;
  usersIds: string[];
}
