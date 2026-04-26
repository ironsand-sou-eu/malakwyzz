import type { UUID } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";
import z from "zod";
import { db } from "@/db/db";
import type { CountriesGameData } from "@/features/countries/countries-interfaces";
import { MlkApiResponse } from "@/shared/classes/mlk-api-response";
import {
  GameNotFoundException,
  UnsuportedTypeException,
  ValueNotFoundInGameException,
} from "@/shared/exceptions/exceptions";
import { commonErrorHandlingPlaceAtBottom } from "@/shared/functions/api-error-handling";
import { MAX_ATTEMPTS } from "@/shared/global-constants";

const PostBodySchema = z.object({
  gameId: z.string().nonempty(),
  guess: z.string().nonempty(),
});

export type MakeGuessPostBody = z.infer<typeof PostBodySchema>;

export type MakeGuessPostResponse = CountriesGameData["guesses"][number];

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": `${process.env.BASE_API_URL}`,
    },
    status: 200,
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("Content-Type");
    if (contentType !== "application/json") throw new UnsuportedTypeException();

    const body = await req.json();
    const { gameId, guess } = PostBodySchema.parse(body);

    const guessResp = await addGuessToGameInDB({
      gameId: gameId as unknown as AddGuessToGameInDBParams["gameId"],
      guess,
    });

    if (guessResp.error)
      return new MlkApiResponse().defaultServerError({
        message: "There was a problem, it won't count towards your guesses.",
        type: guessResp.code,
      });

    return NextResponse.json(guessResp.data, {
      headers: {
        "Access-Control-Allow-Origin": `${process.env.BASE_API_URL}`,
      },
      status: 201,
    });
  } catch (e) {
    if (e instanceof ValueNotFoundInGameException) {
      return new MlkApiResponse().defaultRequestError({ message: e.message, type: e.name });
    }

    if (e instanceof GameNotFoundException) {
      return new MlkApiResponse().status("500-internalServerError").json({ message: e.message, type: e.name });
    }

    return commonErrorHandlingPlaceAtBottom(e);
  }
}

interface AddGuessToGameInDBParams {
  gameId: UUID;
  guess: string;
}

type MlkFunctionResponse<T> = { error: false; data: T } | { error: true; code: string };

export async function addGuessToGameInDB({
  gameId,
  guess,
}: AddGuessToGameInDBParams): Promise<MlkFunctionResponse<MakeGuessPostResponse>> {
  const gameInfo = await db.getGameInfo({ gameId });
  if (!gameInfo) throw new GameNotFoundException();

  if (gameInfo.guesses.length >= MAX_ATTEMPTS) {
    return { code: "game.finished-game", error: true };
  }

  const foundIndex = gameInfo.context.gameUniverse.findIndex((item) => {
    const lcTrimmedGuess = guess.toLowerCase().trim();
    return (
      item.countryCode.toLowerCase().trim() === lcTrimmedGuess ||
      item.countryNames.some((countryName) => countryName.toLowerCase().trim() === lcTrimmedGuess)
    );
  });

  if (foundIndex === -1) throw new ValueNotFoundInGameException();

  const match = gameInfo.context.gameUniverse[foundIndex];

  const newGuess: MakeGuessPostResponse = {
    associatedValue: match.value ?? match.countryCode,
    directionToTarget: getDirectionToTarget(foundIndex, gameInfo.target.index),
    distanceToTarget: Math.abs(foundIndex - gameInfo.target.index),
    guess,
    guessLabel: match.countryNames[0],
    isoCode: match.countryCode,
    possessionOf: match.possessionOf,
    timestamp: new Date().toISOString(),
  };

  const { modifiedCount } = await db.addGuessToGame({ gameId, newGuess });

  if (modifiedCount !== 1) {
    return { code: "db.multiple-rowd-updated", error: true };
  }

  const wasLastAttempt = gameInfo.guesses.length === MAX_ATTEMPTS - 1;
  if (wasLastAttempt && newGuess.directionToTarget !== "win") {
    newGuess.targetName = gameInfo.context.gameUniverse[gameInfo.target.index].countryNames[0];
    newGuess.targetAssociatedValue = gameInfo.context.gameUniverse[gameInfo.target.index].value;
  }

  return { data: newGuess, error: false };
}

function getDirectionToTarget(
  guessIndex: number,
  targetIndex: number,
): Parameters<typeof db.addGuessToGame>[0]["newGuess"]["directionToTarget"] {
  if (guessIndex === targetIndex) return "win";
  if (guessIndex > targetIndex) return "up";
  return "down";
}
