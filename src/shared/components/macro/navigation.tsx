"use client";

import { type Locale, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
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

  const availableLanguages = [
    { id: "en", label: "English", value: "en" },
    { id: "es", label: "Español", value: "es" },
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
        className="flex flex-row gap-2"
        color="var(--color-dark-blue)"
        id="locale-btn"
        ref={buttonRef}
        onClick={() => setVisible(true)}
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
