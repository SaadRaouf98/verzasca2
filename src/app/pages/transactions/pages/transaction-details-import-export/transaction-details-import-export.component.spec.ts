import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionDetailsImportExportComponent } from './transaction-details-import-export.component';


describe('TransactionDetailsImportExportComponent', () => {
  let component: TransactionDetailsImportExportComponent;
  let fixture: ComponentFixture<TransactionDetailsImportExportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionDetailsImportExportComponent]
    });
    fixture = TestBed.createComponent(TransactionDetailsImportExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
