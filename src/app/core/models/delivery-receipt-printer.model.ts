import { AllDeliveryReceipt, DeliveryReceipt } from './delivery-receipt.model';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { DeliveryReceiptAttachmentType } from '@core/enums/delivery-receipt-attachment-type.enum';

export class DeliveryReceiptPrinter {
  /* static openPrinterWindow(data: DeliveryReceipt[]) {
    let htmlString = `
    <html id="">
    <head>
      <title>طباعة بيانات التسليم</title>
      <style>
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 13px;
    font-family: Calibri;
  }

  .body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 96vh;
  }

  .tables-container {
    width: 95%;
    display: flex;
    margin-right: auto;
    margin-left: auto;
  }

  table {
    width: 100%;
    border: 1px solid #cdcdcd;
    border-collapse: collapse;
  }

  thead tr {
    background: #cdcdcd;
  }

  thead th {
    border: 1px solid black;
    font-size: 0.875rem;
    padding-block: 0.5rem;
  }

  th {
    text-align: center;
  }

  table,
  td {
    border: 1px solid black;
  }

  tbody td {
    text-align: center;
  }
</style>

      </head>

      <body id="print-me" >
      <div class="header" >
          <div style="flex-basis: 25%">
            <p>أمانة اللجنة المالية</p>
            <p>الديوان الملكي</p>
            <p>الرياض</p>
          </div>

          <div  style="text-align: center; flex-basis: 25%">
            <p>بيان قيد المعاملات الصادرة</p>
          </div>

          <div style="text-align: left; flex-basis: 25%">
            <p>رقم البيان: <span>6357</span></p>
            <p style="height: 10px"></p>
            <p>التاريخ: م<span>2024/5/21 - ه13/11/1445</span></p>
          </div>
      </div>

<div class="body">
  <div class="tables-container">
    <div style="flex-basis: 65%; padding: 1px; border: 1px solid black">
      <table>
        <thead>
          <tr>
            <th colspan="10">بيان المعاملات الصادرة</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th colspan="1">رقم الصادر</th>
            <th colspan="2">تاريخ الصادر</th>
            <th colspan="1">نوع الصادر</th>
            <th colspan="3">المرفقات</th>
            <th colspan="3">الجهة المرسل اليها</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="1">2240</td>
            <td colspan="2">2024/5/21 - ه13/11/1445</td>
            <td colspan="1">أصل مذكرة</td>
            <td colspan="3"></td>
            <td colspan="3">
              <p>الديوان الملكي</p>
              <p>أدارة اللجان</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div></div>
    <div style="flex-basis: 34%; padding: 1px; border: 1px solid black">
      <table>
        <thead>
          <tr>
            <th colspan="5">بيانات الاستلام</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الاسم</th>
            <th>التوقيع</th>
          </tr>
        </thead>
        <tbody>
          <tr colspan="5" style="height: 55px"></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div style="padding: 0 5em">
    <p>المراسل/</p>
    <p>........................</p>
  </div>
</div>
      </body>
    </html>
    `;
    let childWindow: Window | null = window.open('', '', 'fullscreen=yes');

    childWindow!.document.body.insertAdjacentHTML(
      'afterbegin',
      `<div id="parent" style="direction: rtl;"> ${htmlString} </div>`
    );
    setTimeout(function () {
      html2canvas(document.getElementById('parent')!).then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png');
        let pdf = new jspdf({
          orientation: 'l',
          unit: 'pt',
          format: [canvas.width, canvas.height], // set needed dimensions for any element
        }); // A4 size page of PDF
        let position = 0;
        pdf.addImage(
          contentDataURL,
          'PNG',
          0,
          position,
          canvas.width,
          canvas.height
        );

        window!.open(pdf.output('bloburl'), '_blank', 'popup=yes');
        pdf.save('بيان التسليم.pdf'); // Generated PDF
      });
    }, 10);
  } */

  static getHTMLString(arr: AllDeliveryReceipt[]): string {
    let html = '';

    arr.forEach((data) => {
      html += `
      <style>
      @page {
        size: A4;
        margin: 4.5%;
      }

      @media print
      {
          .body {
            height: 63vh;
          }
            
        .receipt-container{
              display: block;
              width: 100vh; /* Use the viewport height for width */
              height: 100vw; /* Use the viewport width for height */
              transform: rotate(90deg); /* Rotate the content */
              transform-origin: left top; /* Set the origin to rotate from */
              position: absolute;
              left: 100%;
              margin: -10px;
        }

          *{
            line-height: 2px;
          }

          /* thead tr {
            background-color: #cdcdcd !important;
            print-color-adjust: exact; 
          } */

          thead th {
            padding-block: 0.5rem !important;
          }
      }

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 13px;
    font-family: Calibri;
    font-family: Arial Unicode MS;
    direction: rtl;

  }

  .body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    font-family: Arial Unicode MS;
    direction: rtl;
    margin-bottom: 0px;
    
  }

  .tables-container {
    width: 95%;
    display: flex;
    margin-right: auto;
    margin-left: auto;
  }

  table {
    width: 100%;
    border: 1px solid #cdcdcd;
    border-collapse: collapse;
  }

  thead tr {
    background: #cdcdcd;
  }

  thead th {
    border: 1px solid black;
    font-size: 0.875rem;
    padding-block: 0.5rem;
  }

  th {
    text-align: center;
  }

  table,
  td {
    border: 1px solid black;
  }

  tbody td {
    text-align: center;
  }
</style>

<div class="receipt-container">
      <div class="header" >
          <div style="flex-basis: 25%">
            <p>أمانة اللجنة المالية</p>
            <p>الديوان الملكي</p>
            <p>الرياض</p>
          </div>

          <div  style="text-align: center; flex-basis: 25%">
            <p>بيان قيد المعاملات الصادرة</p>
          </div>

          <div style="text-align: left; flex-basis: 25%">
            <p>رقم البيان: <span>${data.autoNumber}</span></p>
            <p style="height: 10px"></p>
            <p>التاريخ: <span> ${data.hijriDate}ھ -`;

      const day = new Date(data.date).getDate();
      const month = new Date(data.date).getMonth() + 1;
      const year = new Date(data.date).getFullYear();

      html += `${year + '/' + month + '/' + day}م</span></p>
          </div>
      </div>

<div class="body">
  <div class="tables-container">
    <div style="flex-basis: 65%; padding: 1px; border: 1px solid black">
      <table>
        <thead>
          <tr>
            <th colspan="10">بيان المعاملات الصادرة</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th colspan="1">رقم الصادر</th>
            <th colspan="2">تاريخ الصادر</th>
            <th colspan="1">نوع الصادر</th>
            <th colspan="2">الأهمية</th>
            <th colspan="3">المرفقات</th>
            <th colspan="3">الجهة المرسل اليها</th>
          </tr>
        </thead>
        <tbody>`;

      for (const row of data.items) {
        let attachmentType = '';

        if (row.attachmentType === DeliveryReceiptAttachmentType.Original) {
          attachmentType = 'اصل';
        } else if (row.attachmentType === DeliveryReceiptAttachmentType.Copy) {
          attachmentType = 'صورة';
        } else if (row.attachmentType === DeliveryReceiptAttachmentType.USB) {
          attachmentType = 'فلاش';
        } else if (row.attachmentType === DeliveryReceiptAttachmentType.Other) {
          attachmentType = row.otherAttachmentType;
        }

        let documentType = '';
        if (row.documentType === ExportedDocumentType.Letter) {
          documentType = 'خطاب';
        } else if (row.documentType === ExportedDocumentType.Note) {
          documentType = 'مذكرة';
        } else if (row.documentType === ExportedDocumentType.Record) {
          documentType = 'محضر';
        }

        const day = new Date(row.exportedDate).getDate();
        const month = new Date(row.exportedDate).getMonth() + 1;
        const year = new Date(row.exportedDate).getFullYear();

        html += `  <tr style="height: 55px" >
              <td colspan="1">${row.autoNumber ?? ''}</td>
              <td colspan="2">
              <p>${row.hijriExportedDate}ھ-</p>
              <p>${year + '/' + month + '/' + day}م</p>
              </td>
              <td colspan="1"><p>${attachmentType ?? ''} </p> <p>${
          documentType ?? ''
        }</p></td>
                      <td colspan="2">${row.priority?.title ?? ''}</td>

              <td colspan="3">${row.attachments ?? ''}</td>
              <td colspan="3">
                <p>${row.foundation.title}</p>
                <p>${
                  row.subFoundation?.title ?? row.foundationDescription ?? ''
                }</p>
              </td>
            </tr>`;
      }

      html += ` </tbody>
      </table>
    </div>

    <div></div>
    <div style="flex-basis: 34%; padding: 1px; border: 1px solid black">
      <table>
        <thead>
          <tr>
            <th colspan="5">بيانات الاستلام</th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الاسم</th>
            <th>التوقيع</th>
          </tr>
        </thead>
        <tbody>
          <tr colspan="5" style="height: 55px"></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div style="padding: 0 5em;">
    <p>المراسل/</p>
    <p>........................</p>
  </div>
</div>
</div>
    `;
    });

    return html;
  }
}
