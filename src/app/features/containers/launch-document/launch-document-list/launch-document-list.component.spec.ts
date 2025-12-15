import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchDocumentListComponent } from './launch-document-list.component';

describe('LaunchDocumentListComponent', () => {
  let component: LaunchDocumentListComponent;
  let fixture: ComponentFixture<LaunchDocumentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LaunchDocumentListComponent]
    });
    fixture = TestBed.createComponent(LaunchDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
