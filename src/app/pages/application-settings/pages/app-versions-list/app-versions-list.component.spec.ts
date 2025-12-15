import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppVersionsListComponent } from './app-versions-list.component';

describe('AppVersionsListComponent', () => {
  let component: AppVersionsListComponent;
  let fixture: ComponentFixture<AppVersionsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppVersionsListComponent]
    });
    fixture = TestBed.createComponent(AppVersionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
