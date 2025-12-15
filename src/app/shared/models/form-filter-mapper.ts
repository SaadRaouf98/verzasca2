import { FilterBuilder } from './filter-builder';

export interface FilterMapRule {
  field: string;
  operator: string;
  valueKey: string;
  transform?: (value: any) => any;
  condition?: (value: any) => boolean;
}

export class FormFilterMapper {
  constructor(private formValue: Record<string, any>) {}

  map(rules: FilterMapRule[], logic: 'and' | 'or' = 'and') {
    const filter = new FilterBuilder(logic);

    rules.forEach(rule => {
      const value = this.formValue[rule.valueKey];
      const isValid = rule.condition ? rule.condition(value) : value !== null && value !== undefined;

      if (isValid) {
        const transformedValue = rule.transform ? rule.transform(value) : value;
        filter.add(rule.field, rule.operator as any, transformedValue);
      }
    });

    return filter.build();
  }
}
