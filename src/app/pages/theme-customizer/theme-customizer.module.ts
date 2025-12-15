import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeCustomizerRoutingModule } from './theme-customizer-routing.module';
import { SharedModule } from '@shared/shared.module';
import { ThemeComponent } from '@pages/theme-customizer/pages/theme/theme.component';
import { TableCellDirective } from '@shared/directives/table-cell.directive';
import { TableRowDetailDirective } from '@shared/directives/table-row.directive';
import { UploadAttachmentComponent } from '@shared/components/upload-attachment/upload-attachment.component';
import { TableComponent } from '@shared/components/table/table.component';

@NgModule({
  declarations: [ThemeComponent],
  imports: [
    CommonModule,
    SharedModule,
    ThemeCustomizerRoutingModule,
    TableCellDirective,
    TableRowDetailDirective,
    TableComponent,
    UploadAttachmentComponent,
  ],
})
export class ThemeCustomizerModule {}
