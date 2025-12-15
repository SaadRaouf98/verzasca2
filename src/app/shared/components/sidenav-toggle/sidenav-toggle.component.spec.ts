import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavToggleComponent } from './sidenav-toggle.component';

describe('EditorComponent', () => {
  let component: SidenavToggleComponent;
  let fixture: ComponentFixture<SidenavToggleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidenavToggleComponent]
    });
    fixture = TestBed.createComponent(SidenavToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
