"use client";

import { MapStyle } from "@/lib/map-utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import Image from "next/image";

interface BasemapToggleProps {
  mapStyle: MapStyle;
  onToggle: () => void;
}

export function BasemapToggle({ mapStyle, onToggle }: BasemapToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="absolute top-2 right-14 z-10 size-16 rounded-md overflow-hidden border-2 border-white shadow-lg cursor-pointer hover:border-sky-400 transition-colors"
          onClick={onToggle}
          aria-label={
            mapStyle === "standard"
              ? "Switch to satellite view"
              : "Switch to standard view"
          }
        >
          <Image
            src={
              mapStyle === "standard"
                ? "/map-satellite.png"
                : "/map-standard.png"
            }
            alt={
              mapStyle === "standard"
                ? "Switch to satellite view"
                : "Switch to standard view"
            }
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {mapStyle === "standard"
            ? "Switch to satellite view"
            : "Switch to standard view"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
