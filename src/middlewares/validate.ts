import { Request, Response, NextFunction } from "express";
import { ValidationSchema, ValidatableSchema } from "./middlewares.interface";

export { ValidationSchema, ValidatableSchema };

export const validate = (schema: ValidatableSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ("parseAsync" in schema) {
        const parsed: any = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        if (parsed.body) req.body = parsed.body;
        if (parsed.query) req.query = parsed.query;
        if (parsed.params) req.params = parsed.params;
      } else {
        const validationSchema = schema as ValidationSchema;
        if (validationSchema.body && "parseAsync" in validationSchema.body) {
          req.body = await validationSchema.body.parseAsync(req.body);
        }
        if (validationSchema.query && "parseAsync" in validationSchema.query) {
          req.query = await validationSchema.query.parseAsync(req.query);
        }
        if (validationSchema.params && "parseAsync" in validationSchema.params) {
          req.params = await validationSchema.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
