import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerOutcomesListComponent } from './container-outcomes-list.component';

describe('ContainerOutcomesListComponent', () => {
  let component: ContainerOutcomesListComponent;
  let fixture: ComponentFixture<ContainerOutcomesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerOutcomesListComponent]
    });
    fixture = TestBed.createComponent(ContainerOutcomesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
