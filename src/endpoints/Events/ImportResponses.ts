import { Endpoint } from "payload/config";
import {
    importEventFormResponses
} from "../../server/gapi";
import { makeAdminHandler } from "../EndpointUtil";

const ImportResponsesEndpoint: Endpoint = {
  path: "/responses",
  method: "post",
  handler: makeAdminHandler(async (req, res) => {
    await importEventFormResponses();
    res.status(200).send();
  }),
};

export default ImportResponsesEndpoint;
