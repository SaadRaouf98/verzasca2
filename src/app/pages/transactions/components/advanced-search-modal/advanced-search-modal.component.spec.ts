import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchModalComponent } from './advanced-search-modal.component';

describe('AdvancedSearchModalComponent', () => {
  let component: AdvancedSearchModalComponent;
  let fixture: ComponentFixture<AdvancedSearchModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancedSearchModalComponent]
    });
    fixture = TestBed.createComponent(AdvancedSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
