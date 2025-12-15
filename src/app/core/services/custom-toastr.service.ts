import { Injectable, inject, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CustomToastrComponent } from '@shared/new-components/custom-toastr/custom-toastr.component';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CustomToastrService {
  private overlay = inject(Overlay);
  private injector = inject(Injector);
  private translateService = inject(TranslateService);
  private activeToasts: OverlayRef[] = [];

  success(message: string, title?: string, timeout: number = 5000): void {
    const finalTitle = title || this.translateService.instant('shared.success');
    this.showCustomToast(message, finalTitle, 'success', timeout);
  }

  error(message: string, title?: string, timeout: number = 6000): void {
    const finalTitle = title || this.translateService.instant('shared.error');
    this.showCustomToast(message, finalTitle, 'error', timeout);
  }

  warning(message: string, title?: string, timeout: number = 5000): void {
    const finalTitle = title || this.translateService.instant('shared.warning');
    this.showCustomToast(message, finalTitle, 'warning', timeout);
  }

  private showCustomToast(
    message: string,
    title: string,
    type: 'success' | 'error' | 'warning',
    timeout: number
  ): void {
    // Create overlay reference
    const positionStrategy = this.overlay.position().global().centerHorizontally().bottom('20px');

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
    });

    // Create component portal
    const componentPortal = new ComponentPortal(CustomToastrComponent, null, this.injector);
    const componentRef: ComponentRef<CustomToastrComponent> = overlayRef.attach(componentPortal);

    // Set component inputs
    componentRef.instance.message = message;
    componentRef.instance.title = title;
    componentRef.instance.type = type;
    componentRef.instance.onClose = () => this.closeToast(overlayRef);

    // Add to active toasts
    this.activeToasts.push(overlayRef);

    // Auto close after timeout
    if (timeout > 0) {
      setTimeout(() => {
        this.closeToast(overlayRef);
      }, timeout);
    }
  }

  private closeToast(overlayRef: OverlayRef): void {
    overlayRef.dispose();
    this.activeToasts = this.activeToasts.filter((ref) => ref !== overlayRef);
  }
}
