// biome-ignore-all lint: This is the adapter file
import MuiMenu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import type { CSSProperties, PropsWithChildren, ReactNode, Ref } from "react";

interface DropDownProps<T> extends PropsWithChildren {
  anchorElement: HTMLElement | null;
  isOpen: boolean;
  options: { id: string; value: T; label: string; startIcon?: ReactNode }[];
  onClickOption: (value: T) => void;
  onClose: () => void;
}

export function DropDown<T = unknown>({ anchorElement, isOpen, options, onClickOption, onClose }: DropDownProps<T>) {
  return (
    <MuiMenu
      anchorEl={anchorElement}
      open={isOpen}
      onClose={onClose}
      slotProps={{
        list: { "aria-labelledby": anchorElement?.id },
      }}
    >
      {options.map((o) => (
        <MuiMenuItem className="dropdown__dd-item" key={o.id} onClick={() => onClickOption(o.value)}>
          <div className="dropdown__dd-item-icon">{o.startIcon}</div>
          {o.label}
        </MuiMenuItem>
      ))}
    </MuiMenu>
  );
}
