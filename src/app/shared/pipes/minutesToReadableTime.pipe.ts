import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutesToReadableTime',
  standalone: true,
})
export class MinutesToReadableTimePipe implements PipeTransform {
  transform(totalMinutes: number): string {
    if (totalMinutes == null || totalMinutes < 0) return '';

    const minutesInHour = 60;
    const minutesInDay = minutesInHour * 24;
    const minutesInMonth = minutesInDay * 30; // تقريب الشهر

    const months = Math.floor(totalMinutes / minutesInMonth);
    totalMinutes %= minutesInMonth;

    const days = Math.floor(totalMinutes / minutesInDay);
    totalMinutes %= minutesInDay;

    const hours = Math.floor(totalMinutes / minutesInHour);
    const minutes = Math.floor(totalMinutes % minutesInHour);

    const parts = [];

    if (months)
      parts.push(
        `${
          months === 1
            ? 'شهر'
            : months === 2
            ? 'شهرين'
            : months <= 10
            ? `${months} أشهر`
            : `${months} شهرًا`
        }`
      );
    if (days)
      parts.push(
        `${days} ${this.getArabicWord(days, 'يوم', 'يومين', 'أيام', 'يومًا')}`
      );
    if (hours)
      parts.push(
        `${hours} ${this.getArabicWord(
          hours,
          'ساعة',
          'ساعتين',
          'ساعات',
          'ساعةً'
        )}`
      );
    if (minutes || parts.length === 0)
      parts.push(
        `${minutes} ${this.getArabicWord(
          minutes,
          'دقيقة',
          'دقيقتين',
          'دقائق',
          'دقيقةً'
        )}`
      );

    return parts.join(' ');
  }

  private getArabicWord(
    value: number,
    one: string,
    two: string,
    few: string,
    many: string
  ): string {
    if (value === 1) return one;
    if (value === 2) return two;
    if (value >= 3 && value <= 10) return few;
    return many;
  }
}
