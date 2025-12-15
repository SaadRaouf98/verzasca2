import { FilterMapRule } from '@shared/models/form-filter-mapper';
import {FieldConfig} from "@shared/components/form/form.component";

export function generateFilterRules(fields: FieldConfig[]): {
  rules: FilterMapRule[];
  searchFieldKeys: string[];
} {
  const rules: FilterMapRule[] = [];
  const searchFieldKeys: string[] = [];

  for (const f of fields) {
    if (!f.name || f.type === 'checkbox' || f.name === 'agree') continue;

    let operator: FilterMapRule['operator'] = f.filterOperator || '=';

    if (!f.filterOperator) {
      switch (f.type) {
        case 'text':
        case 'email':
        case 'textarea':
          operator = 'contains';
          break;
        case 'number':
          operator = '>=';
          break;
        case 'select':
        case 'radio':
          operator = '=';
          break;
      }
    }

    // Range field detection
    const isRangeMin = f.name.endsWith('After') || f.name.endsWith('From');
    const isRangeMax = f.name.endsWith('Before') || f.name.endsWith('To');

    if (isRangeMin || isRangeMax) {
      const targetField = f.filterTarget || inferBaseFieldName(f.name);
      const rangeOperator: FilterMapRule['operator'] = isRangeMin ? '>=' : '<=';

      rules.push({
        field: targetField,
        operator: rangeOperator,
        valueKey: f.name,
        transform: (v: any) => new Date(v),
        condition: (v: any) => !!v
      });
    } else {
      rules.push({
        field: f.filterTarget || f.name,
        operator,
        valueKey: f.name,
        condition: (v: any) => v !== null && v !== undefined && v !== ''
      });
    }

    if (f.allowSearch) {
      searchFieldKeys.push(f.name);
    }
  }

  return { rules, searchFieldKeys };
}

function inferBaseFieldName(name: string): string {
  // e.g. createdAfter → createdAt
  return name.replace(/(After|Before|From|To)$/i, '') + 'At';
}
