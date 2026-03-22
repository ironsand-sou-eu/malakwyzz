// biome-ignore-all lint: This is the adapter file
import MuiTextField from "@mui/material/TextField";
import type { ChangeEventHandler, KeyboardEventHandler, MouseEventHandler, RefObject } from "react";

interface TextInputProps {
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null> | null;
  value?: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export function TextInput({ value = "", ...rest }: TextInputProps) {
  return <MuiTextField variant="filled" value={value} {...rest} />;
}
