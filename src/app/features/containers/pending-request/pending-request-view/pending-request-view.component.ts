import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@features/components/pending-request/pending-request-view/header/header.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pending-request-view',
  standalone: true,
  imports: [CommonModule, HeaderComponent, TranslateModule],
  templateUrl: './pending-request-view.component.html',
  styleUrls: ['./pending-request-view.component.scss'],
})
export class PendingRequestViewComponent {}
