import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedContainersScrollableTableComponent } from './related-containers-scrollable-table.component';

describe('RelatedContainersScrollableTableComponent', () => {
  let component: RelatedContainersScrollableTableComponent;
  let fixture: ComponentFixture<RelatedContainersScrollableTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelatedContainersScrollableTableComponent]
    });
    fixture = TestBed.createComponent(RelatedContainersScrollableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
