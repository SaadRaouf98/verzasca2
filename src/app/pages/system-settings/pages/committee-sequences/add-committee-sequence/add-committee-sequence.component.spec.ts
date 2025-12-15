import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommitteeSequenceComponent } from './add-committee-sequence.component';

describe('AddCommitteeSequenceComponent', () => {
  let component: AddCommitteeSequenceComponent;
  let fixture: ComponentFixture<AddCommitteeSequenceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCommitteeSequenceComponent]
    });
    fixture = TestBed.createComponent(AddCommitteeSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
