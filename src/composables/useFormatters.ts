import dayjs from 'dayjs';
import 'dayjs/locale/pl';
dayjs.locale("pl");

export function formatDate(date: string): string {
  return dayjs(date).format("DD.MM.YYYY");
}

export function formatTimeRange(start: string, end: string): string {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  return `${startDate.format("HH:mm")} - ${endDate.format("HH:mm")}`;
}

export function formatSessionDate(start: string, end: string): string {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  return `${startDate.format("DD.MM.YYYY")} (${startDate.format("dddd")})<br>${startDate.format("HH:mm")} - ${endDate.format("HH:mm")}`;
}
