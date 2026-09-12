"use client";
import { useMemo, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import {
  CalendarIcon,
  FilterIcon as Filter,
  RotateCcwIcon as RotateCcw,
  CheckCircle2Icon as CheckCircle2,
} from "@/shared/ui/Icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/utils";
import { type DateRange } from "react-day-picker";

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface DateRangeFilterProps {
  onApply: (params: DateRangeParams) => void;
  onReset: () => void;
  isLoading?: boolean;
}

// ✅ مكون مستقل خارج DateRangeFilter لتجنب إعادة إنشائه في كل render
interface FilterActionsProps {
  isLoading?: boolean;
  isValid: boolean;
  isActive: boolean;
  hasDate: boolean;
  start: string;
  end: string;
  applyLabel: string;
  resetLabel: string;
  onApply: () => void;
  onReset: () => void;
}

function FilterActions({
  isLoading,
  isValid,
  isActive,
  hasDate,
  start,
  end,
  applyLabel,
  resetLabel,
  onApply,
  onReset,
}: FilterActionsProps) {
  return (
    <>
      <Button
        size="sm"
        isLoading={isLoading}
        onClick={onApply}
        disabled={!isValid || isLoading}
        className="gap-1.5 h-9"
      >
        {isActive ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <Filter className="w-3.5 h-3.5" />
        )}
        {applyLabel}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onReset}
        disabled={!hasDate || isLoading}
        className="gap-1.5 h-9"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {!isActive && resetLabel}
      </Button>
      {isActive && start && end && (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 text-xs gap-1"
        >
          <CheckCircle2 className="w-3 h-3" />
          {start} → {end}
        </Badge>
      )}
    </>
  );
}

export function DateRangeFilter({
  onApply,
  onReset,
  isLoading,
}: DateRangeFilterProps) {
  const t = useTranslations("dashboard.dateFilter");
  const locale = useLocale();
  const [date, setDate] = useState<DateRange | undefined>();
  const [isActive, setIsActive] = useState(false);
  const [open, setOpen] = useState(false);

  // 1. تحسين حساب قيم التواريخ باستخدام useMemo
  const { start, end, isValid } = useMemo(() => {
    if (!date?.from || !date?.to) {
      const s = date?.from ? date.from.toLocaleDateString("en-CA") : ""; // en-CA يعطي YYYY-MM-DD
      return { start: s, end: "", isValid: false };
    }

    // تنسيق سريع للتواريخ YYYY-MM-DD
    const s = date.from.toLocaleDateString("en-CA");
    const e = date.to.toLocaleDateString("en-CA");

    return {
      start: s,
      end: e,
      isValid: date.from <= date.to,
    };
  }, [date]);

  // 2. استخدام useCallback للحفاظ على مرجع الدالة
  const handleApply = useCallback(() => {
    if (isValid) {
      onApply({ startDate: start, endDate: end });
      setIsActive(true);
      setOpen(false);
    }
  }, [isValid, onApply, start, end]);

  const handleReset = useCallback(() => {
    setDate(undefined);
    setIsActive(false);
    onReset();
  }, [onReset]);

  const filterActionsProps: FilterActionsProps = {
    isLoading,
    isValid,
    isActive,
    hasDate: !!date?.from || !!date?.to,
    start,
    end,
    applyLabel: t("apply"),
    resetLabel: t("reset"),
    onApply: handleApply,
    onReset: handleReset,
  };

  return (
    <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-background border border-border/50 shadow-sm">
      <div className="flex flex-wrap items-end gap-3 flex-1">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 w-full sm:w-[260px] justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {date?.from ? (
                  date.to ? (
                    `${formatDate(date.from, locale)} → ${formatDate(date.to, locale)}`
                  ) : (
                    formatDate(date.from, locale)
                  )
                ) : (
                  <span>{t("label") || "Select a date range"}</span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className=" p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(range) => {
                  setDate(range);
                  setIsActive(false);
                }}
                numberOfMonths={1}
                captionLayout="dropdown"
                className="w-full"
              />
              <div className="p-2 flex justify-between items-center bg-muted">
                <FilterActions {...filterActionsProps} />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="hidden sm:flex flex-1 justify-end gap-2 items-center">
          <FilterActions {...filterActionsProps} />
        </div>
      </div>

      {!isValid && date?.from && date?.to && (
        <p className="w-full text-xs text-destructive mt-1">
          ⚠ {t("invalidRange")}
        </p>
      )}
    </div>
  );
}
