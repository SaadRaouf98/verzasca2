import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSectorPage } from './add-sector.component';

describe('SectorsFormComponent', () => {
  let component: AddSectorPage;
  let fixture: ComponentFixture<AddSectorPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSectorPage],
    });
    fixture = TestBed.createComponent(AddSectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
