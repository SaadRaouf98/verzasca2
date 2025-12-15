import { Injectable } from '@angular/core';

export type FilterOperation =
  '=' | '<>' | '>' | '>=' | '<' | '<=' | 'contains' | 'startswith' | 'endswith';

export type SortDirection = 'asc' | 'desc';

@Injectable({
  providedIn: 'root',
})
export class FilterBuilderService {
  /**
   * Builds a DevExtreme filter from a nested model.
   * Groups nested object filters by their root key (e.g. foundation.* → OR group).
   */
  buildFilterFromModel(
    model: Record<string, any>,
    operationMap?: Record<string, FilterOperation>
  ): any[] | null {
    if (!model) return null;

    const flatModel = this.flattenObject(model);
    const grouped = this.groupByRoot(flatModel);
    const filters: any[] = [];

    for (const [root, fields] of Object.entries(grouped)) {
      const groupConditions: any[] = [];

      for (const [field, value] of Object.entries(fields)) {
        if (value === null || value === undefined || value === '') continue;

        // Determine operator for this field (or for each value in array)
        const baseOperation = operationMap?.[field] ?? this.detectDefaultOperation(value);

        if (Array.isArray(value)) {
          value.forEach((v, idx) => {
            if (v === null || v === undefined || v === '') return;
            const op = operationMap?.[field] ?? this.detectDefaultOperation(v); // ✅ detect per element
            if (groupConditions.length > 0) groupConditions.push('or');
            groupConditions.push([field, op, v]);
          });
        } else {
          if (groupConditions.length > 0) groupConditions.push('or');
          groupConditions.push([field, baseOperation, value]);
        }
      }

      if (groupConditions.length > 0) {
        if (filters.length > 0) filters.push('and');
        filters.push(groupConditions.length > 1 ? [...groupConditions] : groupConditions[0]);
      }
    }

    return filters.length > 0 ? filters : null;
  }

  /**
   * Builds a DevExtreme sort array.
   * Example input:
   *   { 'name': 'asc', 'dateCreated': 'desc' }
   * Output:
   *   [ { selector: 'name', desc: false }, { selector: 'dateCreated', desc: true } ]
   */
    buildSortFromModel(sortModel: Record<string, SortDirection | boolean>): any[] | null {
    if (!sortModel) return null;

    const sortArray: { selector: string; desc: boolean }[] = [];

    for (const [field, direction] of Object.entries(sortModel)) {
      if (direction === null || direction === undefined) continue;

      // Support both "asc"/"desc" strings and boolean (true = desc)
      let desc = false;
      if (typeof direction === 'string') {
        desc = direction.toLowerCase() === 'desc';
      } else if (typeof direction === 'boolean') {
        desc = direction;
      }
      sortArray.push({ selector: field, desc });
    }

    return sortArray.length > 0 ? sortArray : null;
  }
  
  /**
   * Recursively flattens nested objects.
   */
  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(result, this.flattenObject(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }
    return result;
  }

  /**
   * Groups flattened keys by their root property.
   * Example:
   * { "foundation.id": 1, "foundation.name": "A", "priority.id": 2 }
   * → { foundation: { ... }, priority: { ... } }
   */
  private groupByRoot(flatModel: Record<string, any>): Record<string, Record<string, any>> {
    const groups: Record<string, Record<string, any>> = {};
    for (const [key, value] of Object.entries(flatModel)) {
      const root = key.split('.')[0];
      if (!groups[root]) groups[root] = {};
      groups[root][key] = value;
    }
    return groups;
  }

  /**
   * Detects default operator based on value type.
   * - String that is NOT a GUID → 'contains'
   * - Everything else → '='
   */
  private detectDefaultOperation(value: any): FilterOperation {
    if (typeof value === 'string' && !this.isGuid(value)) {
      return 'contains';
    }
    return '=';
  }

  private isGuid(value: string): boolean {
    const guidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(value.trim());
  }
}
