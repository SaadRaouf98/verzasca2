import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActorComponent } from './add-actor.component';

describe('AddActorComponent', () => {
  let component: AddActorComponent;
  let fixture: ComponentFixture<AddActorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddActorComponent]
    });
    fixture = TestBed.createComponent(AddActorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
