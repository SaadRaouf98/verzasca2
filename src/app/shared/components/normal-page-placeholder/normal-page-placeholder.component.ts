import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ManageSharedService } from '@shared/services/manage-shared.service';

@Component({
  selector: 'app-normal-page-placeholder',
  templateUrl: './normal-page-placeholder.component.html',
  styleUrls: ['./normal-page-placeholder.component.scss'],
  host: { '(contextmenu)': 'contextmenu($event)' },
})
export class NormalPagePlaceholderComponent {
  left = 0;
  top = 0;
  width = 0;
  pageNumber = 0;
  height = 0;
  parentHeight = 0;
  parentWidth = 0;

  @Input('pageIndex') pageIndex!: number;

  constructor(private manageSharedService: ManageSharedService) {}

  onDeleteBox(): void {
    this.manageSharedService.deleteNormalPaperPlaceHolder(this.pageIndex);
  }
}
