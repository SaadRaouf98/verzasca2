import { TransactionActionType } from '@core/enums/transaction-action-type.enum';

export interface TransactionAction {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  actionType: TransactionActionType;
  uiFormId?: string;
}

export interface AllTransactionActions {
  data: TransactionAction[];
  totalCount: number;
  groupCount: number;
}
