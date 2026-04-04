"use client";

import { MapFilters, MediaLocation } from "@/lib/airtable/types";
import { Filters } from "./filters";
import { CameraIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface MapToolbarProps {
  filters: MapFilters;
  mediaPoints: MediaLocation[];
  onScreenshot: () => void;
}

export function MapToolbar({
  filters,
  mediaPoints,
  onScreenshot,
}: MapToolbarProps) {
  return (
    <div className="flex items-center bg-background rounded-full shadow-md border">
      <Filters filters={filters} mediaPoints={mediaPoints} />
      <div className="w-px h-6 bg-border" />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex items-center justify-center px-3 h-10 rounded-r-full cursor-pointer hover:bg-accent transition-colors"
            onClick={onScreenshot}
            aria-label="Take screenshot of current map view"
          >
            <CameraIcon className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Take screenshot of current map view</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
