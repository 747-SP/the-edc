"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BlueskyPost } from "@/types";

interface CalendarProps {
  postsByDate: Record<string, BlueskyPost[]>;
}

export default function Calendar({ postsByDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Leading empty days
  const leadingDays = getDay(startOfMonth(currentMonth));
  const totalCells = leadingDays + daysInMonth.length;
  const remaining = (7 - (totalCells % 7)) % 7;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <button onClick={prevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {format(currentMonth, "yyyy MMMM")}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
        {dayNames.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: leadingDays }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/30" />
        ))}

        {daysInMonth.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const posts = postsByDate[dateStr] || [];
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={dateStr}
              className={`min-h-[80px] border-b border-r border-zinc-100 dark:border-zinc-800/50 p-1.5 ${
                isToday ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
              }`}
            >
              <time
                dateTime={dateStr}
                className={`text-xs font-medium mb-1 block ${
                  isToday
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {format(day, "d")}
              </time>

              {posts.length > 0 && (
                <div className="space-y-0.5">
                  {posts.slice(0, 2).map((post) => {
                    const record = post.post.record as unknown as Record<string, unknown> & { createdAt?: string; text?: string };
                    return (
                      <div
                        key={record.createdAt}
                        className="text-[10px] truncate text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800"
                      >
                        {record.text?.split("\n")[0]?.slice(0, 30) || "#TheEDC"}
                      </div>
                    );
                  })}
                  {posts.length > 2 && (
                    <div className="text-[10px] text-zinc-400 px-1.5">
                      +{posts.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {Array.from({ length: remaining }).map((_, i) => (
          <div key={`trailing-${i}`} className="min-h-[80px] border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/30" />
        ))}
      </div>
    </div>
  );
}
