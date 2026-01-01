// biome-ignore-all lint: This is the adapter file
import MuiButton from "@mui/material/Button";
import MuiTextField from "@mui/material/TextField";
import type { ChangeEventHandler, MouseEventHandler, PropsWithChildren } from "react";

interface ButtonProps extends PropsWithChildren {
  type: HTMLButtonElement["type"];
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ children, ...rest }: ButtonProps) {
  return (
    <MuiButton variant="contained" {...rest}>
      {children}
    </MuiButton>
  );
}

interface TextInputProps {
  className?: string;
  value?: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export function TextInput({ value = "", ...rest }: TextInputProps) {
  return <MuiTextField variant="filled" value={value} {...rest} />;
}
