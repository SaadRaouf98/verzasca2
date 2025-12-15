import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Entity } from '@core/models/entity.model';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { FormMode } from '@shared/enums/form-mode.enum';
import { isTouched } from '@shared/helpers/helpers';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-title-description-form',
  templateUrl: './title-description-form.component.html',
  styleUrls: ['./title-description-form.component.scss'],
})
export class TitleDescriptionFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  FormMode = FormMode;
  disableTitle: boolean = false;

  @Input() formDataObservable!: Observable<Entity>;
  @Input() formMode!: FormMode;

  @Output('submit') submit: EventEmitter<Entity> = new EventEmitter<Entity>();
  @Output('cancel') cancel: EventEmitter<void> = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.formDataObservable) {
      this.formDataObservable.subscribe({
        next: (res) => {
          this.patchForm(res);
        },
      });
    }
    if (this.formMode === FormMode.View) {
      this.form.disable();
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [
        Validators.required,
        Validators.pattern(arabicRegex),
      ]),
      titleEn: new FormControl('', [
        Validators.required,
        Validators.pattern(englishRegex),
      ]),
      description: new FormControl('', [Validators.pattern(arabicRegex)]),
      descriptionEn: new FormControl('', [Validators.pattern(englishRegex)]),
    });
  }

  patchForm(data: Entity): void {
    this.form.patchValue(data);
    if (data.isDefault) {
      this.form.get('title')?.disable();
      this.form.get('titleEn')?.disable();
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    this.submit.emit(this.form.value);
  }

  onCancel() {
    //this.form.reset();
    this.cancel.emit();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  ngOnDestroy(): void {
    this.cancel.unsubscribe();
    this.submit.unsubscribe();
  }
}
