import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleDescriptionFormComponent } from './title-description-form.component';

describe('TitleDescriptionFormComponent', () => {
  let component: TitleDescriptionFormComponent;
  let fixture: ComponentFixture<TitleDescriptionFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TitleDescriptionFormComponent],
    });
    fixture = TestBed.createComponent(TitleDescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
