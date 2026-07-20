// src/shared/components/primary-action.tsx
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/utils";

type Props = {
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  isLoading?: boolean; // Nuevo prop
  onClick: () => void;
};

export function PrimaryAction({ label, icon: Icon, disabled = false, isLoading = false, onClick }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold transition",
        disabled ? "cursor-not-allowed bg-white/10 text-white/35" : "bg-white text-black hover:bg-neutral-200",
        isLoading && "opacity-80 cursor-wait"
      )}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} strokeWidth={2.5} />
      ) : null}
      {isLoading ? "Procesando..." : label}
    </button>
  );
}