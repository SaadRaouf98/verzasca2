export interface FoundationsAmounts {
  costs: {
    id: string;
    title: string;
    titleEn: string;
    requestedAmount: number;
    approvedAmount: number;
    sector: {
      id: string;
      title: string;
    };
  }[];
  credits: {
    id: string;
    title: string;
    titleEn: string;
    requestedAmount: number;
    approvedAmount: number;
    sector: {
      id: string;
      title: string;
    };
  }[];

  totalRequestedCosts: number;
  totalApprovedCosts: number;
  totalRequestedCredits: number;
  totalApprovedCredits: number;
}
