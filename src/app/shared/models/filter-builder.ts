import { FilterCondition } from './filter-condition.model';

export class FilterBuilder {
  private conditions: FilterCondition[] = [];
  private logic: 'and' | 'or' = 'and';

  constructor(logic: 'and' | 'or' = 'and') {
    this.logic = logic;
  }

  add(field: string, operator: FilterCondition['operator'], value: any): this {
    this.conditions.push({ field, operator, value });
    return this;
  }

  build(): any[] {
    if (!this.conditions.length) return [];
    return this.conditions.reduce<any[]>((acc, cond, i) => {
      acc.push([cond.field, cond.operator, cond.value]);
      if (i < this.conditions.length - 1) acc.push(this.logic);
      return acc;
    }, []);
  }

  isEmpty(): boolean {
    return this.conditions.length === 0;
  }

  clear(): this {
    this.conditions = [];
    return this;
  }
}
