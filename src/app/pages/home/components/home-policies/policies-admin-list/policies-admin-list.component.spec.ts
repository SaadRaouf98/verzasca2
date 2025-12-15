import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesAdminListComponent } from './policies-admin-list.component';

describe('PoliciesAdminListComponent', () => {
  let component: PoliciesAdminListComponent;
  let fixture: ComponentFixture<PoliciesAdminListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PoliciesAdminListComponent]
    });
    fixture = TestBed.createComponent(PoliciesAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
