export function formatDateFormat(input: string): string {
  // Parse the input string into a Date object
  const date = new Date(input);

  // Define options for formatting the date
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  // Create a formatter with the desired locale and options
  const formatter = new Intl.DateTimeFormat("en-GB", options);

  // Format the date and return it
  return formatter.format(date);
}