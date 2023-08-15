import { GlobalConfig } from "payload/types";

const GoogleCalendar: GlobalConfig = {
    slug: 'gcal',
    label: "Google Calendar",
    fields: [
        {
            name: "calendarId",
            type: "text"
        }
    ]
}

export default GoogleCalendar;