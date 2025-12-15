import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretariatsListComponent } from './secretariats-list.component';

describe('SecretarialsListComponent', () => {
  let component: SecretariatsListComponent;
  let fixture: ComponentFixture<SecretariatsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecretariatsListComponent],
    });
    fixture = TestBed.createComponent(SecretariatsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
