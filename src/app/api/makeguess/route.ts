import type { UUID } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { MlkApiResponse } from "@/app/(shared)/classes/mlk-api-response";
import {
  GameNotFoundException,
  UnsuportedTypeException,
  ValueNotFoundInGameException,
} from "@/app/(shared)/exceptions/exceptions";
import { db } from "@/db/db";

const PostBodySchema = z.object({
  gameId: z.string().nonempty(),
  guess: z.string().nonempty(),
});

export type MakeGuessPostBody = AddGuessToGameInDBParams;

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
      return NextResponse.json(
        { error: "There was a problem, it won't count towards your guesses." },
        { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
      );

    return NextResponse.json(guessResp, { status: 201, headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    if (e instanceof ValueNotFoundInGameException) {
      return new MlkApiResponse()
        .headers({ "Access-Control-Allow-Origin": "*" })
        .defaultRequestError({ type: e.name, message: e.message });
    }

    if (e instanceof GameNotFoundException) {
      return new MlkApiResponse()
        .status("500-internalServerError")
        .headers({ "Access-Control-Allow-Origin": "*" })
        .json({ type: e.name, message: e.message });
    }

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

    if (e instanceof Error) {
      return new MlkApiResponse()
        .status("422-unprocessableContent")
        .defaultRequestError({ type: e.name, message: e.message });
    }
  }
}

interface AddGuessToGameInDBParams {
  gameId: UUID;
  guess: string;
}
export async function addGuessToGameInDB({ gameId, guess }: AddGuessToGameInDBParams) {
  const gameInfo = await db.getGameInfo({ gameId });
  if (!gameInfo) throw new GameNotFoundException();

  const foundIndex = gameInfo.context.gameUniverse.findIndex(
    item => item.country.toLowerCase().trim() === guess.toLowerCase().trim()
  );

  if (foundIndex === -1) throw new ValueNotFoundInGameException();

  const newGuess: Parameters<typeof db.addGuessToGame>[0]["newGuess"] = {
    directionToTarget: getDirectionToTarget(foundIndex, gameInfo.target.index),
    distanceToTarget: Math.abs(foundIndex - gameInfo.target.index),
    guess,
    associatedValue: gameInfo.context.gameUniverse[foundIndex].value,
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
