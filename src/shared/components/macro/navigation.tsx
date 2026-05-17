/** biome-ignore-all lint/performance/noImgElement: the flags are processed in the frontend */
"use client";

import classNames from "classnames";
import { findFlagUrlByIso2Code } from "country-flags-svg";
import { type Locale, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaGlobe } from "react-icons/fa";
import { FiMoon, FiSun } from "react-icons/fi";
import { Button } from "../micro/button";
import { DropDown } from "../micro/dropdown";

interface NavBarProps {
  changeLocaleAction: LocaleSelectorProps["changeLocaleAction"];
}

export default function NavBar({ changeLocaleAction }: NavBarProps) {
  return (
    <nav className="h-10 flex flex-row justify-between items-center px-3">
      <div />
      <div className="flex flex-row items-center gap-3">
        <LocaleSelector changeLocaleAction={changeLocaleAction} />
        <ThemeSwitch />
      </div>
    </nav>
  );
}

interface LocaleSelectorProps {
  changeLocaleAction: (locale: Locale) => Promise<void>;
}

function LocaleSelector({ changeLocaleAction }: LocaleSelectorProps) {
  const locale = useLocale();

  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: it is a necessary dependency, clearly used inside the function
  const isInGamePage = useMemo(() => {
    const GAME_PAGE_REGEX = /\/.+\/.+/g;
    return GAME_PAGE_REGEX.test(location.pathname);
  }, [location?.pathname]);

  const availableLanguages: Parameters<typeof DropDown<string>>[0]["options"] = [
    {
      id: "en",
      label: "English",
      startIcon: <img src={findFlagUrlByIso2Code("gb")} alt="UK flag" />,
      value: "en",
    },
    {
      id: "es",
      label: "Español",
      startIcon: <img src={findFlagUrlByIso2Code("es")} alt="Bandera de España" />,
      value: "es",
    },
    {
      id: "pt",
      label: "Português",
      startIcon: <img src={findFlagUrlByIso2Code("br")} alt="Brazil flag" />,
      value: "pt",
    },
    {
      id: "ru",
      label: "Русcкий",
      startIcon: <img src={findFlagUrlByIso2Code("ru")} alt="Russian flag" />,
      value: "ru",
    },
    {
      id: "ua",
      label: "Українська",
      startIcon: <img src={findFlagUrlByIso2Code("ua")} alt="Ukrainian flag" />,
      value: "ua",
    },
  ];

  function handleChangeLng(value: string) {
    changeLocaleAction(value);
    setVisible(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="text"
        className={classNames("flex flex-row gap-2", { "opacity-50": isInGamePage })}
        color="var(--color-dark-blue)"
        id="locale-btn"
        ref={buttonRef}
        onClick={() => setVisible(true)}
        disabled={isInGamePage}
      >
        <FaGlobe size="1.5em" className="cursor-pointer" />
        {locale}
      </Button>
      <DropDown<string>
        anchorElement={buttonRef.current}
        isOpen={visible}
        onClose={() => setVisible(false)}
        onClickOption={handleChangeLng}
        options={availableLanguages}
      />
    </>
  );
}

function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <AiOutlineLoading3Quarters size="1.5em" />;
  return resolvedTheme === "dark" ? (
    <FiMoon size="1.5em" className="cursor-pointer text-dark-blue" onClick={() => setTheme("light")} />
  ) : (
    <FiSun size="1.5em" className="cursor-pointer text-dark-blue" onClick={() => setTheme("dark")} />
  );
}
