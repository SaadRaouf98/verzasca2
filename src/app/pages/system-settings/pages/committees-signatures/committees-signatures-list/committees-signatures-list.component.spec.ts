import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteesSignaturesListComponent } from './committees-signatures-list.component';

describe('CommitteesSignaturesListComponent', () => {
  let component: CommitteesSignaturesListComponent;
  let fixture: ComponentFixture<CommitteesSignaturesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitteesSignaturesListComponent]
    });
    fixture = TestBed.createComponent(CommitteesSignaturesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
