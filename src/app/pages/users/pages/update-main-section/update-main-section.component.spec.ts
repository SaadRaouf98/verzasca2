import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMainSectionComponent } from './update-main-section.component';

describe('UpdateMainSectionComponent', () => {
  let component: UpdateMainSectionComponent;
  let fixture: ComponentFixture<UpdateMainSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateMainSectionComponent]
    });
    fixture = TestBed.createComponent(UpdateMainSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
