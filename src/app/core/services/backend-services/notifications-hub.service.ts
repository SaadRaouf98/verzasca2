import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '@env/environment';
import { NotificationMessage } from '@core/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsHubService {
  private connection!: signalR.HubConnection;
  private token!: string;
  public onNotificationReceived: Subject<NotificationMessage> =
    new Subject<NotificationMessage>();

  constructor(private authService: AuthService) {
    Object.defineProperty(WebSocket, 'OPEN', { value: 1 });

    this.initConnection();
  }

  async initConnection() {
    this.token = this.authService.getToken();
    if (this.token) {
      let options: signalR.IHttpConnectionOptions = {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true,
        accessTokenFactory: () => this.token,
      };

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.notificationHubUrl}`, options)
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.onclose(async () => {
        await this.initConnection();
      });

      this.initMethods();

      await this.connect();
    }
  }

  private async rebuildConnection() {
    if (this.connection?.state === signalR.HubConnectionState.Connected)
      await this.disconnect();

    await this.initConnection();
  }

  public async connect() {
    try {
      await this.connection.start();
      // console.info('connected');
    } catch (err) {
      console.error(err);
      setTimeout(() => this.connect(), 5000);
    }
  }

  public async disconnect() {
    this.token = '';
    await this.connection?.stop();
  }

  public registerMethod(
    methodName: string,
    callback: (data: any) => unknown
  ): void {
    this.connection.on(methodName, callback);
  }

  public callNotification(methodName: string, ...params: any[]): void {
    this.connection.invoke(methodName, ...params);
    // return defer(() => );
  }

  private initMethods() {
    this.registerMethod('MessageReceiver', (data: any) => {
      console.info(data);
      // this.service.notify(data);
      this.onNotificationReceived.next(data);
    });
  }
}
