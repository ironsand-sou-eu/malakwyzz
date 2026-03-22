"use client";

import { useTranslations } from "next-intl";
import { createContext, type PropsWithChildren, useContext, useState } from "react";
import type { MakeGuessPostResponse } from "@/app/api/countries/makeguess/route";
import { GOAL_ASSOCIATED_VALUE, MAX_ATTEMPTS } from "@/shared/global-constants";
import type { CountriesGameData } from "@/shared/global-interfaces";

export type GuessWithLossState = Omit<CountriesGameData["guesses"][number], "directionToTarget"> & {
  directionToTarget: CountriesGameData["guesses"][number]["directionToTarget"] | "loss";
};

type CountriesContext = {
  guesses: GuessWithLossState[];
  isGameWon: boolean;
  isGameLost: boolean;
  remainingAttempts: number;
  addGuess: (guess: MakeGuessPostResponse) => void;
};

// biome-ignore lint/style/noNonNullAssertion: Context setter
const CountriesContext = createContext<CountriesContext>(null!);

export const useCountriesGuesses = () => useContext(CountriesContext);

export default function CountriesGameProvider({ children }: PropsWithChildren) {
  const t = useTranslations("");

  const [guesses, setGuesses] = useState<GuessWithLossState[]>([
    {
      associatedValue: GOAL_ASSOCIATED_VALUE,
      directionToTarget: "win",
      distanceToTarget: 0,
      guess: t("guess-me"),
      guessLabel: t("guess-me"),
      timestamp: "",
    },
  ]);

  function addGuess(guess: MakeGuessPostResponse) {
    let allValues: GuessWithLossState[] = [...guesses, guess];

    const isFinalGuessOfLostGame = guess.targetName;
    if (guess.directionToTarget === "win") allValues = toRemovedPhantomGoalEntry(allValues);
    if (isFinalGuessOfLostGame) allValues = toChangedPhantomGoalEntry(allValues, guess as Required<GuessWithLossState>);
    setGuesses(allValues.toSorted(sortByDistanceToTarget));
  }

  function toRemovedPhantomGoalEntry(entries: GuessWithLossState[]): GuessWithLossState[] {
    return entries.filter((g) => g.associatedValue !== GOAL_ASSOCIATED_VALUE);
  }

  function toChangedPhantomGoalEntry(
    entries: GuessWithLossState[],
    newGuess: Pick<Required<GuessWithLossState>, "targetName" | "targetAssociatedValue">,
  ): GuessWithLossState[] {
    const phantomGoalEntryIndex = entries.findIndex((g) => g.associatedValue === GOAL_ASSOCIATED_VALUE);
    const lostGameGoalGuess: GuessWithLossState = {
      associatedValue: newGuess.targetAssociatedValue || "",
      directionToTarget: "loss",
      distanceToTarget: 0,
      guess: "",
      guessLabel: newGuess.targetName,
      timestamp: new Date().toISOString(),
    };
    return entries.toSpliced(phantomGoalEntryIndex, 1, lostGameGoalGuess);
  }

  function sortByDistanceToTarget(a: GuessWithLossState, b: GuessWithLossState) {
    const multiplier = { down: 1, loss: 0, up: -1, win: 0 };
    return b.distanceToTarget * multiplier[b.directionToTarget] - a.distanceToTarget * multiplier[a.directionToTarget];
  }

  const isGameLost = guesses.some((g) => !!g.targetName);
  const isGameWon = guesses.some((g) => g.directionToTarget === "win" && g.associatedValue !== GOAL_ASSOCIATED_VALUE);
  const remainingAttempts = MAX_ATTEMPTS - guesses.length + 1;

  return (
    <CountriesContext.Provider value={{ addGuess, guesses, isGameLost, isGameWon, remainingAttempts }}>
      {children}
    </CountriesContext.Provider>
  );
}
