import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRightHeaderComponent } from './top-right-header.component';

describe('HeaderComponent', () => {
  let component: TopRightHeaderComponent;
  let fixture: ComponentFixture<TopRightHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TopRightHeaderComponent]
    });
    fixture = TestBed.createComponent(TopRightHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
