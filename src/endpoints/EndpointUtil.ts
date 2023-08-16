import { PayloadHandler } from "payload/config";

export function makeAdminHandler(
  handler: PayloadHandler | PayloadHandler[]
): PayloadHandler[] {
  let adminHandler: PayloadHandler = async (req, res, next) => {
    if (!req.user) {
      res.status(401).send({ err: "No user" });
      return;
    }

    next();
  };

  let handlers = Array.isArray(handler) ? handler : [handler];
  return [adminHandler, ...handlers];
}
