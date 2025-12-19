"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiMoon, FiSun } from "react-icons/fi";

export default function NavBar() {
  return (
    <nav className="h-10 flex flex-row justify-between items-center px-3">
      <div />
      <ThemeSwitch />
    </nav>
  );
}

function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <AiOutlineLoading3Quarters size="1.5em" />;
  return resolvedTheme === "dark" ? (
    <FiSun size="1.5em" className="cursor-pointer" onClick={() => setTheme("light")} />
  ) : (
    <FiMoon size="1.5em" className="cursor-pointer" onClick={() => setTheme("dark")} />
  );
}
