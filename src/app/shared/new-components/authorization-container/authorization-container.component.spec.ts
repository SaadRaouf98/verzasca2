import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationContainerComponent } from './authorization-container.component';

describe('AuthorizationContainerComponent', () => {
  let component: AuthorizationContainerComponent;
  let fixture: ComponentFixture<AuthorizationContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthorizationContainerComponent]
    });
    fixture = TestBed.createComponent(AuthorizationContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
