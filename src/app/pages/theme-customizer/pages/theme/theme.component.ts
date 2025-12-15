import {Component} from '@angular/core';
import { Validators} from '@angular/forms';
import {FilterDef} from "@shared/models/filter.interface";
import {FieldConfig, Option} from "@shared/components/form/form.component";
import {FormFilterMapper} from "@shared/models/form-filter-mapper";
import {DataService} from "@shared/services/data.service";
import {generateFilterRules} from "@shared/models/generate-filter-rules";

@Component({
    selector: 'app-theme',
    templateUrl: './theme.component.html',
    styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent {
    cols = [
        {key: 'id', label: 'ID'},
        {key: 'name', label: 'Name'},
        {key: 'email', label: 'Email'}
    ];
    // static options example
    private allUsers: Option[] = [
        {id: '1', title: 'Alice Anderson', titleEn: 'Alice Anderson'},
        {id: '7', title: 'Alice Anderson1', titleEn: 'Alice Anderson1'},
        {id: '6', title: 'Alice Anderson2', titleEn: 'Alice Anderson2'},
        {id: '5', title: 'Alice Anderson3', titleEn: 'Alice Anderson3'},
        {id: '2', title: 'Bob Brown', titleEn: 'Bob Brown'},
        {id: '3', title: 'Carol Clark', titleEn: 'Carol Clark'}
    ];
    items: { id: number; name: string; email: string }[] = [];
    total = 0;
    pageSize = 5;
    currentPage = 0;
    sortKey = '';
    sortDirection: 'asc' | 'desc' = 'asc';
    filterText = '';
    fields: FieldConfig[] = [
        {
            name: 'username',
            label: 'Username',
            type: 'text',
            cssClass: 'col-6',
            allowSearch: true,
            validations: [{name: 'required', validator: Validators.required, message: 'Username is required'}],
            searchFn: term => Promise.resolve(this.allUsers.filter(u =>
                u.title?.toLowerCase().includes(term.toLowerCase())))
        },
        {
            name: 'firstName',
            label: 'First Name',
            allowSearch: true,
            type: 'text',
            cssClass: 'col-6',
            validations: [{name: 'required', validator: Validators.required, message: 'First Name is required'}]
        },
        {
            name: 'email',
            label: 'Email Address',
            cssClass: 'col-6',
            type: 'email',
            validations: [
                {name: 'required', validator: Validators.required, message: 'Email is required'},
                {name: 'email', validator: Validators.email, message: 'Invalid email format'}
            ]
        },
        {
            name: 'country',
            label: 'Country',
            cssClass: 'col-6',
            type: 'select',
            options: [
                {title: 'United States', id: 'us'},
                {title: 'Canada', id: 'ca'},
                {title: 'Mexico', id: 'mx'}
            ],
            validations: [{name: 'required', validator: Validators.required, message: 'Please select a country'}]
        },
        {
            name: 'age',
            label: 'Age',
            cssClass: 'col-6',
            type: 'number',
            value: 18,
            validations: [{name: 'min', validator: Validators.min(0), message: 'Age cannot be negative'}]
        },
        {
            name: 'bio',
            label: 'Short Bio',
            type: 'textarea',
            cssClass: 'col-6',
        },
        {
            name: 'gender',
            label: 'Gender',
            cssClass: 'col-6',
            type: 'radio',
            options: [
                {title: 'Male', id: 'M'},
                {title: 'Female', id: 'F'}
            ]
        },
        {
            name: 'agree',
            label: 'I agree to terms',
            type: 'checkbox',
            validations: [{
                name: 'requiredTrue',
                validator: Validators.requiredTrue,
                message: 'You must agree before submitting'
            }]
        },
        {
            name: 'travelWindow',
            label: 'Travel Window',
            type: 'date-range',
            value: { start: null, end: null },
            validations: [
                { name: 'start', validator: Validators.required, message: 'Start date is required' },
                { name: 'end',   validator: Validators.required, message: 'End date is required' }
            ],
            cssClass: 'col-6'
        },
    ];
    checkedItems: any[] = [
        {
            name: 'username',
            label: 'Username',
            type: 'text',
            cssClass: 'col-6',
            allowSearch: true
        }
    ]

    onSubmit(formValue: any) {
        // ...handle save, API call, etc.
        const { rules, searchFieldKeys } = generateFilterRules(this.fields);

        const searchRules = rules.filter(rule => searchFieldKeys.includes(rule.valueKey));
        const filterRules = rules.filter(rule => !searchFieldKeys.includes(rule.valueKey));

        const search = new FormFilterMapper(formValue).map(searchRules, 'or');
        const filter = new FormFilterMapper(formValue).map(filterRules, 'and');
        let er = [[...search], 'and', [...filter]]
        const loadOptions = {
            skip: 0,
            take: 10,
            filter: er
        };

        this.dataService.getData('users', loadOptions).subscribe(res => {

        });
    }

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        // this.loadData();
    }

    loadData() {
        const params: any = {
            page: this.currentPage,
            pageSize: this.pageSize,
            filter: this.filterText,
            sort: this.sortKey ? `${this.sortKey},${this.sortDirection}` : undefined
        };
        this.items = Array.from({length: 100}, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`
        }));
    }

    onPageChange(page: number) {
        this.currentPage = page;
        this.loadData();
    }

    onPageSizeChange(size: number) {
        this.pageSize = +size;
        this.currentPage = 0;
        this.loadData();
    }

    onSortChange(e: { key: string; direction: 'asc' | 'desc' }) {
        this.sortKey = e.key;
        this.sortDirection = e.direction;
        this.loadData();
    }

    onFilter(text: string) {
        this.filterText = text;
        this.currentPage = 0;
        this.loadData();
    }

    // supply exactly those keys here:
    initialValues = {
        q: 'angular',
        status: 'closed',
        // native <input type="date"> wants a YYYY-MM-DD string:
        date: '2025-04-20',
        // for date-range you give an object with from/to
        range: {
            from: '2025-04-01',
            to: '2025-04-10'
        }
    };

    log(event: any) {
        for (const [key, value] of event.entries()) {
            if (value instanceof File) {
                } else {
                }
        }
    }

    onHeaderAction(actionId: string) {
        if (actionId === 'create') { /* ... */
        } else if (actionId === 'export') { /* ... */
        }
    }

    // parent.component.ts
    onFilterApply(vals: Record<string, any>) {
        // filters.q, filters.status, filters.date, filters.range.from/to
        // this.loadData(filters);
        }

// parent.component.ts
    onBack() {
        // e.g. this.router.navigate(['..']);
    }

    filters: FilterDef[] = [
        {id: 'q', label: 'Search', type: 'text', placeholder: 'keywords…'},
        {
            id: 'status', label: 'Status', type: 'select',
            options: [
                {label: 'Open', value: 'open'},
                {label: 'Closed', value: 'closed'}
            ]
        },
        {id: 'date', label: 'Date', type: 'date'},
        {id: 'range', label: 'Created On', type: 'daterange'}
    ];

    onFilterReset() {
        // cleared back to defaults
        // this.loadData({});
    }
}


