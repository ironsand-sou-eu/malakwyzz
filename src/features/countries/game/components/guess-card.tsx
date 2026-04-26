"use client";

import { type ReactNode, useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaFlagCheckered, FaQuestion, FaRegThumbsDown } from "react-icons/fa";
import "./guess-card.css";
import classNames from "classnames";
import { findFlagUrlByIso3Code } from "country-flags-svg";
import { GOAL_ASSOCIATED_VALUE } from "@/shared/global-constants";
import type { GuessWithLossState } from "./countries-game-provider";

type DirectionsOrGoal = GuessWithLossState["directionToTarget"] | "goal";
const directionIcons: Record<DirectionsOrGoal, ReactNode> = {
  down: <FaChevronDown alignmentBaseline="middle" />,
  goal: <FaQuestion />,
  loss: <FaRegThumbsDown />,
  up: <FaChevronUp />,
  win: <FaFlagCheckered />,
};

type GuessCardProps = {
  guess: GuessWithLossState;
};

export default function GuessCard({ guess }: GuessCardProps) {
  const { associatedValue, directionToTarget, distanceToTarget, guessLabel } = guess;
  const isGoalCard = associatedValue === GOAL_ASSOCIATED_VALUE;
  const label = generateCardLabel();

  const [flagUrl, setFlagUrl] = useState<string | null>(null);

  useEffect(() => {
    setFlagUrl(getFlagUrl(guess));
  }, [guess]);

  function generateCardLabel() {
    if (isGoalCard) return guessLabel;
    if (
      typeof associatedValue === "string" &&
      guessLabel.trim().toLowerCase() === associatedValue.trim().toLowerCase()
    ) {
      return guessLabel;
    }
    return `${guessLabel} - ${associatedValue}`;
  }

  const directionToTargetOrGoal = isGoalCard ? "goal" : directionToTarget;
  if (guess.guessLabel.includes("Democratic")) console.log({ flagUrl });

  return (
    <article
      key={guess.associatedValue}
      className={classNames(
        "flex flex-row justify-between min-w-full max-w-full relative border-y-4 border-amber-900 rounded concavity-left-border sepia-40",
        { "grayscale-50": isGoalCard, "opacity-50": isGoalCard },
      )}
    >
      <div className="guess-card__label-container max-w-9/12 concavity-left">
        {/** biome-ignore lint/performance/noImgElement: if we use a server component here, this file tree will cause a crash because of forcing confetti to run on server */}
        {flagUrl && <img className="guess-card__flag" src={flagUrl} alt="flag" onError={() => setFlagUrl(null)} />}
        <p className="guess-card__label">{label}</p>
      </div>
      <div
        className={classNames("flex flex-row items-center gap-1 w-3/12 justify-center px-4 py-2.5", {
          "bg-amber-300": distanceToTarget > 0 && distanceToTarget <= 20,
          "bg-gray-300": distanceToTarget === 0 && associatedValue === GOAL_ASSOCIATED_VALUE,
          "bg-green-400": distanceToTarget === 0 && associatedValue !== GOAL_ASSOCIATED_VALUE,
          "bg-red-400": distanceToTarget > 20,
        })}
      >
        {directionIcons[directionToTargetOrGoal]}
        {distanceToTarget !== 0 && <div>{distanceToTarget}</div>}
      </div>
    </article>
  );
}

function getFlagUrl(guess: GuessWithLossState) {
  return findFlagUrlByIso3Code(guess.isoCode) || null;
}
