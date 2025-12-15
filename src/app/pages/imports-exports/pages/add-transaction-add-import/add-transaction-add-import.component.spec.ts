import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransactionAddImportComponent } from './add-transaction-add-import.component';

describe('AddTransactionAddImportComponent', () => {
  let component: AddTransactionAddImportComponent;
  let fixture: ComponentFixture<AddTransactionAddImportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTransactionAddImportComponent]
    });
    fixture = TestBed.createComponent(AddTransactionAddImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
