import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from "@angular/router";

@Component({
  selector: 'app-left-top-header',
  templateUrl: './left-top-header.component.html',
  styleUrls: ['./left-top-header.component.scss']
})
export class LeftTopHeaderComponent {
  /** URL of the user's avatar image */
  @Input() avatarUrl: string = '';
  @Input() isLoggedIn: boolean = true;
  /** Full name of the user */
  @Input() userName: string = '';

  /** Email of the user */
  @Input() userEmail: string = '';

  /** Whether to show the red notification dot */
  @Input() hasNotification: boolean = false;

  /** Emitted when the notification bell is clicked */
  @Output() notificationClick = new EventEmitter<void>();
  constructor(   private router: Router,) {
  }
  onBellClick() {
    this.notificationClick.emit();
  }
  onNavigateToUserProfile(): void {
    this.router.navigateByUrl('my-profile');
  }
}
