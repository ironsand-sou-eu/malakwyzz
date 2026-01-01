"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button, TextInput } from "@/shared/components/micro/button";
import { BASE_API_URL } from "@/shared/global-constants";
import type { CountriesGameData } from "@/shared/global-interfaces";
import useNotification from "@/shared/hooks/use-notification";

type CountriesGameSectionProps = {
  gameId: string;
};

export default function CountriesGameSection({ gameId }: CountriesGameSectionProps) {
  const notify = useNotification();

  const [guesses, setGuesses] = useState<CountriesGameData["guesses"]>([]);
  const [currentGuess, setCurrentGuess] = useState("");

  const makeGuessMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch(`${BASE_API_URL}/api/countries/makeguess`, {
        body: JSON.stringify({ gameId, guess: currentGuess }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const jsonResp = await resp.json();

      if (resp.ok) {
        setGuesses(prevValues => {
          const allValues = [...prevValues, jsonResp];
          if (!Number.isNaN(jsonResp.associatedValue)) {
            return allValues.toSorted((a, b) => b.associatedValue - a.associatedValue);
          }

          const collator = new Intl.Collator("en", { sensitivity: "base" }); //console.log set to correct locale
          return allValues.sort(sortByAssociatedValueAlphabetically(collator));
        });
        return;
      }

      notify.warning(jsonResp.message);
      return;
    },
  });

  const sortByAssociatedValueAlphabetically =
    (collator: Intl.Collator) => (a: { associatedValue: string }, b: { associatedValue: string }) => {
      return collator.compare(a.associatedValue, b.associatedValue);
    };

  function handleClick() {
    makeGuessMutation.mutate();
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center sm:text-left min-h-full">
      <section className="flex flex-col items-center gap-6 text-center sm:text-left h-full min-w-full">
        {guesses.map(guess => (
          <article key={guess.associatedValue} className="flex flex-row justify-between p-2 min-w-full">
            <div>{guess.guess}</div>
            <div>{guess.associatedValue}</div>
            <div>{guess.directionToTarget}</div>
            <div>{guess.distanceToTarget}</div>
          </article>
        ))}
      </section>
      <section className="flex flex-row items-center gap-6 text-center sm:text-left">
        <TextInput value={currentGuess} onChange={ev => setCurrentGuess(ev.currentTarget.value)} />
        <Button type="button" onClick={handleClick}>
          Guess
        </Button>
      </section>
    </div>
  );
}
