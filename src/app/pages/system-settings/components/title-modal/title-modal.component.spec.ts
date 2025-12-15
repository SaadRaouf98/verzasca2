import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleModalComponent } from './title-modal.component';

describe('TitleModalComponent', () => {
  let component: TitleModalComponent;
  let fixture: ComponentFixture<TitleModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TitleModalComponent]
    });
    fixture = TestBed.createComponent(TitleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
