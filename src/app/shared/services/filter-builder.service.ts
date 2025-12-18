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
   */
  buildFilterFromModel(
    model: Record<string, any>,
    operationMap?: Record<string, FilterOperation>
  ): string | null {
    if (!model) return null;

    const filters: any[] = [];

    /* -------------------------------------------------------
     * 1️⃣ Extract DATE filters (range + single date) BEFORE flatten
     * ----------------------------------------------------- */
    const dateFilters = this.extractDateFilters(model);
    if (dateFilters.length) {
      filters.push(...dateFilters);
    }

    /* -------------------------------------------------------
     * 2️⃣ Remove date objects from model before flatten
     * ----------------------------------------------------- */
    const cleanModel: Record<string, any> = { ...model };

    for (const key of Object.keys(cleanModel)) {
      const value = cleanModel[key];
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        (('from' in value && 'to' in value) || 'date' in value)
      ) {
        delete cleanModel[key];
      }
    }

    /* -------------------------------------------------------
     * 3️⃣ Normal filtering flow
     * ----------------------------------------------------- */
    const flatModel = this.flattenObject(cleanModel);
    const grouped = this.groupByRoot(flatModel);

    for (const [, fields] of Object.entries(grouped)) {
      const groupConditions: any[] = [];

      for (const [field, value] of Object.entries(fields)) {
        if (value === null || value === undefined || value === '') continue;

        const op =
          operationMap?.[field] ?? this.detectDefaultOperation(value);

        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v === null || v === undefined || v === '') return;
            if (groupConditions.length > 0) groupConditions.push('or');
            groupConditions.push([field, op, v]);
          });
        } else {
          if (groupConditions.length > 0) groupConditions.push('or');
          groupConditions.push([field, op, value]);
        }
      }

      if (groupConditions.length > 0) {
        if (filters.length > 0) filters.push('and');
        filters.push(
          groupConditions.length > 1 ? [...groupConditions] : groupConditions[0]
        );
      }
    }

    return filters.length > 0 ? JSON.stringify(filters) : null;
  }

  /**
   * Builds a DevExtreme sort array.
   */
  buildSortFromModel(
    sortModel: Record<string, SortDirection | boolean>
  ): any[] | null {
    if (!sortModel) return null;

    const sortArray: { selector: string; desc: boolean }[] = [];

    for (const [field, direction] of Object.entries(sortModel)) {
      if (direction === null || direction === undefined) continue;

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

  /* =======================================================
   * Helpers
   * ===================================================== */

  /**
   * Extracts date filters (range & single date) from the original model.
   */
  private extractDateFilters(model: Record<string, any>): any[] {
    const filters: any[] = [];

    for (const [key, value] of Object.entries(model)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

      /* -------- Date Range -------- */
      if ('from' in value && 'to' in value) {
        if (filters.length > 0) filters.push('and');

        filters.push([
          [key, '>=', value.from],
          'and',
          [key, '<=', value.to],
        ]);
      }

      /* -------- Single Date -------- */
      else if ('date' in value) {
        if (filters.length > 0) filters.push('and');
        filters.push([key, '=', value.date]);
      }
    }

    return filters;
  }

  /**
   * Recursively flattens nested objects.
   */
  private flattenObject(
    obj: Record<string, any>,
    prefix = ''
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        Object.assign(result, this.flattenObject(value, fullKey));
      } else {
        result[fullKey] = value;
      }
    }

    return result;
  }

  /**
   * Groups flattened keys by their root property.
   */
  private groupByRoot(
    flatModel: Record<string, any>
  ): Record<string, Record<string, any>> {
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
