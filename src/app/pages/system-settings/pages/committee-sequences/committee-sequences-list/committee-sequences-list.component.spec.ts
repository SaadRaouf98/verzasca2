import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeSequencesListComponent } from './committee-sequences-list.component';

describe('CommitteeSequencesListComponent', () => {
  let component: CommitteeSequencesListComponent;
  let fixture: ComponentFixture<CommitteeSequencesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitteeSequencesListComponent]
    });
    fixture = TestBed.createComponent(CommitteeSequencesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
