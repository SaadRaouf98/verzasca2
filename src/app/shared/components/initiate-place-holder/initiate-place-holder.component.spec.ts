import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiatePlaceHolderComponent } from './initiate-place-holder.component';

describe('InitiatePlaceHolderComponent', () => {
  let component: InitiatePlaceHolderComponent;
  let fixture: ComponentFixture<InitiatePlaceHolderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InitiatePlaceHolderComponent]
    });
    fixture = TestBed.createComponent(InitiatePlaceHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
