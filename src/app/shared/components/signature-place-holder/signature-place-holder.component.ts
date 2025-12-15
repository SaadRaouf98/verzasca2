import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { AngularDraggableDirective } from 'angular2-draggable';
import { IResizeEvent } from 'angular2-draggable/lib/models/resize-event';

@Component({
  selector: 'app-signature-place-holder',
  templateUrl: './signature-place-holder.component.html',
  styleUrls: ['./signature-place-holder.component.scss'],
  host: { '(contextmenu)': 'contextmenu($event)' },
})
export class SignaturePlaceHolderComponent {
  @ViewChild('draggable', { static: true }) drag!: ElementRef;
  @ViewChild(AngularDraggableDirective, { static: true })
  draggable!: AngularDraggableDirective;

  @Input('user') user!: { id: string; name: string; key: string };

  left = 0;
  top = 0;
  width = 0;
  pageNumber = 0;
  height = 0;
  parentHeight = 0;
  parentWidth = 0;

  constructor(private manageSharedService: ManageSharedService) {}

  onMoveEnd(event: any): void {
    this.left += event.x;
    this.top += event.y;
    this.drag.nativeElement.style.transform = '';
    this.draggable.resetPosition();

    this.top = this.top < 0 ? 0 : this.top;
    this.left = this.left < 0 ? 0 : this.left;
    if (this.parentHeight < this.top + this.height) {
      this.top = this.parentHeight - this.height;
    }
    if (this.parentWidth < this.left + this.width) {
      this.left = this.parentWidth - this.width;
    }
  }

  onResizeStop(event: IResizeEvent): void {
    this.height = event.size.height;
    this.width = event.size.width;
    this.top = event.position.top;
    this.left = event.position.left;
    this.drag.nativeElement.style.transform = '';
    this.draggable.resetPosition();
  }

  contextmenu(e: any): void {
    //e.preventDefault();
    // e.stopPropagation();
  }

  onDeleteBox(): void {
    this.manageSharedService.deleteSignaturePlaceHolder(this.user.id);
  }
}
