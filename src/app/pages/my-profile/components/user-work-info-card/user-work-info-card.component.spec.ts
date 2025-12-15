import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkInfoCardComponent } from './user-work-info-card.component';

describe('MyProfileComponent', () => {
  let component: UserWorkInfoCardComponent;
  let fixture: ComponentFixture<UserWorkInfoCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserWorkInfoCardComponent]
    });
    fixture = TestBed.createComponent(UserWorkInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
