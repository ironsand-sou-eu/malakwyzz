import { ZodError } from "zod";
import { MlkApiResponse } from "../classes/mlk-api-response";
import { UnsuportedTypeException } from "../exceptions/exceptions";

export function commonErrorHandlingPlaceAtBottom(e: unknown) {
  if (e instanceof UnsuportedTypeException) {
    return new MlkApiResponse()
      .status("415-unsupportedMediaType")
      .defaultRequestError({ type: "UnsuportedTypeException", message: e.message });
  }

  if (e instanceof SyntaxError && e.message === "Unexpected end of JSON input") {
    return new MlkApiResponse()
      .status("422-unprocessableContent")
      .defaultRequestError({ type: e.name, message: "Problem reading the body." });
  }

  if (e instanceof ZodError) {
    return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
      type: "ValidationException",
      message: e.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n"),
    });
  }

  console.warn({
    inst: e instanceof SyntaxError,
    MLK_ERR: e,
    msg: e instanceof ZodError && e.issues,
    name: e instanceof SyntaxError && e.name,
    cause: e instanceof SyntaxError && e.cause,
  });

  if (e instanceof Error) {
    return new MlkApiResponse()
      .status("422-unprocessableContent")
      .defaultRequestError({ type: e.name, message: e.message });
  }
}
