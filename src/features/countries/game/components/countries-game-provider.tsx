"use client";

import { useTranslations } from "next-intl";
import { createContext, type PropsWithChildren, useContext, useState } from "react";
import type { MakeGuessPostResponse } from "@/app/api/countries/makeguess/route";
import { GOAL_ASSOCIATED_VALUE } from "@/shared/global-constants";
import type { CountriesGameData } from "@/shared/global-interfaces";

type CountriesContext = {
  guesses: CountriesGameData["guesses"];
  addGuess: (guess: MakeGuessPostResponse) => void;
};

// biome-ignore lint/style/noNonNullAssertion: Context setter
const CountriesContext = createContext<CountriesContext>(null!);

export const useCountriesGuesses = () => useContext(CountriesContext);

export default function CountriesGameProvider({ children }: PropsWithChildren) {
  const t = useTranslations("");

  const [guesses, setGuesses] = useState<CountriesGameData["guesses"]>([
    {
      associatedValue: GOAL_ASSOCIATED_VALUE,
      directionToTarget: "win",
      distanceToTarget: 0,
      guess: t("guess-me"),
      timestamp: "",
    },
  ]);

  function addGuess(guess: MakeGuessPostResponse) {
    if (guess.directionToTarget === "win") {
      setGuesses(prevValues => prevValues.filter(g => g.associatedValue !== GOAL_ASSOCIATED_VALUE));
    }

    setGuesses(prevValues => {
      const allValues = [...prevValues, guess];
      return allValues.toSorted((a, b) => {
        const multiplier = { down: 1, up: -1, win: 0 };
        return (
          b.distanceToTarget * multiplier[b.directionToTarget] - a.distanceToTarget * multiplier[a.directionToTarget]
        );
      });
    });
  }

  return <CountriesContext.Provider value={{ addGuess, guesses }}>{children}</CountriesContext.Provider>;
}
