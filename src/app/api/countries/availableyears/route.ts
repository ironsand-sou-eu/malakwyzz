import z from "zod";
import { db } from "@/db/db";
import { MlkApiResponse } from "@/shared/classes/mlk-api-response";
import { UnavailableGameKindException } from "@/shared/exceptions/exceptions";
import { commonErrorHandlingPlaceAtBottom } from "@/shared/functions/api-error-handling";
import { isAllowedGameKind } from "@/shared/functions/typeguards";
import { QUERY_STRING_SEARCH_PARAMS } from "@/shared/global-constants";

const PostBodySchema = z.object({
  kind: z.string().nonempty(),
});

export type AvailableYearsPostBody = z.infer<typeof PostBodySchema>;

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const kind = url.searchParams.get(QUERY_STRING_SEARCH_PARAMS.kind);
    const availableYears = await calcAvailableYearsInDb({ kind });
    return new MlkApiResponse().json({ data: availableYears });
  } catch (e) {
    if (e instanceof UnavailableGameKindException) {
      return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
        type: e.name,
        message: "Unavailable game kind. Choose another and try again.",
      });
    }
    return commonErrorHandlingPlaceAtBottom(e);
  }
}

interface CalcAvailableYearsInDbParams {
  kind: string | null;
}
export async function calcAvailableYearsInDb({ kind }: CalcAvailableYearsInDbParams) {
  if (!isAllowedGameKind(kind)) throw new UnavailableGameKindException();
  return await db.getViableYearsForKind(kind);
}
