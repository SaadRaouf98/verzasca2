import { Injectable } from '@angular/core';
import { BehaviorSubject  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageLoaderService {

  constructor() { }
  public isLoading = new BehaviorSubject(false);
}
