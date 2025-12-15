import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioritiesListComponent } from './priorities-list.component';

describe('PrioritiesListComponent', () => {
  let component: PrioritiesListComponent;
  let fixture: ComponentFixture<PrioritiesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrioritiesListComponent]
    });
    fixture = TestBed.createComponent(PrioritiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
