import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authorization-container',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './authorization-container.component.html',
  styleUrls: ['./authorization-container.component.scss'],
})
export class AuthorizationContainerComponent {
  private router = inject(Router);
  action() {
    this.router.navigateByUrl('/');
  }
}
