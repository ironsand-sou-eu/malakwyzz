"use client";

import { createContext, type PropsWithChildren, useContext, useState } from "react";
import type { MakeGuessPostResponse } from "@/app/api/countries/makeguess/route";
import type { CountriesGameData } from "@/shared/global-interfaces";

type CountriesContext = {
  guesses: CountriesGameData["guesses"];
  addGuess: (guess: MakeGuessPostResponse) => void;
};

// biome-ignore lint/style/noNonNullAssertion: Context setter
const CountriesContext = createContext<CountriesContext>(null!);

export const useCountriesGuesses = () => useContext(CountriesContext);

export default function CountriesGameProvider({ children }: PropsWithChildren) {
  const [guesses, setGuesses] = useState<CountriesGameData["guesses"]>([]);

  function addGuess(guess: MakeGuessPostResponse) {
    setGuesses(prevValues => {
      const allValues = [...prevValues, guess];
      if (!Number.isNaN(Number(guess.associatedValue))) {
        return allValues.toSorted((a, b) => Number(b.associatedValue) - Number(a.associatedValue));
      }

      const collator = new Intl.Collator("en", { sensitivity: "base" }); //console.log set to correct locale
      return allValues.sort(sortByAssociatedValueAlphabetically(collator));
    });
  }

  const sortByAssociatedValueAlphabetically =
    (collator: Intl.Collator) =>
    (
      a: { associatedValue: MakeGuessPostResponse["associatedValue"] },
      b: { associatedValue: MakeGuessPostResponse["associatedValue"] }
    ) => {
      return collator.compare(`${a.associatedValue}`, `${b.associatedValue}`);
    };

  return <CountriesContext.Provider value={{ guesses, addGuess }}>{children}</CountriesContext.Provider>;
}
