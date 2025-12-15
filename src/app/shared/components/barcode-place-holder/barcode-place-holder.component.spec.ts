import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodePlaceHolderComponent } from './barcode-place-holder.component';

describe('BarcodePlaceHolderComponent', () => {
  let component: BarcodePlaceHolderComponent;
  let fixture: ComponentFixture<BarcodePlaceHolderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BarcodePlaceHolderComponent]
    });
    fixture = TestBed.createComponent(BarcodePlaceHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
