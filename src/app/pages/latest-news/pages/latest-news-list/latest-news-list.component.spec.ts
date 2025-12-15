import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestNewsListComponent } from './latest-news-list.component';

describe('LatestNewsListComponent', () => {
  let component: LatestNewsListComponent;
  let fixture: ComponentFixture<LatestNewsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LatestNewsListComponent]
    });
    fixture = TestBed.createComponent(LatestNewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
