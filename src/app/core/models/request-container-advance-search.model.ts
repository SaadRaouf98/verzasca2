import { AdvanedSearchOperator } from '@shared/enums/advanced-search-operator.enum';

export interface RequestContainerAdvancedSearchResult {
  id: string;
  title: string;
  transactionNumber: string;
}

export interface RequestContainerAdvancedSearchQueryParams {
  requestContainerId: string | undefined;
  autoNumber: string | undefined;
  title: string | undefined;
  requests: string | undefined;
  exportableDocuments: string | undefined;
  requestStepContents: string | undefined;
  foundation: string | undefined;
  sector: string | undefined;
  operator: AdvanedSearchOperator;
}
