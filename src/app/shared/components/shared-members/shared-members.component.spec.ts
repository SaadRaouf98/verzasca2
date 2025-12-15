import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedMembersComponent } from './shared-members.component';

describe('SharedMembersComponent', () => {
  let component: SharedMembersComponent;
  let fixture: ComponentFixture<SharedMembersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SharedMembersComponent]
    });
    fixture = TestBed.createComponent(SharedMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
