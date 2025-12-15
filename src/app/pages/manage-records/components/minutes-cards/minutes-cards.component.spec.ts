import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinutesCardsComponent } from './minutes-cards.component';

describe('ViewCommentModalComponent', () => {
  let component: MinutesCardsComponent;
  let fixture: ComponentFixture<MinutesCardsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MinutesCardsComponent],
    });
    fixture = TestBed.createComponent(MinutesCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
