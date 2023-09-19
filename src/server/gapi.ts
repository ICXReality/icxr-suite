import { calendar_v3, forms_v1, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import payload from "payload";
import { Event } from "payload/generated-types";
import { resolveDocument } from "./payload-util";

var _authClient: OAuth2Client | undefined = undefined;
var _calendarClient: calendar_v3.Calendar | undefined = undefined;
var _formsClient: forms_v1.Forms | undefined = undefined;

export async function initializeGoogleAuthClient() {
  let icxrConfig = await payload.findGlobal({
    slug: "icxr",
  });

  // Make sure we have the tokens needed to make a client.
  let config = icxrConfig.google;
  if (config?.clientId && config.clientSecret && config.refreshToken) {
    _authClient = new google.auth.OAuth2(config.clientId, config.clientSecret);
    _authClient.setCredentials({
      refresh_token: config.refreshToken,
    });
  }
}

export async function getGoogleAuthClient() {
  if (!_authClient) {
    await initializeGoogleAuthClient();
  }

  return _authClient;
}

export async function initializeGoogleCalendarClient() {
  let auth = await getGoogleAuthClient();
  if (!auth) return;

  _calendarClient = google.calendar({
    version: "v3",
    auth: auth,
  });
}

export async function getGoogleCalendarClient() {
  if (!_calendarClient) {
    await initializeGoogleCalendarClient();
  }

  return _calendarClient;
}

export async function initializeGoogleFormsClient() {
  let auth = await getGoogleAuthClient();
  if (!auth) return;

  _formsClient = google.forms({
    version: "v1",
    auth: auth,
  });
}

export async function getGoogleFormsClient() {
  if (!_formsClient) {
    await initializeGoogleFormsClient();
  }

  return _formsClient;
}

export async function updateCalendarWithEvent(
  event: string | Event
): Promise<Event> {
  event = await resolveDocument(event, "events");
  let calendar = await getGoogleCalendarClient();
  let icxrConfig = await payload.findGlobal({
    slug: "icxr",
  });

  // Ensure we have a calendar and a calendar to write events to.
  if (!(calendar && icxrConfig.google?.calendarId)) return event;

  let calendarId = icxrConfig.google.calendarId;
  let existingEventId = event.googleCalendarId;
  let eventData: calendar_v3.Schema$Event = {
    summary: event.name,
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.startDate,
    },
    end: {
      dateTime: event.endDate,
    },
  };

  var shouldCreateNewEvent = true;
  if (existingEventId) {
    // A calendar event has already been published.
    shouldCreateNewEvent = false;
    try {
      await calendar.events.update({
        calendarId: calendarId,
        eventId: existingEventId,
        requestBody: eventData,
      });
    } catch {
      shouldCreateNewEvent = true;
    }
  }

  // A calendar event needs to be created, either because one does not exist
  // yet or a calendar event failed to be edited.
  if (shouldCreateNewEvent) {
    try {
      let createdEvent = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: eventData,
      });

      event = await payload.update({
        id: event.id,
        collection: "events",
        data: {
          googleCalendarId: createdEvent.data.id ?? undefined,
        },
        context: {
          noHook: true,
        },
        showHiddenFields: true,
        overrideAccess: true,
      });
    } catch (e) {
      payload.logger.error("Failed to create calendar event: " + e)
    }
  }

  return event;
}

export async function removeEventFromCalendar(event: string | Event) {
  event = await resolveDocument(event, "events");
  let calendar = await getGoogleCalendarClient();
  let icxrConfig = await payload.findGlobal({
    slug: "icxr",
  });

  // Ensure we have a calendar and an event to remove.
  if (!(calendar && icxrConfig.google?.calendarId && event.googleCalendarId))
    return event;

  try {
    calendar.events.delete({
      calendarId: icxrConfig.google.calendarId,
      eventId: event.googleCalendarId,
    });
  } catch {
    payload.logger.error("Failed to remove google calendar event!");
  }

  return event;
}

export async function retrieveFormQuestions() {
  let formsClient = await getGoogleFormsClient();
  let icxrConfig = await payload.findGlobal({ slug: "icxr" });
  if (!(formsClient && icxrConfig.google?.eventRequestForm?.eventForm)) {
    return;
  }

  let form: forms_v1.Schema$Form;
  try {
    let response = await formsClient.forms.get({
      formId: icxrConfig.google.eventRequestForm.eventForm,
    });
    form = response.data;
  } catch (error) {
    payload.logger.error("Could not get form!");
    console.error(error);
    return;
  }

  // TODO: Properly paginate through the response data?
  let items = form.items;

  return items;
}

export async function retrieveFormResponses() {
  let formsClient = await getGoogleFormsClient();
  let icxrConfig = await payload.findGlobal({ slug: "icxr" });
  if (!(formsClient && icxrConfig.google?.eventRequestForm?.eventForm)) {
    return;
  }

  let form: forms_v1.Schema$ListFormResponsesResponse;
  try {
    let response = await formsClient.forms.responses.list({
      formId: icxrConfig.google.eventRequestForm.eventForm,
    });
    form = response.data;
  } catch (error) {
    payload.logger.error("Could not get form!");
    console.error(error);
    return;
  }

  // TODO: Properly paginate through the response data?
  let responses = form.responses;

  return responses;
}

export async function importEventFormResponses() {
  let responses = await retrieveFormResponses();
  let icxrConfig = await payload.findGlobal({ slug: "icxr" });

  // Make sure we have responses and all the form parameters.
  if (
    !(
      responses &&
      icxrConfig.google?.eventRequestForm?.nameId &&
      icxrConfig.google.eventRequestForm.locationId &&
      icxrConfig.google.eventRequestForm.descriptionId &&
      icxrConfig.google.eventRequestForm.startDateId &&
      icxrConfig.google.eventRequestForm.endDateId &&
      icxrConfig.google.eventRequestForm.contactNameId &&
      icxrConfig.google.eventRequestForm.contactEmailId
    )
  )
    return;

  let nameId = icxrConfig.google.eventRequestForm.nameId;
  let locationId = icxrConfig.google.eventRequestForm.locationId;
  let descriptionId = icxrConfig.google.eventRequestForm.descriptionId;
  let startDateId = icxrConfig.google.eventRequestForm.startDateId;
  let endDateId = icxrConfig.google.eventRequestForm.endDateId;
  let contactNameId = icxrConfig.google.eventRequestForm.contactNameId;
  let contactEmailId = icxrConfig.google.eventRequestForm.contactEmailId;

  await Promise.all(
    responses.map(async (r) => {
      let responseId = r.responseId;

      let search = await payload.find({
        depth: 0,
        collection: "events",
        where: {
          "organizer.formSubmission": {
            equals: responseId,
          },
        },
      });
      let existingEvent = search.totalDocs > 0;

      // If this event is already within our database, don't create it again.
      if (existingEvent) return;

      // Helper function to extract answers.
      function getFormAnswer(questionId: string) {
        return (
          r.answers![questionId]!.textAnswers!.answers![0]["value"] ?? undefined
        );
      }

      await payload.create({
        collection: "events",
        data: {
          name: getFormAnswer(nameId)!,
          publishCalendar: true,
          publishDiscord: true,
          status: "Pending",
          locationType: "hybrid",
          attendance: 0,
          location: getFormAnswer(locationId)!,
          description: getFormAnswer(descriptionId),
          startDate: getFormAnswer(startDateId)!,
          endDate: getFormAnswer(endDateId)!,
          organizer: {
            contactName: getFormAnswer(contactNameId),
            contactEmail: getFormAnswer(contactEmailId),
            formSubmission: r.responseId ?? undefined,
          },
        },
      });
    })
  );
}
