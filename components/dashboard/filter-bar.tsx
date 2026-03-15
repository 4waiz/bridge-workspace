"use client";

import { LayoutGrid, List, Milestone, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClassificationLevel, CollectionView } from "@/types/app";

export function FilterBar({
  classification,
  setClassification,
  sort,
  setSort,
  view,
  setView,
}: {
  classification: ClassificationLevel | "all";
  setClassification: (value: ClassificationLevel | "all") => void;
  sort: string;
  setSort: (value: string) => void;
  view: CollectionView;
  setView: (value: CollectionView) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.8rem] border border-border/70 bg-card p-4 shadow-[var(--shadow-xs)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
        {["all", "public", "internal", "restricted"].map((item) => (
          <Button
            key={item}
            variant={classification === item ? "default" : "ghost"}
            className="rounded-full"
            onClick={() => setClassification(item as ClassificationLevel | "all")}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modified">Recently modified</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center rounded-full border border-border/70 bg-muted/50 p-1">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="icon"
            className="rounded-full"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="icon"
            className="rounded-full"
            onClick={() => setView("list")}
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={view === "timeline" ? "default" : "ghost"}
            size="icon"
            className="rounded-full"
            onClick={() => setView("timeline")}
          >
            <Milestone className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
