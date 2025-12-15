export interface CommitteeRecordsStatistics {
  committees: {
    symbol: string;
    activeCount: number;
    inActiveCount: number;
    meetingRecordsCount: number;
    handoverRecordsCount: number;
    total: number;
  }[];
  total: number;
}
