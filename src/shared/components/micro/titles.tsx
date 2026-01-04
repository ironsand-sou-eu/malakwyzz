import type { PropsWithChildren } from "react";

export function Title({ children }: PropsWithChildren) {
  return (
    <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-dark-blue dark:text-light-green">
      {children}
    </h1>
  );
}

export function Subtitle({ children }: PropsWithChildren) {
  return <h2 className="font-medium tracking-tight text-dark-blue dark:text-light-green">{children}</h2>;
}
