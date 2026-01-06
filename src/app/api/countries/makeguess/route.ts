import type { UUID } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";
import z from "zod";
import { db } from "@/db/db";
import { MlkApiResponse } from "@/shared/classes/mlk-api-response";
import {
  GameNotFoundException,
  UnsuportedTypeException,
  ValueNotFoundInGameException,
} from "@/shared/exceptions/exceptions";
import { commonErrorHandlingPlaceAtBottom } from "@/shared/functions/api-error-handling";

const PostBodySchema = z.object({
  gameId: z.string().nonempty(),
  guess: z.string().nonempty(),
});

export type MakeGuessPostBody = z.infer<typeof PostBodySchema>;

export type MakeGuessPostResponse = {
  guess: string;
  associatedValue: string | number;
  directionToTarget: "up" | "down" | "win";
  distanceToTarget: number;
  timestamp: string;
};

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

    if (!guessResp)
      return new MlkApiResponse().defaultServerError({
        message: "There was a problem, it won't count towards your guesses.",
        type: "Internal server error",
      });

    return NextResponse.json(guessResp, { headers: { "Access-Control-Allow-Origin": "*" }, status: 201 });
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
export async function addGuessToGameInDB({
  gameId,
  guess,
}: AddGuessToGameInDBParams): Promise<MakeGuessPostResponse | undefined> {
  const gameInfo = await db.getGameInfo({ gameId });
  if (!gameInfo) throw new GameNotFoundException();

  const foundIndex = gameInfo.context.gameUniverse.findIndex(item => {
    const lcTrimmedGuess = guess.toLowerCase().trim();
    return (
      item.countryCode.toLowerCase().trim() === lcTrimmedGuess ||
      item.countryNames.some(countryName => countryName.toLowerCase().trim() === lcTrimmedGuess)
    );
  });

  if (foundIndex === -1) throw new ValueNotFoundInGameException();

  const newGuess: Parameters<typeof db.addGuessToGame>[0]["newGuess"] = {
    associatedValue:
      gameInfo.context.gameUniverse[foundIndex].value ?? gameInfo.context.gameUniverse[foundIndex].countryCode,
    directionToTarget: getDirectionToTarget(foundIndex, gameInfo.target.index),
    distanceToTarget: Math.abs(foundIndex - gameInfo.target.index),
    guess,
    timestamp: new Date().toISOString(),
  };

  const { modifiedCount } = await db.addGuessToGame({ gameId, newGuess });
  if (modifiedCount !== 1) {
    console.error("Something strange happened while updating");
    return;
  }

  return newGuess;
}

function getDirectionToTarget(
  guessIndex: number,
  targetIndex: number
): Parameters<typeof db.addGuessToGame>[0]["newGuess"]["directionToTarget"] {
  if (guessIndex === targetIndex) return "win";
  if (guessIndex > targetIndex) return "up";
  return "down";
}
