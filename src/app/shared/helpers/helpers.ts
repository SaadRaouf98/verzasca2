import { FormGroup } from '@angular/forms';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { RequestStatus } from '@core/enums/request-status.enum';
import { EditorStreamType } from '@shared/enums/editor-stream-type.enum';
import { Observable, Subject } from 'rxjs';

export function isTouched(
  form: FormGroup,
  controlName: string,
  parentFormName?: string
): boolean | undefined {
  if (form)
    return parentFormName
      ? form.get(parentFormName)?.get(controlName)?.touched
      : form.get(controlName)?.touched;
  return false;
}

export function isSmallDeviceWidthForPopup(): boolean {
  if (window.innerWidth < 768) {
    return true;
  } else {
    return false;
  }
}

export function isSmallDeviceWidthForTable(width = 992): boolean {
  if (window.innerWidth < width) {
    return true;
  } else {
    return false;
  }
}

export function readFileAsUrl(
  file: File | Blob
): Observable<string | ArrayBuffer> {
  const reader = new FileReader();
  let url: Subject<string | ArrayBuffer> = new Subject<string | ArrayBuffer>();
  reader.onload = (e) => {
    //@ts-ignore
    url.next(reader.result);
    url.complete();
  };
  reader.readAsDataURL(file);
  return url;
}

export function getBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export const streamTypeMapper: { [key: string]: EditorStreamType } = {
  '.docx': EditorStreamType.WordprocessingML,
  '.doc': EditorStreamType.MSWord,
  '.pdf': EditorStreamType.AdobePDF,
  '.txt': EditorStreamType.PlainText,
  '.html': EditorStreamType.HTMLFormat,
  '.spread-sheet': EditorStreamType.SpreadsheetML,
};

export const convertToIFormFile = (
  base64Str: string,
  fileName: string,
  fileExtension: string
) => {
  let fileType =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (fileExtension === '.pdf') {
    fileType = 'application/pdf';
  }
  const byteCharacters = atob(base64Str);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i));
  }

  const byteArray = new Uint8Array(byteArrays);

  const blob = new Blob([byteArray], {
    type: fileType,
  });
  const file = new File([blob], fileName, {
    type: fileType,
  });

  const url = window.URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.download = fileName;
  anchor.href = url;
  anchor.click();

  return file;
};

export const objectToFormData = (obj: any) => {
  const formData = new FormData();
  function appendValue(key: string, value: any) {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const nestedKey = item instanceof File ? key : `${key}[${index}]`;
        appendValue(nestedKey, item);
      });
    } else if (value instanceof Date) {
      formData.append(key, value.toLocaleString());
    } else if (typeof value === 'object' && value !== null) {
      appendObject(key, value); // Recursively handle nested objects
    } else if (value !== null && value !== undefined) {
      formData.append(key, value.toString()); // Convert to string before appending
    }
  }
  function appendObject(key: string, nestedObj: any) {
    Object.keys(nestedObj).forEach((propKey) => {
      const nestedKey = `${key ? `${key}.` : ''}${propKey}`;
      appendValue(nestedKey, nestedObj[propKey]);
    });
  }
  appendObject('', obj); // Start recursion from the root object
  return formData;
};

export const dataURLtoFile = (dataurl: string, filename: string) => {
  var arr = dataurl.split(','),
    mime = arr[0]!.match(/:(.*?);/)![1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const isWordFile = (fileName: string) => {
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return true;
  return false;
};

export const isPdfFile = (fileName: string) => {
  if (fileName.endsWith('.pdf')) return true;
  return false;
};

export const base64ToArrayBuffer = (base64: string) => {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

//Pass to this function either a file of type 'Blob' or 'File'
export const downloadBlobOrFile = (
  fileName: string,
  blob: Blob | undefined = undefined,
  file: File | undefined = undefined
) => {
  let url = '';
  if (file) {
    url = window.URL.createObjectURL(file);
  } else if (blob) {
    url = window.URL.createObjectURL(new File([blob], fileName));
  }
  const anchor = document.createElement('a');
  anchor.download = fileName;
  anchor.href = url;
  anchor.click();
};

export const b64toBlob = (
  b64Data: string,
  contentType = '',
  sliceSize = 512
) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const blobToBase64 = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Get only the Base64 part of the Data URL
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const compareFn = (
  obj1: { id: string; name?: string; title?: string; titleEn?: string },
  obj2: { id: string; name?: string; title?: string; titleEn?: string }
): boolean => {
  return obj1?.id === obj2?.id;
};

export const allRequestStatus = [
  {
    id: RequestStatus.Initiated,
    name: 'shared.initiated',
  },
  {
    id: RequestStatus.InProgress,
    name: 'shared.inProgress',
  },
  {
    id: RequestStatus.Signing,
    name: 'shared.signing',
  },
  {
    id: RequestStatus.CommitteeApproval,
    name: 'shared.committeeApproval',
  },
  {
    id: RequestStatus.Scheduled,
    name: 'TransactionsModule.TransactionsListComponent.scheduled',
  },
  {
    id: RequestStatus.Held,
    name: 'shared.held',
  },
  {
    id: RequestStatus.Exported,
    name: 'shared.exported',
  },
  {
    id: RequestStatus.Archived,
    name: 'shared.archived',
  },
  {
    id: RequestStatus.Rejected,
    name: 'shared.rejected',
  },
  {
    id: RequestStatus.Done,
    name: 'shared.isDone',
  },
  {
    id: RequestStatus.Closed,
    name: 'shared.closed',
  },
  {
    id: RequestStatus.ForceClosed,
    name: 'shared.forceClosed',
  },
  {
    id: RequestStatus.Reset,
    name: 'shared.reset',
  },
];

export const allExportTypes = [
  {
    id: ExportedDocumentType.Letter,
    name: 'TransactionsModule.ExportDocumentComponent.letter',
  },
  {
    id: ExportedDocumentType.Note,
    name: 'TransactionsModule.ExportDocumentComponent.note',
  },
  {
    id: ExportedDocumentType.Record,
    name: 'TransactionsModule.ExportDocumentComponent.record',
  },
];

export const formatDateToYYYYMMDD = (date: Date): string => {
  var day = date.getDate(); // yields date
  var month = date.getMonth() + 1; // yields month (add one as '.getMonth()' is zero indexed)
  var year = date.getFullYear(); // yields year

  return (
    year +
    '-' +
    (month < 10 ? `0${month}` : month) +
    '-' +
    (day < 10 ? `0${day}` : day)
  );
};

export const removeFirstAndLastChar = (str: string, char: string) => {
  // Check if the string starts with the specified character
  if (str.startsWith(char)) {
    str = str.substring(1); // Remove the first character
  }

  // Check if the string ends with the specified character
  if (str.endsWith(char)) {
    str = str.substring(0, str.length - 1); // Remove the last character
  }

  return str;
};

export const removeSpecialCharacters = (str: string) => {
  // Replace backslashes with an empty string or handle it as required
  return str.replace(/\\/g, '');
};

export const formatDateToTimeInAMPM = (date: Date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes + '';
  var strTime = hours + ':' + minutesStr + ' ' + ampm;
  return strTime;
};

export const padToFourDigits = (number: number) => {
  return number.toString().padStart(4, '0');
};

export const convertEnglishToArabicNumbers = (englishStr: string) => {
  if (englishStr) {
    const englishToArabicMap: { [key: string]: string } = {
      '0': '٠',
      '1': '١',
      '2': '٢',
      '3': '٣',
      '4': '٤',
      '5': '٥',
      '6': '٦',
      '7': '٧',
      '8': '٨',
      '9': '٩',
    };

    return englishStr.replace(/\d/g, (digit) => englishToArabicMap[digit]);
  }

  return '';
};

export const sharePointFileNameRegularExpression =
  /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9(). _-]{1,150}$/;

