export type FilterOperator =
  | '=' | '<>' | '<' | '<=' | '>' | '>='
  | 'contains' | 'startswith' | 'endswith';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}
