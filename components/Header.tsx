import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-structural2 bg-canvas">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber" aria-hidden="true" />
          <span className="font-display text-lg font-semibold tracking-tight text-blue-deep">
            VistoPrep
          </span>
        </Link>
        <p className="hidden font-mono text-xs text-blue-soft sm:block">
          préparation d&apos;oraux
        </p>
      </div>
    </header>
  );
}
