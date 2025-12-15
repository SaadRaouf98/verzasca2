export enum ReportPeriodType {
  Yearly = 1,
  SemiAnnual = 2,
  Quarterly = 3,
  Monthly = 4,
}

export interface ReportPeriodOption {
  id: number;
  title: string;
  titleEn: string;
}

export const REPORT_PERIOD_OPTIONS: ReportPeriodOption[] = [
  {
    id: ReportPeriodType.Yearly,
    title: 'سنوي',
    titleEn: 'Yearly',
  },
  {
    id: ReportPeriodType.SemiAnnual,
    title: 'نصف سنوي',
    titleEn: 'Semi-Annual',
  },
  {
    id: ReportPeriodType.Quarterly,
    title: 'ربع سنوي',
    titleEn: 'Quarterly',
  },
  {
    id: ReportPeriodType.Monthly,
    title: 'شهري',
    titleEn: 'Monthly',
  },
];
