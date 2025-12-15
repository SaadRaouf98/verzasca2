import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '@env/environment';
import { ClipboardMode } from '@shared/enums/editor-clipboard.enum';
import { EditorEditMode } from '@shared/enums/editor-edit-mode.enum';
import { EditorStreamType } from '@shared/enums/editor-stream-type.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { getBase64 } from '@shared/helpers/helpers';
declare const TXTextControl: any;

@Component({
  selector: 'app-view-file-modal',
  templateUrl: './view-file-modal.component.html',
  styleUrls: ['./view-file-modal.component.scss'],
  providers: [],
})
export class ViewFileModalComponent implements OnInit, OnDestroy {
  editorToken: string = environment.editorToken;
  editMode = EditorEditMode.ReadOnly;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      file: Blob;
      fileType: string;
      fileUrl: string;
      fileName: string;
    },
    private dialogRef: MatDialogRef<ViewFileModalComponent>
  ) {}

  @HostListener('document:txDocumentEditorLoaded', ['$event'])
  onTxDocumentEditorLoaded() {
    const self = this;
    TXTextControl.addEventListener('textControlLoaded', function () {
      // wait until TXTextControl has been loaded
      TXTextControl.clipboardMode = ClipboardMode.Client;

      self.loadDocmentInEditor();
    });
  }
  ngOnInit(): void {}

  private async loadDocmentInEditor() {
    const base64String = await getBase64(new File([this.data.file], 'name'));

    const streamTypeMapper: { [key: string]: EditorStreamType } = {
      '.docx': EditorStreamType.WordprocessingML,
      '.doc': EditorStreamType.MSWord,
      '.pdf': EditorStreamType.AdobePDF,
      '.pptx': EditorStreamType.SpreadsheetML,
    };

    TXTextControl.loadDocument(
      streamTypeMapper[this.data.fileType], //EditorStreamType.WordprocessingML, //TXTextControl.StreamType.AdobePDF
      btoa(base64String as string),
      (data: any) => {}
    );
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  ngOnDestroy(): void {
    TXTextControl.removeFromDom();
  }
}
