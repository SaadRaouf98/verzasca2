import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-image-modal',
  templateUrl: './view-image-modal.component.html',
  styleUrls: ['./view-image-modal.component.scss'],
})
export class ViewImageModalComponent {
  zoomLevel: number = 1;
  transform: string = 'scale(1)';
  isFullscreen: boolean = false; // Tracks fullscreen state

  constructor(
    @Inject(MAT_DIALOG_DATA) public image: string,
    public dialogRef: MatDialogRef<ViewImageModalComponent>
  ) {}

  dismiss(): void {
    this.dialogRef.close({ status: 'cancelled' });
  }

  zoomIn() {
    this.zoomLevel += 0.2;
    this.updateTransform();
  }

  zoomOut() {
    if (this.zoomLevel > 0.4) {
      this.zoomLevel -= 0.2;
      this.updateTransform();
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.updateTransform();
  }

  toggleFullscreen() {
    const dialogContainer = document.querySelector('app-view-image-modal ');

    if (!this.isFullscreen) {
      if (dialogContainer?.requestFullscreen) {
        dialogContainer.requestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      this.isFullscreen = false;
    }
  }

  private updateTransform() {
    this.transform = `scale(${this.zoomLevel})`;
  }
}
