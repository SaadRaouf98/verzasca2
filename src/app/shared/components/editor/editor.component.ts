import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { RequestsService } from '@core/services/backend-services/requests.service';
import { environment } from '@env/environment';
import { convertToIFormFile } from '@shared/helpers/helpers';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  @Input('editorFileId') editorFileId!: string;
  @Input('allowEdit') allowEdit: boolean = true;
  @Input('requestId') requestId: string = '';

  editorUrl = environment.editoUrl;

  @ViewChild('editorForm') editorForm!: ElementRef;
  hasEditorLoaded: boolean = false;
  token: string = '';

  isFrameReady = false;
  isHostReadySent = false;

  @Output()
  editorLoaded: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private authService: AuthService,
    private requestsService: RequestsService
  ) {}

  ngAfterViewInit(): void {
    this.editorForm.nativeElement.submit();
  }

  ngOnInit(): void {
    this.token = this.authService.getToken();
    window.addEventListener('message', this.handlePostMessage.bind(this));
  }

  private handlePostMessage(event: any): void {
    var message = JSON.parse(event.data);
    var id = message.MessageId;
    var values = message.Values;
    try {
      switch (id) {
        case 'UI_Close':

          break;
        case 'App_LoadingStatus':
          if (values.Status === 'Frame_Ready') {
            this.isFrameReady = true;
            // Send Host_PostmessageReady signal
            //@ts-ignore
            const iframe = document.getElementById('office').contentWindow;
            const readyMessage = {
              MessageId: 'Host_PostmessageReady',
              SendTime: new Date().toISOString(),
              Values: {},
            };
            iframe.postMessage(JSON.stringify(readyMessage), '*');
            this.isHostReadySent = true;

            // Add readonly
            //@ts-ignore
            /* document
              .getElementById('office') //@ts-ignore
              .contentWindow.app.setPermission('edit'); //@ts-ignore */

            //@ts-ignore
            /*  document
              .getElementById('office') //@ts-ignore
              .contentWindow.app.map.uiManager.addClassicUI(); */
          }

          if (values.Status === 'Document_Loaded') {
            this.editorLoaded.emit();
            //@ts-ignore
            /*             document
              .getElementById('office') //@ts-ignore
              .contentWindow.app.map.applyFont('Royal Arabic RC');
 */
            //@ts-ignore
            /*             document
              .getElementById('office') //@ts-ignore
              .contentWindow.app.map.applyFontSize(20);
 */
            /* if (this.requestId) {
              //@ts-ignore
              document
                .getElementById('office') //@ts-ignore
                .contentWindow.app.map.uiManager.insertButton({
                  id: 'insertBarcode',
                  imgurl:
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M1 19V5h2v14zm3 0V5h2v14zm3 0V5h1v14zm3 0V5h2v14zm3 0V5h3v14zm4 0V5h1v14zm3 0V5h3v14z'/%3E%3C/svg%3E",
                  hint: 'ادراج باركود',
                });
            } */
            //@ts-ignore
            /* document
              .getElementById('office') //@ts-ignore
              .contentWindow.app.map.uiManager.insertButton({
                id: 'expandEditor',
                imgurl:
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 16 16'%3E%3Cpath fill='%23000' fill-rule='evenodd' d='m4.354 12.354l8-8a.5.5 0 0 0-.708-.708l-8 8a.5.5 0 0 0 .708.708M1 10.5a.5.5 0 1 1 1 0v3a.5.5 0 0 0 .5.5h3a.5.5 0 1 1 0 1h-3A1.5 1.5 0 0 1 1 13.5zm14-5a.5.5 0 1 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 1 1 0-1h3A1.5 1.5 0 0 1 15 2.5z'/%3E%3C/svg%3E",
                hint: 'فتح في تبويب جديدة',
              }); */
          }

          /* */
          break;

        case 'Clicked_Button':
          if (values.Id === 'insertBarcode') {
            event.preventDefault();
            this.insertBarcode();
          }

          /*  if (values.Id === 'expandEditor') {
            window.open(
              `${window.location.origin}/imports-exports/${this.editorFileId}/editor`,
              '_blank'
            );
          } */

          break;

        case 'View_Added':
          /* ); */
          break;

        case 'Views_List':
          if (this.requestId && this.allowEdit) {
            //@ts-ignore
            const iframe = document.getElementById('office').contentWindow;
            const message = {
              MessageId: 'Insert_Button',
              SendTime: Date.now(),
              Values: {
                id: 'insertBarcode',
                imgurl:
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M1 19V5h2v14zm3 0V5h2v14zm3 0V5h1v14zm3 0V5h2v14zm3 0V5h3v14zm4 0V5h1v14zm3 0V5h3v14z'/%3E%3C/svg%3E",
                hint: 'ادراج باركود',
              },
            };

            iframe.postMessage(JSON.stringify(message), '*');
          }

          this.enableAutoSave();

          break;

        case 'Doc_ModifiedStatus':
          /*         setTimeout(() => {
            if (
              //@ts-ignore
              document
                .getElementById('office') //@ts-ignore
                .contentWindow.document.getElementsByClassName(
                  'cool-annotation rtl'
                ).length &&
              //@ts-ignore
              document
                .getElementById('office') //@ts-ignore
                .contentWindow.document.getElementsByClassName(
                  'cool-annotation rtl'
                )[0]
            ) {
              //@ts-ignore
              document
                .getElementById('office') //@ts-ignore
                .contentWindow.document.getElementsByClassName(
                  'cool-annotation rtl'
                )[0].style.transform = 'none';
            }
          }); */
          break;

        case 'Action_Load_Resp':
          break;
        default:
      }
    } catch (err) {
    }
  }

  enableAutoSave() {
    //@ts-ignore
    const iframe = document.getElementById('office').contentWindow;
    const message = {
      MessageId: 'Disable_Default_UIAction',
      Values: { action: 'UI_Save', disable: false },
    };

    iframe.postMessage(JSON.stringify(message), '*');
  }

  insertBarcode(): void {
    //TO save document UI_Save
    //@ts-ignore
    /* window.frames.socket.send(
      'save dontTerminateEdit=0 dontSaveIfUnmodified=0'
    ); */

    //@ts-ignore
    /*    document.getElementById('').contentWindow.postMessage(
      JSON.stringify({
        MessageId: 'Send_UNO_Command',
        Values: {
          Command: '.uno:UI_Save',
          Args: {
            Source: 'notebookbar',
          },
        },
      }),

      '*'
    ); */
    if (this.requestId) {
      try {
        if (this.isFrameReady && this.isHostReadySent) {
          //@ts-ignore
          const iframe = document.getElementById('office').contentWindow;
          //const imageUrl = `data:image/png;base64,${res}`; //'https://303030.info/image-resizer/w495/upload/157429119433811765.jpg';
          const message = {
            MessageId: 'Action_InsertGraphic',
            SendTime: Date.now(),
            Values: {
              filename: 'barcode.png',
              url: this.requestsService.getBarcodeUrl(this.requestId),
            },
          };
          iframe.postMessage(JSON.stringify(message), '*'); // Ensure this matches the PostMessageOrigin
          /* iframe.postMessage(
              JSON.stringify({
                MessageId: 'Action_InsertFile',
                Values: {
                  File: convertToIFormFile(res, 'barcode.png', '.png'), //`data:image/png;base64,${res}`, //convertToIFormFile(res, 'barcode.png', '.png'),
                },
              }),
              '*'
            ); */ // Ensure this matches the PostMessageOrigin
        } else {
          /* */
        }

        //@ts-ignore
        // document.getElementById('office').contentWindow.postMessage(
        /* JSON.stringify({
            MessageId: 'Action_InsertGraphic',
            url: `data:image/png;base64,${res}`,
            file: convertToIFormFile(res, 'barcode.png', '.png'),
          }), */
        //JSON.stringify({
        //    MessageId: 'Host_PostmessageReady',
        //    WOPIPostmessageReady: true, //convertToIFormFile(res, 'barcode.png', '.png'),
        //  }),
        //
        //   '*'
        // );

        //@ts-ignore
        /*    document.getElementById('office').contentWindow.postMessage(
            /* JSON.stringify({
              MessageId: 'Action_InsertGraphics',
              url: `data:image/png;base64,${res}`,
              file: convertToIFormFile(res, 'barcode.png', '.png'),
            }), */
        /*       JSON.stringify({
              MessageId: 'Action_InsertFile',
              Values: {
                File: `data:image/png;base64,${res}`, //convertToIFormFile(res, 'barcode.png', '.png'),
              },
            }),

            '*'
          ); */
      } catch (err) {
        }
    }
  }
}


