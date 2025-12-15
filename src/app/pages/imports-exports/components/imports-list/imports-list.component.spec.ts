import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportsListComponent } from './imports-list.component';

describe('ImportsExportsListComponent', () => {
  let component: ImportsListComponent;
  let fixture: ComponentFixture<ImportsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportsListComponent]
    });
    fixture = TestBed.createComponent(ImportsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
