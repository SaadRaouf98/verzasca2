import { SortDirection } from '@angular/material/sort';

export const buildUrlQueryPaginationSortSelectParams = (
  queryData: { pageSize: number; pageIndex: number },
  sortData?: { sortBy: string; sortType: SortDirection },
  selectedProperties?: string[]
) => {
  const skip = queryData.pageSize * queryData.pageIndex;
  let url = `RequireTotalCount=true&Skip=${skip}&Take=${queryData.pageSize}`;

  if (sortData?.sortType) {
    url += `&Sort=[${JSON.stringify({
      selector: sortData.sortBy,
      desc: sortData.sortType === 'desc' ? true : false,
    })}]`;
  }

  if (selectedProperties && selectedProperties.length) {
    url += `&Select=${JSON.stringify(selectedProperties)}`;
  }

  return url;
};
