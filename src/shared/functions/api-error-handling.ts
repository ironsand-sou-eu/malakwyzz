import { ZodError } from "zod";
import { MlkApiResponse } from "../classes/mlk-api-response";
import { UnsuportedTypeException } from "../exceptions/exceptions";

export function commonErrorHandlingPlaceAtBottom(e: unknown) {
  if (e instanceof UnsuportedTypeException) {
    return new MlkApiResponse()
      .status("415-unsupportedMediaType")
      .defaultRequestError({ message: e.message, type: "UnsuportedTypeException" });
  }

  if (e instanceof SyntaxError && e.message === "Unexpected end of JSON input") {
    return new MlkApiResponse()
      .status("422-unprocessableContent")
      .defaultRequestError({ message: "Problem reading the body.", type: e.name });
  }

  if (e instanceof ZodError) {
    return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
      message: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"),
      type: "ValidationException",
    });
  }

  console.warn({
    cause: e instanceof SyntaxError && e.cause,
    inst: e instanceof SyntaxError,
    MLK_ERR: e,
    msg: e instanceof ZodError && e.issues,
    name: e instanceof SyntaxError && e.name,
  });

  if (e instanceof Error) {
    return new MlkApiResponse()
      .status("422-unprocessableContent")
      .defaultRequestError({ message: e.message, type: e.name });
  }
}
