import {FilterMapRule} from '@shared/models/form-filter-mapper';

export const baseFilterRules: FilterMapRule[] = [
  {
    field: 'createdAt',
    operator: '>=',
    valueKey: 'createdAfter',
    condition: (v: any) => !!v,
    transform: (v: string) => new Date(v)
  },
  {
    field: 'createdAt',
    operator: '<=',
    valueKey: 'createdBefore',
    condition: (v: any) => !!v,
    transform: (v: string) => new Date(v)
  },
  {field: 'status', operator: '=', valueKey: 'status', condition: (v: any) => !!v}
];
export const userFilterRules: FilterMapRule[] = [
  ...baseFilterRules,
  {field: 'username', operator: 'contains', valueKey: 'username', condition: (v: any) => !!v},
  {field: 'firstName', operator: 'contains', valueKey: 'firstName', condition: (v: any) => !!v},
  {field: 'email', operator: 'contains', valueKey: 'email', condition: (v: any) => !!v},
  {field: 'country', operator: '=', valueKey: 'country', condition: (v: any) => !!v},
  {field: 'age', operator: '>=', valueKey: 'age', condition: (v: any) => v != null},
  {field: 'gender', operator: '=', valueKey: 'gender', condition: (v: any) => !!v}
];

export const userSearchFieldKeys = ['username', 'firstName'];
