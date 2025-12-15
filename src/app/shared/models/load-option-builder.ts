export class LoadOptionParser {
  constructor(private loadOptions: any) {}

  toQueryString(): string {
    const params: string[] = [];

    this.append(params, 'skip', this.loadOptions.skip);
    this.append(params, 'take', this.loadOptions.take);
    this.append(params, 'searchOperation', this.loadOptions.searchOperation);
    this.append(params, 'searchValue', this.loadOptions.searchValue);

    this.appendJson(params, 'sort', this.loadOptions.sort);
    this.appendJson(params, 'filter', this.loadOptions.filter);
    this.appendJson(params, 'group', this.loadOptions.group);
    this.appendJson(params, 'searchExpr', this.loadOptions.searchExpr);
    this.appendJson(params, 'totalSummary', this.loadOptions.totalSummary);
    this.appendJson(params, 'groupSummary', this.loadOptions.groupSummary);
    this.append(params, 'requireTotalCount', this.loadOptions.requireTotalCount);
    this.append(params, 'requireGroupCount', this.loadOptions.requireGroupCount);

    return params.length ? `?${params.join('&')}` : '';
  }

  private append(params: string[], key: string, value: any) {
    if (value !== undefined && value !== null) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  private appendJson(params: string[], key: string, value: any) {
    if (value !== undefined && value !== null) {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`);
    }
  }
}
