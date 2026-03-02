"use client";

import { useState } from "react";
import { MapFilters, MultiSelectOption } from "@/lib/airtable/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FilterIcon } from "lucide-react";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useIsTablet } from "./hooks/use-tablet";
import MultiSelect from "./ui/multi-select";

interface FilterProps {
  filters: MapFilters;
  countryOptions: MultiSelectOption[];
  bodiesOfWaterOptions: MultiSelectOption[];
  minYear: number;
  maxYear: number;
}

export default function Filters({
  filters,
  minYear,
  maxYear,
  countryOptions,
  bodiesOfWaterOptions,
}: FilterProps) {
  const isTablet = useIsTablet();

  const [selectedCountry, setSelectedCountry] = useState<string[]>(
    filters.countries
  );
  const [selectedWater, setSelectedWater] = useState<string[]>(
    filters.bodiesOfWater
  );
  const [filtersOpen, setOpenFilters] = useState(false);
  const [startYear, setStartYear] = useState(filters.startYear || "");
  const [endYear, setEndYear] = useState(filters.endYear || "");

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();

    if (selectedWater.length) {
      newParams.append("body_of_water", selectedWater.join(","));
    }
    if (selectedCountry.length) {
      newParams.append("country", selectedCountry.join(","));
    }
    if (startYear) {
      newParams.append("start_year", "" + startYear);
    }
    if (endYear) {
      newParams.append("end_year", "" + endYear);
    }

    setOpenFilters(false);
    history.pushState({}, "", `/?${newParams.toString()}`);
  };

  const filterInputs = (
    <div className="flex flex-col lg:flex-row gap-3 md:gap-6 lg:gap-3 flex-wrap">
      <MultiSelect
        values={countryOptions}
        label="Countries"
        onSelect={setSelectedCountry}
        selectedOptions={selectedCountry}
      />

      <MultiSelect
        values={bodiesOfWaterOptions}
        label="Bodies of Water"
        onSelect={setSelectedWater}
        selectedOptions={selectedWater}
      />

      <div className="flex flex-col gap-1 no-wrap">
        <Label>Date Range</Label>
        <div className="flex gap-1 items-center">
          <Input
            value={startYear}
            min={minYear}
            max={maxYear}
            onChange={(e) => setStartYear(e.target.value)}
            aria-label="From year"
            type="number"
            placeholder="Start Year"
            className="min-w-28 text-base"
          />
          -
          <Input
            value={endYear}
            min={minYear}
            max={maxYear}
            onChange={(e) => setEndYear(e.target.value)}
            type="number"
            aria-label="Filter by latest release year"
            placeholder="To year"
            className="min-w-28 text-base"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isTablet ? (
        <div className="flex items-end gap-2">
          {filterInputs}
          <Button onClick={handleApplyFilters} aria-label="Apply filters">
            Apply
          </Button>
        </div>
      ) : (
        <Dialog open={filtersOpen} onOpenChange={setOpenFilters}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              aria-label="Open filters"
              className="h-[38px]"
            >
              <FilterIcon />
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            id="mobile-dialog-container"
          >
            <DialogHeader>
              <DialogTitle>Map Filter</DialogTitle>
              <DialogDescription>
                Filter media points shown on map. Click apply filters when you
                are done.
              </DialogDescription>
            </DialogHeader>
            {filterInputs}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" aria-label="Cancel">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                onClick={handleApplyFilters}
                aria-label="Apply filters"
              >
                Apply filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
