import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbersAndTransactionsCardComponent } from './numbers-and-transactions-card.component';

describe('MyProfileComponent', () => {
  let component: NumbersAndTransactionsCardComponent;
  let fixture: ComponentFixture<NumbersAndTransactionsCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NumbersAndTransactionsCardComponent]
    });
    fixture = TestBed.createComponent(NumbersAndTransactionsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
