import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer({ owner }: { owner: string }) {
return (
  <footer
    className="hidden lg:block w-full bg-background border-t border-border"
    role="contentinfo"
  >
    <div className="grid grid-cols-3 items-center gap-2 px-3 py-1.5">
{/* Left: funded by */}
<div className="flex flex-col items-start gap-0 justify-self-start">
  <span className="text-xs text-muted-foreground font-medium">
    Funded by the{" "}
    <Link
      href="https://www.upenn.edu/"
      className="text-primary underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      University of Pennsylvania&apos;s
    </Link>
  </span>
  <Link
    href="https://www.asc.upenn.edu/research/centers/center-for-advanced-research-in-global-communication"
    className="text-xs text-primary underline font-medium"
    target="_blank"
    rel="noopener noreferrer"
  >
    Center for Advanced Research in Global Communication
  </Link>
</div>

      {/* Center: copyright */}
      <div className="justify-self-center text-center">
        <span className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {owner}
        </span>
      </div>

      {/* Right: built by + GitHub */}
      <div className="flex flex-col gap-0.5 items-end justify-self-end">
        <span className="text-xs text-muted-foreground">
          Built by{" "}
          <Link
            href="https://lostcreekdesigns.co"
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lost Creek Designs, LLC
          </Link>
        </span>
        <span className="text-xs text-muted-foreground">
          <Link
            href="https://github.com/Aqueous-Earth-Catalog-Team/media-mapper"
            className="text-primary underline flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-3.5 h-3.5" />
            Open Source on GitHub
          </Link>
        </span>
      </div>
    </div>
  </footer>
);
}
