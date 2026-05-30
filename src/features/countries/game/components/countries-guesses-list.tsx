"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Subtitle } from "@/shared/components/micro/titles";
import { useCountriesGuesses } from "./countries-game-provider";
import GuessCard from "./guess-card";

export default function CountriesGuessesList() {
  const { guesses, isGameLost, isGameWon, remainingAttempts } = useCountriesGuesses();
  const t = useTranslations("");

  const confettiTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    let confetti: null | typeof import("@hiseb/confetti").default = null;

    const loadConfetti = async () => {
      confetti = (await import("@hiseb/confetti")).default;
    };

    if (!confetti) loadConfetti();

    if (!isGameWon) return;
    scheduleConfetti();
    return () => {
      clearTimeout(confettiTimeoutRef.current ?? undefined);
      confettiTimeoutRef.current = null;
    };

    function scheduleConfetti(delayInMs: number = 100) {
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
      confetti?.({
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
    <section className="flex flex-col items-center max-w-full text-center sm:text-left h-full min-w-full overflow-x-hidden">
      {!isGameWon && !isGameLost && <Subtitle>{t("remaining-attempts", { remaining: remainingAttempts })}</Subtitle>}

      {guesses.map((guess) => (
        <GuessCard key={guess.timestamp} guess={guess} />
      ))}
    </section>
  );
}
