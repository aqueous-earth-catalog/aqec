"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/theme/mode-toggle";
import InstructionsDialog from "@/components/instructions-dialog";
import { cn } from "@/lib/utils";


const BASE_CLASSNAMES =
  "inline-flex items-center h-6 text-xs font-medium leading-none transition-colors px-1.5 rounded-md md:h-8 md:text-sm md:px-3";
const INACTIVE_CLASSNAMES =
  "text-muted-foreground hover:text-foreground hover:bg-muted";
const ACTIVE_CLASSNAMES = "bg-primary text-primary-foreground";

export default function Navbar({ title }: { title: string }) {
  const pathname = usePathname();

  return (
    <header
      className="w-full bg-background border-b border-border"
      role="banner"
    >
      <div className="flex flex-col justify-center items-center gap-2 p-2 md:flex-row md:justify-between md:p-4">
        <div className="flex items-center gap-3">
         <Link href="/" className="flex items-center gap-2 shrink-0">
<span className="relative block h-8 w-[min(16rem,70vw)] md:h-10 md:w-80">
           <Image
      src="/header-logo.png"
      alt={title}
      fill
      priority
      sizes="320px"
      quality={100}
      className="object-contain object-left"
    />
  </span>
</Link>
        </div>
        <nav role="navigation" aria-label="Main navigation">
<ul className="flex flex-nowrap items-center justify-center gap-0.5 md:gap-2 max-w-full">
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
                href="/collections"
                className={cn(
                  BASE_CLASSNAMES,
                  pathname === "/collections"
                    ? ACTIVE_CLASSNAMES
                    : INACTIVE_CLASSNAMES
                )}
              >
                Collections
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
<li className="flex items-center">
  <InstructionsDialog />
</li>
<li className="ml-1 flex items-center md:ml-4">
  <ModeToggle />
</li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
