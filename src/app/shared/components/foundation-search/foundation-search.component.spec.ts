import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundationSearchComponent } from './foundation-search.component';

describe('FoundationSearchComponent', () => {
  let component: FoundationSearchComponent;
  let fixture: ComponentFixture<FoundationSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FoundationSearchComponent]
    });
    fixture = TestBed.createComponent(FoundationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
