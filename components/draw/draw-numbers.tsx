/** Draw numbers rendered as lottery-style balls. */
export function DrawNumbers({
  numbers,
  size = "md",
}: {
  numbers: (number | null)[];
  size?: "md" | "lg";
}) {
  const box =
    size === "lg"
      ? "size-12 text-xl"
      : "size-9 text-base";
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Draw numbers">
      {numbers.map((n, i) => (
        <li
          key={i}
          className={`${box} flex items-center justify-center rounded-full bg-brand-700 font-semibold text-white`}
          aria-label={`Number ${n ?? "—"}`}
        >
          {n ?? "—"}
        </li>
      ))}
    </ul>
  );
}
