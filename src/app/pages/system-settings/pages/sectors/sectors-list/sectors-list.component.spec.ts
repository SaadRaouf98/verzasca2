import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorsListComponent } from './sectors-list.component';

describe('SectorsListComponent', () => {
  let component: SectorsListComponent;
  let fixture: ComponentFixture<SectorsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SectorsListComponent]
    });
    fixture = TestBed.createComponent(SectorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
