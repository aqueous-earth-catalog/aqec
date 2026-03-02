"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/theme/mode-toggle";
import InstructionsDialog from "@/components/instructions-dialog";
import { cn } from "@/lib/utils";

const BASE_CLASSNAMES =
  "text-sm font-medium transition-colors px-3 py-2 rounded-md";
const INACTIVE_CLASSNAMES =
  "text-muted-foreground hover:text-foreground hover:bg-muted";
const ACTIVE_CLASSNAMES = "bg-primary text-primary-foreground";

export default function Navbar({ title }: { title: string }) {
  const pathname = usePathname();

  return (
    <header className="w-full max-w-7xl mx-auto bg-background" role="banner">
      <div className="flex flex-col justify-center items-center gap-2 p-2 md:flex-row md:justify-between md:p-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-medium">{title}</span>
          </Link>
        </div>
        <nav role="navigation" aria-label="Main navigation">
          <ul className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className={cn(
                  BASE_CLASSNAMES,
                  pathname === "/" ? ACTIVE_CLASSNAMES : INACTIVE_CLASSNAMES
                )}
              >
                Map
              </Link>
            </li>
            <li>
              <Link
                href="/table"
                className={cn(
                  BASE_CLASSNAMES,
                  pathname === "/table"
                    ? ACTIVE_CLASSNAMES
                    : INACTIVE_CLASSNAMES
                )}
              >
                Table
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={cn(
                  BASE_CLASSNAMES,
                  pathname === "/about"
                    ? ACTIVE_CLASSNAMES
                    : INACTIVE_CLASSNAMES
                )}
              >
                About
              </Link>
            </li>
            <li>
              <InstructionsDialog />
            </li>
            <li className="ml-4">
              <ModeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
