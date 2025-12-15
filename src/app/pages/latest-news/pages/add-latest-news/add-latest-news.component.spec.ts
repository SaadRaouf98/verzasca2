import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLatestNewsComponent } from './add-latest-news.component';

describe('AddLatestNewsComponent', () => {
  let component: AddLatestNewsComponent;
  let fixture: ComponentFixture<AddLatestNewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddLatestNewsComponent]
    });
    fixture = TestBed.createComponent(AddLatestNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
