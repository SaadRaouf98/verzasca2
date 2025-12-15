export interface RecommendationResults {
  values: {
    id: string;
    title: string;
    outcomes: {
      id: string;
      title: string;
      count: number;
    }[];
    count: number;
  }[];
  outcomesSummary: {
    id: string;
    title: string;
    count: number;
  }[];
  total: number;
}
