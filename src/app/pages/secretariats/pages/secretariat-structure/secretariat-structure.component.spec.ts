import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretariatStructureComponent } from './secretariat-structure.component';

describe('SecretarialStructureComponent', () => {
  let component: SecretariatStructureComponent;
  let fixture: ComponentFixture<SecretariatStructureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecretariatStructureComponent],
    });
    fixture = TestBed.createComponent(SecretariatStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
