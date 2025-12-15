export interface Transaction {
  id: number;
  checked?: boolean;
  title: string;
  transactionNum: string;
  destination: {
    id: number;
    name: string;
  };
  sector: {
    id: number;
    name: string;
  };
  advisor: {
    id: number;
    name: string;
  };
}

export interface TransactionDetails extends Transaction {
  importance: {
    id: number;
    name: string;
    color: string;
  };
  requiredAmount: number;
  remainingPeriod: {
    text: string;
    percentage: number;
    color: string;
  };
}
