export type FilterType = 'text' | 'select' | 'date' | 'daterange';

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterDef {
  /** unique key */
  id: string;
  /** label shown above/control */
  label: string;
  /** control type */
  type: FilterType;
  multiple?: boolean;
  /** for select only */
  options?: FilterOption[];
  /** placeholder (text only) */
  placeholder?: string;
}
