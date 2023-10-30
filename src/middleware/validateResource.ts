// When a req comes in we provide a schema to validate the request body against.
// e.g. when creating a user we would want that both a username and password are provided and that they are of the correct type (string)
// and that the provided email is a valid email format.

import {Request, Response, NextFunction} from "express";
import {AnyZodObject} from "zod";

// using currying here
const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    })
    next();
  } catch (error: any) {
    return res.status(400).send(error.errors);
  }
};

export default validate;


