"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  className,
}: {
  value?: string
  onChange: (value: string) => void
  className?: string
}) {
  // Convert string YYYY-MM-DD to Date object for the Calendar
  const dateValue = value ? parseISO(value) : undefined;

  const handleSelect = (date?: Date) => {
    if (date) {
      // Convert Date object to YYYY-MM-DD string
      onChange(format(date, "yyyy-MM-dd"));
    } else {
      onChange("");
    }
  }

  return (
    <Popover>
      <PopoverTrigger render={
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 flex",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
        </Button>
      } />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
