import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '@core/services/backend-services/notifications.service';
import { Notification } from '@core/models/notification.model';
import { Router } from '@angular/router';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { NotificationType } from '@core/enums/notification-type.enum';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-notifications-menu',
  templateUrl: './notifications-menu.component.html',
  styleUrls: ['./notifications-menu.component.scss'],
})
export class NotificationsMenuComponent implements OnInit {
  notifiations: Notification[] = [];
  noOfAllUnreadNotifications: number = 0;
  isLoading: boolean = true;
  lang: string = 'ar';

  constructor(
    private notificationsService: NotificationsService,
    private notificationsHubService: NotificationsHubService,
    private languageService: LanguageService,
    private router: Router
  ) {
    this.notificationsHubService.onNotificationReceived.subscribe({
      next: () => {
        this.getNotifications()
      }
    })
  }
  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.getNotifications();
  }

  getNotifications(): void {
    this.notificationsService
      .getNotificationsList(
        {
          pageIndex: 0,
          pageSize: 10,
        },
        {
          seen: false,
        },
        {
          sortBy: 'date',
          sortType: 'desc',
        }
      )
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.notifiations = res.data;

          this.noOfAllUnreadNotifications = res.totalCount;
        },
      });
  }

  // initRealTime(): void {
  //   this.notificationsHubService.onNotificationReceived.subscribe({
  //     next: (res) => {
  //       this.notifiations.unshift(res as any);
  //       this.noOfAllUnreadNotifications++;
  //     },
  //   });
  // }

  onGoToDetails(notification: Notification): void {
    this.notificationsService
      .updateNotificationItemStatus(notification.id, true)
      .subscribe((res) => {});

    //Decrease the total number of unread notifications
    this.noOfAllUnreadNotifications--;

    //Navigate user to required page
    const notificationContentObj: {
      Id?: string; //ContainerId
      RequestId?: string;
      RecordId?: string;
      NoteId?: string;
    } = JSON.parse(notification.content || '{}');

    if (notification.type === NotificationType.Message) {
      //DO nothing
    } else if (notification.type === NotificationType.Container) {
      this.router.navigate(['transactions', notificationContentObj.Id]);
    } else if (notification.type === NotificationType.NextStepAction) {
      this.router.navigate([
        'imports-exports',
        notificationContentObj.RequestId,
        'request-details',
      ]);
    } else if (notification.type === NotificationType.Inquiry) {
      //DO nothing
    } else if (notification.type === NotificationType.Record) {
      this.router.navigate(['manage-records', notificationContentObj.RecordId]);
    } else if (notification.type === NotificationType.Note) {
      this.router.navigate([
        'manage-notes',
        notificationContentObj.NoteId,
        'file',
      ]);
    } else if (notification.type === NotificationType.Request) {
      this.router.navigate([
        'imports-exports',
        notificationContentObj.RequestId,
        'request-details',
      ]);
    }
  }

  removeIconBadge() {}
}

