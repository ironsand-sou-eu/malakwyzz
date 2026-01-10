import { getTranslations } from "next-intl/server";
import z from "zod";
import { db } from "@/db/db";
import { MlkApiResponse } from "@/shared/classes/mlk-api-response";
import { commonErrorHandlingPlaceAtBottom } from "@/shared/functions/api-error-handling";
import { isAllowedGameKind } from "@/shared/functions/typeguards";
import { suspendedCountriesGameKinds } from "@/shared/global-constants";

const PostBodySchema = z.object({
  kind: z.string().nonempty(),
});

export type AvailableYearsPostBody = z.infer<typeof PostBodySchema>;

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    },
    status: 200,
  });
}

export async function GET() {
  try {
    const availableKinds = await getAvailableKindsInDb();
    return new MlkApiResponse().json({ data: availableKinds });
  } catch (e) {
    return commonErrorHandlingPlaceAtBottom(e);
  }
}

export async function getAvailableKindsInDb() {
  const t = await getTranslations("countries.kinds");

  const retrievedKinds = await db.getGameKinds();
  return retrievedKinds
    .map(({ applyYears, kind }) => ({ applyYears, kind, label: t(kind) }))
    .filter((k) => {
      return isAllowedGameKind(k.kind) && !suspendedCountriesGameKinds.includes(k.kind);
    });
}
