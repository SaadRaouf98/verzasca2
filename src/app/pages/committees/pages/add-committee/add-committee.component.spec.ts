import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommitteeComponent } from './add-committee.component';

describe('AddCommitteeComponent', () => {
  let component: AddCommitteeComponent;
  let fixture: ComponentFixture<AddCommitteeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCommitteeComponent]
    });
    fixture = TestBed.createComponent(AddCommitteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
