import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchDocumentMainComponent } from './launch-document-main.component';

describe('LaunchDocumentMainComponent', () => {
  let component: LaunchDocumentMainComponent;
  let fixture: ComponentFixture<LaunchDocumentMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LaunchDocumentMainComponent]
    });
    fixture = TestBed.createComponent(LaunchDocumentMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
