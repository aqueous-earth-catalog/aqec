"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import UPennLogo from "@/public/upenn_logo.png";
import CargcLogo from "@/public/upenn_cargc_logo.png";
import {
  MousePointer,
  MapPin,
  X,
  Table,
  ArrowUpDown,
  Search,
  Download,
  MousePointerClick,
  Map,
  HelpCircle,
  Heart,
  Github,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InstructionItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const mapInstructions: InstructionItem[] = [
  {
    icon: <MousePointer className="w-4 h-4" />,
    title: "Navigate the Map",
    description:
      "Click and drag to pan, scroll to zoom, hold Shift and drag to rotate",
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    title: "Explore Locations",
    description:
      "Click on any blue marker to view detailed information about that media location",
  },
  {
    icon: <X className="w-4 h-4" />,
    title: "Close Details",
    description:
      "Click the X button or press Escape to close the location details panel",
  },
  {
    icon: <Table className="w-4 h-4" />,
    title: "Table View",
    description:
      "Switch to table view using the navigation menu to see all data in a sortable format",
  },
];

const tableInstructions: InstructionItem[] = [
  {
    icon: <ArrowUpDown className="w-4 h-4" />,
    title: "Sort Data",
    description:
      "Click on column headers to sort the data in ascending or descending order",
  },
  {
    icon: <Search className="w-4 h-4" />,
    title: "Search & Filter",
    description:
      "Use the search bar to find specific entries or filter by location type",
  },
  {
    icon: <Download className="w-4 h-4" />,
    title: "Export Data",
    description:
      "Click the export button to download the current data view as a CSV file",
  },
  {
    icon: <MousePointerClick className="w-4 h-4" />,
    title: "View Details",
    description:
      "Click on any row to view detailed information about that media location",
  },
  {
    icon: <Map className="w-4 h-4" />,
    title: "Map View",
    description:
      "Switch back to map view using the navigation menu for spatial exploration",
  },
];

export default function InstructionsDialog() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isTableView = pathname === "/table";
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus management for modal
  useEffect(() => {
    if (open) {
      // Focus will be handled by the Dialog component
      return;
    } else {
      // Return focus to trigger button when dialog closes
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    }
  }, [open]);

  const instructions = isTableView ? tableInstructions : mapInstructions;
  const viewTitle = isTableView ? "Table View" : "Map View";
  const dataDescription = isTableView
    ? "This interactive map displays media locations with geographical context. Each point represents a media object with location data extracted from the source material."
    : "This table view displays all media locations in a sortable, searchable format. Each row represents a media object with detailed information about its location and content.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
<DialogTrigger asChild>
  <button
    ref={triggerRef}
    type="button"
    className="inline-flex items-center gap-1 px-1.5 py-1 text-xs font-medium leading-none rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted md:px-3 md:py-2 md:text-sm"
    aria-expanded={open}
    aria-controls="instructions-dialog"
    aria-label={open ? "Close instructions" : "Open instructions"}
  >
    <HelpCircle className="size-3 md:size-4" />
    Help
  </button>
</DialogTrigger>
      <DialogContent
        id="instructions-dialog"
        className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto"
        aria-describedby="instructions-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            How to Use Media Mapper - {viewTitle}
          </DialogTitle>
          <DialogDescription id="instructions-description">
            {dataDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <h3 className="font-medium text-base">Getting Started</h3>
          <div className="grid gap-4">
            {instructions.map((instruction, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
              >
                <div className="mt-0.5 text-primary" aria-hidden="true">
                  {instruction.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">
                    {instruction.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {instruction.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-base mb-2">About the Data</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This application displays media objects based on their
              geographical location data. The data includes various types of
              media content with location information extracted from the source
              material, allowing you to explore how topics are portrayed across
              different locations and time periods.
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-base mb-3">About Media Mapper</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <Heart className="w-4 h-4 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Funding:</strong> Media Mapper is made possible
                    through funding provided by the{" "}
                    <strong>
                      <a
                        href="https://www.upenn.edu/"
                        className="text-primary underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        University of Pennsylvania, Penn
                      </a>
                    </strong>
                    . This support enables the development of this open-source
                    framework for spatial media exploration.
                  </p>
                  <div className="flex flex-row gap-2">
                    <div className="mt-0.5 relative w-[100px] h-20">
                      <Image
                        src={CargcLogo}
                        alt="University of Pennsylvania Center for Advanced Research in Global Communication"
                        fill
                        objectFit="contain"
                      />
                    </div>
                    <div className="mt-0.5 relative w-[100px] h-20">
                      <Image
                        src={UPennLogo}
                        alt="University of Pennsylvania Logo"
                        fill
                        objectFit="contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <Github className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Open Source:</strong> Media Mapper is developed as
                    an open-source project so that anyone seeking to build a
                    similar application with their own datasets can use or fork
                    this framework.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
