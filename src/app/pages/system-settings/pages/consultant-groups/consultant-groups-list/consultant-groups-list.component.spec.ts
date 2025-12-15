import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantGroupsListComponent } from './consultant-groups-list.component';

describe('ConsultantGroupsListComponent', () => {
  let component: ConsultantGroupsListComponent;
  let fixture: ComponentFixture<ConsultantGroupsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantGroupsListComponent]
    });
    fixture = TestBed.createComponent(ConsultantGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
