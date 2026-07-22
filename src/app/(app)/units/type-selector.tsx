import { UNIT_TYPE_LABELS, type UnitType } from "@/lib/types";

// CareHub Records.dc.html's "Add/edit unit" form uses a pill row, not a
// native <select>, for Type. Pure CSS via peer-checked — no client
// component needed, stays a plain server-rendered form.
export function TypeSelector({ defaultValue }: { defaultValue?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.entries(UNIT_TYPE_LABELS) as [UnitType, string][]).map(([value, label]) => (
        <label key={value} className="cursor-pointer">
          <input
            type="radio"
            name="type"
            value={value}
            defaultChecked={defaultValue ? defaultValue === value : value === "private_clinic"}
            className="peer sr-only"
          />
          <span className="inline-block rounded-full border-[1.5px] border-border bg-background px-3.5 py-2 text-[13px] font-semibold text-muted transition-colors peer-checked:border-accent-secondary peer-checked:bg-surface peer-checked:text-foreground">
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}
