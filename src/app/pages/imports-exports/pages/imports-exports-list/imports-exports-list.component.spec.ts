import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportsExportsListComponent } from './imports-exports-list.component';

describe('ImportsExportsListComponent', () => {
  let component: ImportsExportsListComponent;
  let fixture: ComponentFixture<ImportsExportsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportsExportsListComponent]
    });
    fixture = TestBed.createComponent(ImportsExportsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
