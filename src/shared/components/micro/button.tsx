// biome-ignore-all lint: This is the adapter file
import MuiButton from "@mui/material/Button";
import type { PropsWithChildren, Ref } from "react";

interface ButtonProps extends PropsWithChildren {
  id?: string;
  type: HTMLButtonElement["type"];
  className?: string;
  color?: string;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
  variant?: "filled" | "outlined" | "text";
  onClick?: () => void;
}

export function Button({ children, color, variant = "filled", ...rest }: ButtonProps) {
  const muiVariant = variant === "filled" ? "contained" : variant;

  return (
    <MuiButton variant={muiVariant} style={{ color }} {...rest}>
      {children}
    </MuiButton>
  );
}
