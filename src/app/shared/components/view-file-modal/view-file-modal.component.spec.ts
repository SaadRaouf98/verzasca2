import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFileModalComponent } from './view-file-modal.component';

describe('ViewFileModalComponent', () => {
  let component: ViewFileModalComponent;
  let fixture: ComponentFixture<ViewFileModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFileModalComponent]
    });
    fixture = TestBed.createComponent(ViewFileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
