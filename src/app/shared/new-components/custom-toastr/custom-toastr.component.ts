import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-toastr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-toastr.component.html',
  styleUrls: ['./custom-toastr.component.scss'],
})
export class CustomToastrComponent {
  @Input() message: string = '';
  @Input() title: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'success';
  @Input() onClose: () => void = () => {};
}
