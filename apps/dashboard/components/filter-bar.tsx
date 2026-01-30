"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  statusOptions?: FilterOption[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  fromDate?: Date;
  toDate?: Date;
  onFromDateChange?: (date: Date | undefined) => void;
  onToDateChange?: (date: Date | undefined) => void;
  showAmountFilter?: boolean;
  minAmount?: string;
  maxAmount?: string;
  onMinAmountChange?: (value: string) => void;
  onMaxAmountChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({
  statusOptions,
  statusValue,
  onStatusChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  showAmountFilter = false,
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  onClearFilters,
  hasActiveFilters = false,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
          {statusOptions && onStatusChange && (
            <div className="min-w-[150px] space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select value={statusValue || "all"} onValueChange={onStatusChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {onFromDateChange && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                From Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 w-[140px] justify-start gap-2 text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {fromDate ? format(fromDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={onFromDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {onToDateChange && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                To Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 w-[140px] justify-start gap-2 text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {toDate ? format(toDate, "MMM d, yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={onToDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {showAmountFilter && onMinAmountChange && onMaxAmountChange && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Min Amount
                </label>
                <Input
                  type="number"
                  value={minAmount || ""}
                  onChange={(e) => onMinAmountChange(e.target.value)}
                  placeholder="0"
                  className="h-9 w-[120px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Max Amount
                </label>
                <Input
                  type="number"
                  value={maxAmount || ""}
                  onChange={(e) => onMaxAmountChange(e.target.value)}
                  placeholder="Any"
                  className="h-9 w-[120px]"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
