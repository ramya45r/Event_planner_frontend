// createGoogleCalendarLink: create a URL that opens Google Calendar's event creation with prefilled details.
// This is a safe client-side method that doesn't require OAuth (user must sign into Google).
export function createGoogleCalendarLink({ title, details, start, end, location }) {
  // convert to ISO with timezone UTC as fallback
  const toGoogleDate = (d) => {
    const dt = new Date(d);
    // format: YYYYMMDDTHHMMSSZ (UTC)
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
  };

  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = new URLSearchParams({
    text: title || "",
    details: details || "",
    location: location || "",
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
  });
  return `${base}&${params.toString()}`;
}
