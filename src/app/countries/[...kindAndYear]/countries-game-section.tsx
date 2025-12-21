"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "toastify-js";
import { Button, TextInput } from "@/app/(shared)/components/micro/button";
import type { CountriesGameData } from "@/app/(shared)/global-interfaces";

type CountriesGameSectionProps = {
  gameId: string;
};

export default function CountriesGameSection({ gameId }: CountriesGameSectionProps) {
  const [guesses, setGuesses] = useState<CountriesGameData["guesses"]>([]);
  const [currentGuess, setCurrentGuess] = useState("");

  const makeGuessMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch("http://192.168.1.134:3000/api/makeguess", {
        body: JSON.stringify({ gameId, guess: currentGuess }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const jsonResp = await resp.json();

      if (resp.ok) {
        setGuesses(prevValues => {
          const collator = new Intl.Collator("en");
          return [...prevValues, jsonResp].sort((a, b) => collator.compare(a.guess, b.guess));
        });
        return;
      }

      Toast({
        text: jsonResp.message,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "15px",
          background: "linear-gradient(to right, #00b09b, #96c93d)",
          maxWidth: "max-content",
        },
      }).showToast();
      return;
    },
  });

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
