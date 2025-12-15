import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposedStudyDetailsComponent } from './proposed-study-details.component';

describe('ProposedStudyDetailsComponent', () => {
  let component: ProposedStudyDetailsComponent;
  let fixture: ComponentFixture<ProposedStudyDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProposedStudyDetailsComponent]
    });
    fixture = TestBed.createComponent(ProposedStudyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
