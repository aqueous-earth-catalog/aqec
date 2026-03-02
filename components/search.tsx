"use client";

import { MediaLocation } from "@/lib/airtable/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useState } from "react";
import { addQueryParameter } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function Search({ data }: { data: MediaLocation[] }) {
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Command className="w-full lg:w-[350px] p-0 border border-input">
        <PopoverTrigger asChild>
          <div className="max-w-[350px] justify-end p-0">
            <CommandInput
              className="p-0 text-base"
              placeholder="Search Media Locations"
              aria-label="Search media locations"
              value={searchValue}
              onValueChange={setSearchValue}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="start"
          sideOffset={5}
          className="p-0 max-w-[350px]"
          style={{ width: "var(--radix-popover-anchor-width)" }}
        >
          <CommandList className="w-[324px] lg:w-[350px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Media">
              {data.map((media) => (
                <CommandItem
                  key={media.id}
                  className="border-b border-gray-100 rounded-none"
                  value={`${media.name} ${media?.city} ${media?.country} ${media.media?.release_year} ${media.region} ${media.location_name}`}
                  onSelect={() => {
                    const params = addQueryParameter("mediaPointId", media.id);
                    window.history.pushState({}, "", params);
                    setOpen(false);
                  }}
                >
                  <div className="w-full">
                    <div>
                      <strong>
                        {media.name} ({media.media?.release_year})
                      </strong>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        {media?.country}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
