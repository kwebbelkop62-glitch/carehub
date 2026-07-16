const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  attended: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  sent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export function Badge({ status }: { status: string }) {
  const classes = statusClasses[status] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes}`}>
      {status}
    </span>
  );
}
