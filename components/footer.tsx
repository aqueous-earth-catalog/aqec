import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";
import UPennLogo from "@/public/upenn_logo.png";
import CargcLogo from "@/public/upenn_cargc_logo.png";

export default function Footer({ owner }: { owner: string }) {
  return (
<footer
  className="hidden lg:block w-full bg-background border-t border-border"
  role="contentinfo"
>
      <div className="flex flex-col p-4 md:flex-row md:justify-between">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-sm text-muted-foreground font-medium">
            Funded by the{" "}
            <Link
              href="https://www.upenn.edu/"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              University of Pennsylvania
            </Link>
          </span>
          <div className="flex flex-row gap-2">
            <Link
              href="https://www.asc.upenn.edu/research/centers/center-for-advanced-research-in-global-communication"
              className="relative shrink-0 w-[100px] h-16"
              title="Center for Advanced Research in Global Communication"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={CargcLogo}
                alt="University of Pennsylvania Center for Advanced Research in Global Communication"
                fill
                className="object-contain"
              />
            </Link>
            <Link
              href="https://www.upenn.edu/"
              className="relative shrink-0 w-[110px] h-16"
              title="University of Pennsylvania"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={UPennLogo}
                alt="University of Pennsylvania official logo - link to Penn's website"
                fill
                className="object-contain"
              />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-center md:items-end">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {owner}
          </span>
          <span className="text-sm text-muted-foreground">
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
          <span className="text-sm text-muted-foreground">
            <Link
              href="https://github.com/Aqueous-Earth-Catalog-Team/media-mapper"
              className="text-primary underline flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-4 h-4" />
              Open Source on GitHub
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
