import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DropzoneService {
  private subject = new Subject<any>();

  setRemoveImageAction(cancelImage: boolean) {
    this.subject.next({ cancelImage: cancelImage });
  }

  getImageRemoveAction(): Observable<any> {
    return this.subject.asObservable();
  }
}
