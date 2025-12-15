import { RequestStatus } from '@core/enums/request-status.enum';

export interface TransactionsStatusStatistics {
  values: {
    status: RequestStatus; //2 or 3 or 8
    count: number;
  }[];
  total: number;
}
