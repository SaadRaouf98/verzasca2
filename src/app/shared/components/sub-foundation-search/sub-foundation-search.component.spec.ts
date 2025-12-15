import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubFoundationSearchComponent } from './sub-foundation-search.component';

describe('SubFoundationSearchComponent', () => {
  let component: SubFoundationSearchComponent;
  let fixture: ComponentFixture<SubFoundationSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubFoundationSearchComponent]
    });
    fixture = TestBed.createComponent(SubFoundationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
