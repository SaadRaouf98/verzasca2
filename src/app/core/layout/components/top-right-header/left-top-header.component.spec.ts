import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftTopHeaderComponent } from './left-top-header.component';

describe('HeaderComponent', () => {
  let component: LeftTopHeaderComponent;
  let fixture: ComponentFixture<LeftTopHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeftTopHeaderComponent]
    });
    fixture = TestBed.createComponent(LeftTopHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
