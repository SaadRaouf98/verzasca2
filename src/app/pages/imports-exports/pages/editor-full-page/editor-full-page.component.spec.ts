import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorFullPageComponent } from './editor-full-page.component';

describe('EditorFullPageComponent', () => {
  let component: EditorFullPageComponent;
  let fixture: ComponentFixture<EditorFullPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditorFullPageComponent]
    });
    fixture = TestBed.createComponent(EditorFullPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
