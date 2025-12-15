import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalPagePlaceholderComponent } from './normal-page-placeholder.component';

describe('NormalPagePlaceholderComponent', () => {
  let component: NormalPagePlaceholderComponent;
  let fixture: ComponentFixture<NormalPagePlaceholderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NormalPagePlaceholderComponent]
    });
    fixture = TestBed.createComponent(NormalPagePlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
