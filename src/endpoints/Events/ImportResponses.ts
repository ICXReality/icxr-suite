import { Endpoint } from "payload/config";
import {
    createEventsFromResponses
} from "../../server/gapi";
import { makeAdminHandler } from "../EndpointUtil";

const ImportResponsesEndpoint: Endpoint = {
  path: "/responses",
  method: "post",
  handler: makeAdminHandler(async (req, res) => {
    await createEventsFromResponses();
    res.status(200).send();
  }),
};

export default ImportResponsesEndpoint;
