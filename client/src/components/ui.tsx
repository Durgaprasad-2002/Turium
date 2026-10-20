import type {
  ButtonHTMLAttributes,
  LabelHTMLAttributes,
  PropsWithChildren,
} from "react";

export function Card({
  className = "",
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function Button({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Label({
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="mb-1.5 block text-sm font-medium text-slate-700"
      {...props}
    >
      {children}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
