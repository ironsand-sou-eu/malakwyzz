"use client";

import type { ReactNode } from "react";
import { FaChevronDown, FaChevronUp, FaFlagCheckered, FaQuestion, FaRegThumbsDown } from "react-icons/fa";
import "./guess-card.css";
import classNames from "classnames";
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

  return (
    <article
      key={guess.associatedValue}
      className={classNames(
        "flex flex-row justify-between min-w-full max-w-full relative border-y-4 border-amber-900 rounded concavity-left-border sepia-40",
        { "grayscale-50": isGoalCard, "opacity-50": isGoalCard },
      )}
    >
      <div className="flex flex-row items-center gap-1 w-full px-8 py-2.5 concavity-left">{label}</div>
      <div className="flex flex-row items-center gap-1 min-w-3/12 justify-center px-4 py-2.5 bg-red-400">
        {directionIcons[directionToTargetOrGoal]}
        {distanceToTarget !== 0 && <div>{distanceToTarget}</div>}
      </div>
    </article>
  );
}
