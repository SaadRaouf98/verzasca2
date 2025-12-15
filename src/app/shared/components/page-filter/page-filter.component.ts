import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActionType } from '@core/enums/action-type.enum';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';
import { Attachment } from '@core/models/request.model';
import { AllUsers } from '@core/models/user.model';
import { AuthService } from '@core/services/auth/auth.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { EditorEditMode } from '@shared/enums/editor-edit-mode.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  downloadBlobOrFile,
  getBase64,
  isTouched,
  isWordFile,
  streamTypeMapper,
} from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';

import { Observable, map, Subscription } from 'rxjs';
import { FilterDef } from '@shared/models/filter.interface';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-page-filter',
  templateUrl: './page-filter.component.html',
  styleUrls: ['./page-filter.component.scss'],
})
export class PageFilterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filters: FilterDef[] = [];
  @Input() syncQueryParams = false;
  @Input() data: { [key: string]: any } = {};
  @Output() apply = new EventEmitter<{ [key: string]: any }>();
  @Output() reset = new EventEmitter<void>();
  formatter = inject(NgbDateParserFormatter);
  form!: FormGroup;
  private sub?: Subscription;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.buildForm();
    if (this.syncQueryParams) {
      this.sub = this.route.queryParams.subscribe((params) => this.patchFromQuery(params));
    } else {
      this.patchFromData(this.data);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.buildForm();
      this.syncQueryParams
        ? this.patchFromQuery(this.route.snapshot.queryParams)
        : this.patchFromData(this.data);
    }
    if (changes['data'] && !this.syncQueryParams) {
      this.patchFromData(this.data);
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private buildForm() {
    const group: any = {};
    this.filters.forEach((f) => {
      if (f.type === 'daterange') {
        group[f.id] = this.fb.group({ from: [null], to: [null] });
      } else {
        const defaultValue = f.type === 'select' && f.multiple ? [] : null;
        group[f.id] = [defaultValue];
      }
    });
    this.form = this.fb.group(group);
  }

  private patchFromQuery(qp: Params) {
    const vals: any = {};
    this.filters.forEach((f) => {
      if (f.type === 'daterange') {
        vals[f.id] = {
          from: qp[`${f.id}_from`] || null,
          to: qp[`${f.id}_to`] || null,
        };
      } else if (f.type === 'select' && f.multiple) {
        const v = qp[f.id];
        vals[f.id] = Array.isArray(v) ? v : v != null ? [v] : [];
      } else {
        vals[f.id] = qp[f.id] || null;
      }
    });
    this.form.patchValue(vals);
  }

  private patchFromData(valsIn: { [key: string]: any }) {
    const vals: any = {};
    this.filters.forEach((f) => {
      if (f.type === 'daterange') {
        vals[f.id] = { from: valsIn[f.id]?.from || null, to: valsIn[f.id]?.to || null };
      } else if (f.type === 'select' && f.multiple) {
        const v = valsIn[f.id];
        vals[f.id] = Array.isArray(v) ? v : v != null ? [v] : [];
      } else {
        vals[f.id] = valsIn[f.id] || null;
      }
    });
    this.form.patchValue(vals);
  }

  onDateRangeChange(field: string, range: { fromDate: any; toDate: any }) {
    this.form.get(field)?.patchValue({
      from: this.formatter.format(range.fromDate),
      to: this.formatter.format(range.toDate),
    });
  }

  onApply() {
    const vals = this.form.value;
    if (this.syncQueryParams) {
      const qp: any = {};
      this.filters.forEach((f) => {
        if (f.type === 'daterange') {
          qp[`${f.id}_from`] = vals[f.id]?.from || null;
          qp[`${f.id}_to`] = vals[f.id]?.to || null;
        } else {
          qp[f.id] = vals[f.id] ?? (f.type === 'select' && f.multiple ? [] : null);
        }
      });
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: qp,
        queryParamsHandling: 'merge',
      });
    }
    this.apply.emit(vals);
  }

  onReset() {
    this.buildForm();
    if (this.syncQueryParams) {
      this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    }
    this.reset.emit();
  }
}
