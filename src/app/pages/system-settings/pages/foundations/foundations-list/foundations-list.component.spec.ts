import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundationsListComponent } from './foundations-list.component';

describe('FoundationsListComponent', () => {
  let component: FoundationsListComponent;
  let fixture: ComponentFixture<FoundationsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FoundationsListComponent]
    });
    fixture = TestBed.createComponent(FoundationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
