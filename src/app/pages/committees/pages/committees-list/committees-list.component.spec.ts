import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteesListComponent } from './committees-list.component';

describe('CommitteesListComponent', () => {
  let component: CommitteesListComponent;
  let fixture: ComponentFixture<CommitteesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitteesListComponent]
    });
    fixture = TestBed.createComponent(CommitteesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
