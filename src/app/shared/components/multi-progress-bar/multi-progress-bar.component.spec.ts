import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiProgressBarComponent } from './multi-progress-bar.component';

describe('MultiProgressBarComponent', () => {
  let component: MultiProgressBarComponent;
  let fixture: ComponentFixture<MultiProgressBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultiProgressBarComponent]
    });
    fixture = TestBed.createComponent(MultiProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
