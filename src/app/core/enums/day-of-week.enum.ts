export enum DayOfWeek {
  //
  // Summary:
  //     Indicates Sunday.
  Sunday = 0,
  //
  // Summary:
  //     Indicates Monday.
  Monday = 1,
  //
  // Summary:
  //     Indicates Tuesday.
  Tuesday = 2,
  //
  // Summary:
  //     Indicates Wednesday.
  Wednesday = 3,
  //
  // Summary:
  //     Indicates Thursday.
  Thursday = 4,
  //
  // Summary:
  //     Indicates Friday.
  Friday = 5,
  //
  // Summary:
  //     Indicates Saturday.
  Saturday = 6,
}
export const DayOfWeekArabic: Record<DayOfWeek, string> = {
  [DayOfWeek.Sunday]: "الأحد",
  [DayOfWeek.Monday]: "الإثنين",
  [DayOfWeek.Tuesday]: "الثلاثاء",
  [DayOfWeek.Wednesday]: "الأربعاء",
  [DayOfWeek.Thursday]: "الخميس",
  [DayOfWeek.Friday]: "الجمعة",
  [DayOfWeek.Saturday]: "السبت",
};
