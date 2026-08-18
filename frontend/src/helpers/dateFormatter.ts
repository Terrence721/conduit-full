export default function dateFormatter(date: string | number | Date): string {
  return new Date(date).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
