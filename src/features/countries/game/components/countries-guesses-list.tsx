"use client";

import confetti from "@hiseb/confetti";
import { useEffect, useRef } from "react";
import { useCountriesGuesses } from "./countries-game-provider";
import GuessCard from "./guess-card";

export default function CountriesGuessesList() {
  const { guesses, isGameWon } = useCountriesGuesses();

  const confettiTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (!isGameWon) return;
    scheduleConfetti();
    return () => {
      clearTimeout(confettiTimeoutRef.current ?? undefined);
      confettiTimeoutRef.current = null;
    };

    function scheduleConfetti(delayInMs: number = 100) {
      console.log({ delayInMs });
      const confettiTimeout = setTimeout(() => {
        throwRandomConfetti();
        const delay = 500 + Math.ceil(Math.random() * 1500);
        scheduleConfetti(delay);
      }, delayInMs);

      confettiTimeoutRef.current = confettiTimeout;
    }

    function throwRandomConfetti() {
      const count = 50 + Math.ceil(Math.random() * 150);
      const fade = Math.ceil(Math.random() * 10) % 2 === 0;
      const x = 20 + Math.ceil(Math.random() * (window.innerWidth - 40));
      const y = 50 + Math.ceil(Math.random() * (window.innerWidth - 100));
      const velocity = 150 + Math.ceil(Math.random() * 150);
      confetti({
        count,
        fade,
        position: {
          x,
          y,
        },
        velocity,
      });
    }
  }, [isGameWon]);

  return (
    <section className="flex flex-col items-center text-center sm:text-left h-full min-w-full overflow-x-hidden">
      {guesses.map((guess) => (
        <GuessCard key={guess.timestamp} guess={guess} />
      ))}
    </section>
  );
}
