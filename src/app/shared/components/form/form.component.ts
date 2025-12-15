import {Component, Input, Output, EventEmitter, OnInit, inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {NgbDate, NgbDateParserFormatter} from "@ng-bootstrap/ng-bootstrap";

// src/app/shared/form/field-config.model.ts
export interface Validation {
    name: string;
    validator: any;
    message: string;
}

/**
 * Option shape for select, radio, and autocomplete.
 */
export interface Option {
    id?: string;
    title?: string;
    titleEn?: string;
}

/**
 * Configuration for each form field.
 */
export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date-range';
    options?: Option[];
    value?: any;
    multiple?: boolean;
    validations?: Validation[];
    cssClass?: string;
    /** function to fetch options for autocomplete */
    searchFn?: (term: string) => Promise<Option[]>;
    filterOperator?: '=' | '<>' | '<' | '<=' | '>' | '>=' | 'contains' | 'startswith' | 'endswith';

    /** 🔍 If true, the field participates in searchRules (OR-filter block) */
    allowSearch?: boolean;
    /** Optional override to map a form field to a different filter field */
    filterTarget?: string;
}

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
    @Input() fields: FieldConfig[] = [];
    @Input() submitOnChangeInputValue: boolean = true;
    @Output() submitted = new EventEmitter<any>();
    formatter = inject(NgbDateParserFormatter);
    form!: FormGroup;
    /** holds autocomplete suggestions per field */
    suggestions: { [key: string]: Option[] } = {};

    constructor(private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.form = this.createControl();
        this.initAutoSearch();
        this.submitOnChangeInputValue ? this.submitOnChangeInputData() : ''
    }

    submitOnChangeInputData() {
        this.form.valueChanges.subscribe(data => {
            this.submitted.emit(this.form.value);
        })
    }

    private   createControl(): FormGroup {
        const group = this.fb.group({});
        this.fields.forEach(field => {
            if (field.type === 'date-range') {
                // nested group with start/end
                const startCtrl = this.fb.control(field.value?.start || '', this.bindValidations(field.validations || []));
                const endCtrl   = this.fb.control(field.value?.end   || '', this.bindValidations(field.validations || []));
                group.addControl(field.name, this.fb.group({
                    start: startCtrl,
                    end:   endCtrl
                }));
            } else {
                const ctrl = this.fb.control(
                    field.value || '',
                    this.bindValidations(field.validations || [])
                );
                group.addControl(field.name, ctrl);
            }
        });
        return group;
    }
    private markTouched(fg: FormGroup) {
        Object.values(fg.controls).forEach(ctrl => {
            if (ctrl instanceof FormGroup) {
                this.markTouched(ctrl);
            } else {
                ctrl.markAsTouched();
            }
        });
    }

    private bindValidations(validations: any[]) {
        return validations.length > 0
            ? Validators.compose(validations.map(v => v.validator))
            : null;
    }
    /** handle your Gregorian calendar output */
    onDateRangeChange(
        fieldName: string,
        range: { fromDate: NgbDate | null; toDate: NgbDate | null }
    ) {
        const dateGroup = this.form.get(fieldName) as FormGroup;
        dateGroup.patchValue({
            start:  range.fromDate,
            end:   range.toDate
        });
        dateGroup.markAllAsTouched();
    }
    private initAutoSearch(): void {
        this.fields.forEach(field => {
            if (field.type === 'text' && field.searchFn) {
                const control = this.form.get(field.name)!;
                control.valueChanges.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap(value => field.searchFn!(value))
                ).subscribe(results => {
                    this.suggestions[field.name] = results;
                });
            }
        });
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.submitted.emit(this.form.value);
        } else {
            this.validateAllFormFields(this.form);
        }
    }

    private validateAllFormFields(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(fieldName => {
            const control = formGroup.get(fieldName);
            if (control?.invalid) control.markAsTouched({onlySelf: true});
        });
    }
}

