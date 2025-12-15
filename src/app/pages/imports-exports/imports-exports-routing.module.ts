import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportsExportsListComponent } from './pages/imports-exports-list/imports-exports-list.component';
import { RequestDetailsComponent } from './pages/request-details/request-details.component';
import { ExportableDocumentDetailsComponent } from './pages/exportable-document-details/exportable-document-details.component';
import { NgxPermissionsGuard, ngxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { RequestAttachmentViewerComponent } from './pages/request-attachment-viewer/request-attachment-viewer.component';
import { AddTransactionAddImportComponent } from './pages/add-transaction-add-import/add-transaction-add-import.component';
import { EditImportComponent } from './components/edit-import/edit-import.component';
import { AddExportDocumentComponent } from './components/add-export-document/add-export-document.component';
import { ExportableDocumentViewerComponent } from './pages/exportable-document-viewer/exportable-document-viewer.component';
import { DeliveryReceiptComponent } from './pages/delivery-receipt/delivery-receipt.component';
import { DeliveryReceiptsListComponent } from './pages/delivery-receipts-list/delivery-receipts-list.component';
import { EditorFullPageComponent } from './pages/editor-full-page/editor-full-page.component';

const routes: Routes = [
  {
    path: '',
    component: ImportsExportsListComponent,
  },

  {
    path: ':requestContainerId/import/add',
    component: AddTransactionAddImportComponent,
  },

  {
    path: ':requestId/add-attachments',
    component: AddTransactionAddImportComponent,
  },

  {
    path: ':requestId/import', //If there is a requestId then it must be edit form
    component: EditImportComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateRequest,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/request-details', //تفاصيل الوارد
    component: RequestDetailsComponent,
  },
  {
    path: ':id/exportable-document-details', //تفاصيل الصادر
    component: ExportableDocumentDetailsComponent,
  },
  {
    path: 'add',
    component: AddTransactionAddImportComponent,
  },

  {
    path: ':exportId/export', //I intended to use the word ':id' because the exported document can be related to requestId which is not its id or it can't
    component: AddExportDocumentComponent,
    pathMatch: 'full',

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateRequest,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'export',
    component: AddExportDocumentComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateRequest,
        redirectTo: '/home',
      },
    },
  },
  /////////////////////////////////////
  //to view request attachment
  {
    path: 'attachments/:attachmentId',
    component: RequestAttachmentViewerComponent,
  },

  //to view the exportable document which is always a pdf
  {
    path: ':documentId/viewer',
    component: ExportableDocumentViewerComponent,
  },

  {
    path: 'exportId/:exportId/viewer',
    component: ExportableDocumentViewerComponent,
  },

  ///////////////////////////////////////////
  {
    path: 'delivery-receipts/create',
    component: DeliveryReceiptComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateDeliveryReceipt,
        redirectTo: '/home',
      },
    },
  },

  {
    path: 'delivery-receipts',
    component: DeliveryReceiptsListComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewDeliveryReceipt,
        redirectTo: '/home',
      },
    },
  },

  ///////////////////////////////////////////////////
  {
    path: ':fileId/editor',
    component: EditorFullPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportsExportsRoutingModule {}
