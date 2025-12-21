import type { UUID } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { MlkApiResponse } from "@/app/(shared)/classes/mlk-api-response";
import {
  InsufficientGameDataAmountException,
  UnavailableGameKindException,
  UnsuportedTypeException,
} from "@/app/(shared)/exceptions/exceptions";
import { isAllowedGameKind } from "@/app/(shared)/functions/typeguards";
import type { CountriesGameKind, CountriesGameUniverse } from "@/app/(shared)/global-interfaces";
import { db } from "@/db/db";

const PostBodySchema = z.object({
  kind: z.string().nonempty(),
  userId: z.uuidv7(),
  year: z.number().min(1900).max(new Date().getFullYear()),
});

export type NewGamePostBody = CreateCountriesGameInDBParams;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("Content-Type");
    if (contentType !== "application/json") throw new UnsuportedTypeException();

    const body = await req.json();
    const { kind, userId, year } = PostBodySchema.parse(body);

    const gameId = await createCountriesGameInDB({
      kind,
      userId: userId as unknown as CreateCountriesGameInDBParams["userId"],
      year,
    });

    return NextResponse.json({ gameId }, { status: 201 });
  } catch (e) {
    if (e instanceof UnsuportedTypeException) {
      return new MlkApiResponse().status("415-unsupportedMediaType").defaultRequestError({
        type: "UnsuportedTypeException",
        message: e.message,
        stack: e.stack,
      });
    }

    if (e instanceof SyntaxError && e.message === "Unexpected end of JSON input") {
      return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
        type: e.name,
        message: "Problem reading the body.",
        stack: e.stack,
      });
    }

    if (e instanceof UnavailableGameKindException) {
      return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
        type: e.name,
        message: "Unavailable game kind. Choose another and try again.",
        stack: e.stack,
      });
    }

    if (e instanceof ZodError) {
      return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
        type: "ValidationException",
        message: e.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n"),
        stack: e.stack,
      });
    }

    if (e instanceof Error) {
      return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
        type: e.name,
        message: e.message,
        stack: e.stack,
      });
    }
    console.warn({
      inst: e instanceof SyntaxError,
      MLK_ERR: e,
      msg: e instanceof ZodError && e.issues,
      name: e instanceof SyntaxError && e.name,
      cause: e instanceof SyntaxError && e.cause,
    });
  }
}

interface CreateCountriesGameInDBParams {
  userId: UUID;
  kind: string;
  year: number;
}
export async function createCountriesGameInDB({ userId, kind, year }: CreateCountriesGameInDBParams) {
  const MIN_COUNTRIES_PER_GAME = 100;
  if (!isAllowedGameKind(kind)) throw new UnavailableGameKindException();
  const kindDecimalsPromise = db.getDecimalsForKind(kind);
  const gameUniversePromise = db.getGameUniverse(kind, year);
  const [kindDecimals, gameUniverse] = await Promise.all([kindDecimalsPromise, gameUniversePromise]);
  if (gameUniverse.length < MIN_COUNTRIES_PER_GAME) throw new InsufficientGameDataAmountException();
  const target = getGameTarget(gameUniverse);
  const decimalsAdaptedGameUniverse = adaptGameUniverseDecimals(gameUniverse, kind, kindDecimals);
  const resp = await db.createGame({ gameUniverse: decimalsAdaptedGameUniverse, kind, userId, year, target });
  console.log("Game created", resp.insertedId?.toString(), target);
  return resp.insertedId as UUID;
}

function getGameTarget(array: Awaited<ReturnType<typeof db.getGameUniverse>>) {
  const { index, value } = getRandomItemFromArray(array);
  return { index, value: value.country };
}

function getRandomItemFromArray<T>(array: T[]) {
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  const targetIndex = Math.floor(randomValue * array.length);
  return { value: array[targetIndex], index: targetIndex };
}

function adaptGameUniverseDecimals(
  universe: Awaited<ReturnType<typeof db.getGameUniverse>>,
  kind: CountriesGameKind,
  decimals?: number | null
): CountriesGameUniverse {
  if (kind === "alphabetical") return universe.map(item => ({ country: item.country, value: item.country }));

  return universe.map(entry => {
    const valueAsString = String(entry[kind as keyof typeof entry]) ?? "";
    const value = !decimals
      ? valueAsString
      : Array.from(valueAsString)
          .toSpliced(-1 * decimals, 0, ",")
          .join("");
    return { country: entry.country, value };
  });
}
