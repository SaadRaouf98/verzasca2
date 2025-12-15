import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '@core/services/backend-services/notifications.service';
import {
  AllNotifications,
  Notification,
} from '@core/models/notification.model';
import { LanguageService } from '@core/services/language.service';
import { PageEvent } from '@angular/material/paginator';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationType } from '@core/enums/notification-type.enum';
import { Location } from '@angular/common';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
})
export class NotificationsListComponent implements OnInit {
  notifications: Notification[] = [];
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;

  lang: string = 'ar';
  isLoading: boolean = true;

  constructor(
    private notificationsService: NotificationsService,
    private langugaeSevice: LanguageService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeSevice.language;
    this.initializeList().subscribe();
  }

  initializeList(): Observable<AllNotifications> {
    return this.notificationsService
      .getNotificationsList({
        pageSize: this.pageSize,
        pageIndex: this.pageIndex,
      })
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.notifications = res.data;
          this.length = res.totalCount;
        })
      );
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initializeList().subscribe();
  }

  onGoToDetails(notification: Notification): void {
    this.notificationsService
      .updateNotificationItemStatus(notification.id, true)
      .subscribe((res) => {});
    //Navigate user to required page

    const notificationContentObj: {
      Id?: string; //ContainerId
      RequestId?: string;
      RecordId?: string;
      NoteId?: string;
      DocumentId?: string;
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
    } else if (notification.type === NotificationType.Report) {
    } else if (
      notification.type === NotificationType.Letter ||
      notification.type === NotificationType.Document
    ) {
      this.router.navigate([
        'imports-exports',
        notificationContentObj.DocumentId,
        'exportable-document-details',
      ]);
    }
  }

  onReadAll(): void {
    this.notificationsService.readAllNotifications().subscribe((res) => {
      this.pageIndex = 0;
      this.initializeList().subscribe();
    });
  }

  onDeleteAll(): void {
    this.notificationsService.deleteAllNotifications().subscribe((res) => {
      this.pageIndex = 0;
      this.initializeList().subscribe();
    });
  }

  goToLastPage(): void {
    this.location.back();
  }
}
