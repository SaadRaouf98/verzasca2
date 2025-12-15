/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UploadCommitteeApprovalFileModalComponent } from './upload-committee-approval-file-modal.component';

describe('UploadCommitteeApprovalFileModalComponent', () => {
  let component: UploadCommitteeApprovalFileModalComponent;
  let fixture: ComponentFixture<UploadCommitteeApprovalFileModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadCommitteeApprovalFileModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadCommitteeApprovalFileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
