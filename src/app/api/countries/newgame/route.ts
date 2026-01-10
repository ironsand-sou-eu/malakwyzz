import type { UUID } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import z from "zod";
import { db } from "@/db/db";
import { MlkApiResponse } from "@/shared/classes/mlk-api-response";
import {
  InsufficientGameDataAmountException,
  UnavailableGameKindException,
  UnsuportedTypeException,
} from "@/shared/exceptions/exceptions";
import { commonErrorHandlingPlaceAtBottom } from "@/shared/functions/api-error-handling";
import { isAllowedGameKind } from "@/shared/functions/typeguards";
import { MIN_COUNTRIES_PER_GAME } from "@/shared/global-constants";
import type { CountriesGameKind, CountriesGameUniverse } from "@/shared/global-interfaces";

const PostBodySchema = z.object({
  kind: z.string().nonempty(),
  userId: z.uuidv7(),
  year: z.number().min(1900).max(new Date().getFullYear()),
});

export type NewGamePostBody = z.infer<typeof PostBodySchema>;

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
    if (e instanceof UnavailableGameKindException) {
      return new MlkApiResponse().status("422-unprocessableContent").defaultRequestError({
        message: "Unavailable game kind. Choose another and try again.",
        type: e.name,
      });
    }
    return commonErrorHandlingPlaceAtBottom(e);
  }
}

interface CreateCountriesGameInDBParams {
  userId: UUID;
  kind: string;
  year: number;
}
export async function createCountriesGameInDB({ userId, kind, year }: CreateCountriesGameInDBParams) {
  if (!isAllowedGameKind(kind)) throw new UnavailableGameKindException();
  const kindDecimalsPromise = db.getDecimalsForKind(kind);
  const gameUniversePromise = db.getGameUniverse({ kind, year });
  const [kindDecimals, gameUniverse] = await Promise.all([kindDecimalsPromise, gameUniversePromise]);
  if (gameUniverse.length < MIN_COUNTRIES_PER_GAME) throw new InsufficientGameDataAmountException();
  const countryNamedGameUniverse = await insertCountryNames(gameUniverse);
  const gameUniverseWithValues = insertValuesIfAlphabetical(kind, countryNamedGameUniverse);
  const sortedGameUniverse = sortGameUniverse(gameUniverseWithValues);
  const target = getGameTarget(sortedGameUniverse);
  const decimalsAdaptedGameUniverse = adaptGameUniverseDecimals(sortedGameUniverse, kind, kindDecimals);
  const resp = await db.createGame({ gameUniverse: decimalsAdaptedGameUniverse, kind, target, userId, year });
  console.log("Game created", resp.insertedId?.toString(), target);
  return resp.insertedId as UUID;
}

function getGameTarget(array: CountriesGameUniverse) {
  const { index, value } = getRandomItemFromArray(array);
  return { index, value: value.countryCode };
}

function getRandomItemFromArray<T>(array: T[]) {
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  const targetIndex = Math.floor(randomValue * array.length);
  return { index: targetIndex, value: array[targetIndex] };
}

async function insertCountryNames(
  universe: Awaited<ReturnType<typeof db.getGameUniverse>>,
): Promise<CountriesGameUniverse> {
  const t = await getTranslations("countries.countries-by-code");

  return universe.map((item) => {
    const translatedDoubleSlashSeparatedNames = item.countryCode ? t(item.countryCode) : "";
    return {
      ...item,
      countryCode: item.countryCode ?? "",
      countryNames: translatedDoubleSlashSeparatedNames.split("//"),
    };
  });
}

function insertValuesIfAlphabetical(kind: CountriesGameKind, universe: CountriesGameUniverse) {
  if (kind !== "alphabetical") return universe;
  return universe.map((entry) => ({ ...entry, value: entry.countryNames[0] }));
}

function sortGameUniverse(universe: CountriesGameUniverse) {
  if (!Number.isNaN(Number(universe[0].value))) {
    return universe.toSorted((entryA, entryB) => (entryB.value as number) - (entryA.value as number));
  }
  const collator = new Intl.Collator("en", { sensitivity: "base" }); //console.log: set to correct locale
  return universe.toSorted((entryA, entryB) => collator.compare(`${entryA.value}`, `${entryB.value}`));
}

function adaptGameUniverseDecimals(
  universe: CountriesGameUniverse,
  kind: CountriesGameKind,
  decimals?: number | null,
): CountriesGameUniverse {
  if (kind === "alphabetical") return universe;

  return universe.map((entry) => {
    const valueAsString = String(entry.value) ?? "";
    const value = toDecimalNumberIfNeeded(valueAsString, decimals);
    return { ...entry, value };
  });
}

function toDecimalNumberIfNeeded(str: string, decimals: number | null | undefined) {
  const num = parseInt(str, 10);
  if (Number.isNaN(num)) return str;

  if (!decimals) return parseInt(str, 10);

  const interpolatedDecimal = Array.from(str)
    .toSpliced(-1 * decimals, 0, ".")
    .join("");
  return parseFloat(interpolatedDecimal);
}
