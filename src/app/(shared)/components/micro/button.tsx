// biome-ignore lint: This is the adapter file
import MuiButton from "@mui/material/Button";
import type { PropsWithChildren } from "react";

interface ButtonProps extends PropsWithChildren {
  type: HTMLButtonElement["type"];
  className?: string;
  onClick?: () => void;
}

export default function Button({ children, ...rest }: ButtonProps) {
  return (
    <MuiButton variant="contained" {...rest}>
      {children}
    </MuiButton>
  );
}
