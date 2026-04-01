import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

import EventDialog, { Action, IEvent } from "./EventDialog";
import Button from "../common/Button";
import {
  getCurrentWeekDays,
  getISODate,
  getLocalDate,
  getLocalTime,
  isDateEqual,
} from "../../libs/date";
import apiClient from "../../libs/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Define the structure of a weekday item
interface IWeekdayItem {
  day: number; // Day of the month
  events: IEvent[]; // List of events for the day
  sleepTime: string; // Sleep time for the day
}

// Props for the Calendar component
interface CalendarProps {
  className?: string; // Optional custom class names for additional styling
}

// Props for the WeekdayItem component
interface WeekdayItemProps extends IWeekdayItem {
  weekday: number; // Index of the weekday
  isActive?: boolean; // Flag to indicate if the item is active
  onWeekdayChange?: (weekday: number) => void; // Callback function when weekday changes
  onSubmit: (event: IEvent, action: "create" | "update" | "delete") => void;
}

// Array of weekday names in abbreviated format
const weekdayTexts: string[] = [
  "Mon",
  "Tis",
  "Ons",
  "Tor",
  "Fre",
  "Lör",
  "Sön",
];

const monthTexts = [
  "Jan", // Januari
  "Feb", // Februari
  "Mar", // Mars
  "Apr", // April
  "Maj", // Maj
  "Jun", // Juni
  "Jul", // Juli
  "Aug", // Augusti
  "Sep", // September
  "Okt", // Oktober
  "Nov", // November
  "Dec", // December
];

const MILIS_PER_WEEK = 7 * 24 * 3600 * 1000;

// WeekdayItem component displays details for a single weekday
function WeekdayItem({
  weekday,
  day,
  events,
  isActive = false,
  onWeekdayChange = () => { },
  onSubmit = () => { },
}: WeekdayItemProps) {
  const navigate = useNavigate();
  const [eventIndex, setEventIndex] = useState<number>(-1); // Index of the currently selected event
  const [eventDialogOpen, setEventDialogOpen] = useState<boolean>(false); // State to control the event dialog visibility

  // Memoized array of events with a maximum of 2 slots
  const weekdayEvents = useMemo(() => {
    return [...events, ...Array(2).fill({ isEmpty: true })].slice(0, 2);
  }, [events]);

  // Determine if the item is active and has an event selected
  const isItemActive = useMemo(
    () => isActive && eventIndex !== -1,
    [isActive, eventIndex]
  );

  const activeEvent = useMemo(() => {
    if (weekdayEvents[eventIndex] && !weekdayEvents[eventIndex].isEmpty) {
      return weekdayEvents[eventIndex];
    }
    return null;
  }, [weekdayEvents, eventIndex]);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ flex: isItemActive ? 3 : 1 }} // Adjust size based on active state
        transition={{ duration: 0.3 }} // Smooth transition duration
        className={twMerge(
          "py-4 flex",
          isItemActive ? "grid grid-cols-3" : "" // Grid layout when active
        )}
      >
        <div className="flex flex-col items-center gap-y-0.5 w-full">
          <p className="text-sm leading-4">{weekdayTexts[weekday]}</p>
          <p className="font-bold text-2xl">{day}</p>
          {weekdayEvents.map((event, index) => (
            <span
              key={index}
              className={twMerge(
                "w-full py-2 rounded-lg text-center text-xs leading-4 text-white cursor-pointer hover:opacity-90 active:opacity-80",
                event.isEmpty
                  ? "text-primary-text"
                  : isActive && index === eventIndex
                    ? "bg-focused-background"
                    : "bg-primary-background"
              )}
              onClick={() => {
                if (!event.isEmpty) {
                  setEventIndex(index);
                  onWeekdayChange(weekday);
                }
              }}
            >
              {event.isEmpty ? "-" : getLocalTime(event.startTime)}
            </span>
          ))}
          {/* <span className="w-full py-2 text-center text-xs leading-4">
            {sleepTime}
          </span> */}
          {events.length > 2 && (
            <Button
              size="small"
              className="w-full h-[32px]"
              onClick={() => {
                navigate("/calendar");
              }}
            >
              Visa alla
            </Button>
          )}
        </div>
        {isItemActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }} // Delay for the fade-in effect
            className="flex flex-col gap-y-1 text-primary-text px-2 col-span-2"
          >
            <p className="text-xs leading-4">
              {getLocalTime(activeEvent?.startTime)} -{" "}
              {getLocalTime(activeEvent?.endTime)}
            </p>
            <p className="font-bold leading-5">{activeEvent?.eventName}</p>
            <p className="text-sm leading-4 line-clamp-4">
              {events[eventIndex]?.description}
            </p>
            <Button
              size="compress"
              className="self-end"
              onClick={() => {
                setEventDialogOpen(true);
              }}
            >
              Se allt
            </Button>
          </motion.div>
        )}
      </motion.div>
      <EventDialog
        open={eventDialogOpen}
        onClose={() => {
          setEventDialogOpen(false);
        }}
        action={Action.Update}
        event={activeEvent}
        onSubmit={onSubmit}
      />
    </>
  );
}


// Calendar component displays a calendar view with weekday items
function Calendar({ className = "" }: CalendarProps) {
  const [activeWeekday, setActiveWeekday] = useState<number>(-1); // Index of the currently active weekday
  const [weekStartDay, setWeekStartDay] = useState<Date>(new Date());
  const [weekEvents, setWeekEvents] = useState<IEvent[]>([]);
  const [weekdayItems, setWeekdayItems] = useState<IWeekdayItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    getLocalDate(new Date())
  );

  const weekNumber = useMemo(
    () =>
      Math.floor(
        (weekStartDay.getTime() -
          new Date(weekStartDay.getFullYear(), 0, 1).getTime()) /
        MILIS_PER_WEEK +
        1
      ),
    [weekStartDay]
  );

  const handleSubmit = (
    event: IEvent,
    type: "create" | "update" | "delete"
  ) => {
    if (type === "update") {
      apiClient
        .put(`/api/events/${event.id}`, {
          event_name: event.eventName,
          patient_name: event.patientName,
          patient_personal_id: event.patientPersonalId?.trim() || undefined,
          start_time: new Date(event.startTime).toISOString(),
          end_time: new Date(event.endTime).toISOString(),
          description: event.description,
        })
        .then((response: any) => {
          const { message } = response;
          setWeekEvents(
            weekEvents.map((item) => (item.id === event.id ? event : item))
          );
          toast.success(message);
        })
        .catch(() => toast.error("Kunde inte uppdatera händelse."));
    } else if (type === "delete") {
      apiClient
        .delete(`/api/events/${event.id}`)
        .then((response: any) => {
          const { message } = response;
          setWeekEvents(weekEvents.filter((item) => item.id !== event.id));
          toast.success(message);
        })
        .catch(() => toast.error("Kunde inte ta bort händelse."));
    }
    setActiveWeekday(-1);
  };

  const handlePrevWeekClick = useCallback(() => {
    const prevWeek = new Date(weekStartDay);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setWeekStartDay(prevWeek);
  }, [weekStartDay]);

  const handleNextWeekClick = useCallback(() => {
    const nextWeek = new Date(weekStartDay);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setWeekStartDay(nextWeek);
  }, [weekStartDay]);

  const handleWeekSelect = (date: Date) => {
    // Calculate the start of the week (Monday) for the selected date
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

    // Adjust the date to the previous Monday (if the selected date is not already Monday)
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If it's Sunday, we need to go back 6 days, else go back to the previous Monday
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);

    // Update the weekStartDay to the new Monday (start of the week)
    setWeekStartDay(startOfWeek);
  };

  useEffect(() => {
    const items = getCurrentWeekDays(weekStartDay);
    setWeekdayItems(
      items.map((item) => ({
        day: item.getDate(),
        events: [],
        sleepTime: "",
      }))
    );

    const weekEndDay = new Date(weekStartDay);
    weekEndDay.setDate(weekStartDay.getDate() + 7);
    apiClient
      .get(
        `/api/events/user-events?start_date=${getISODate(
          weekStartDay
        )}&end_date=${getISODate(weekEndDay)}`
      )
      .then((response: any) => {
        const weekEvents: IEvent[] = response.map((item: any) => ({
          id: item._id,
          startTime: getLocalDate(item.start_time),
          endTime: getLocalDate(item.end_time),
          eventName: item.event_name,
          patientName: item.patient_name,
          patientPersonalId: item.patient_personal_id || "",
          description: item.description,
          createdAt: item.created_at,
        }));
        setWeekEvents(weekEvents);
      })
      .catch(() => toast.error("Kunde inte ladda veckans händelser."));
  }, [weekStartDay]);

  useEffect(() => {
    const items = getCurrentWeekDays(weekStartDay);
    setWeekdayItems((_weekdayItems) =>
      items.map((item) => {
        const events = weekEvents.filter((event) =>
          isDateEqual(item, event.startTime)
        );
        return {
          day: item.getDate(),
          events,
          sleepTime: "",
        };
      })
    );
  }, [weekEvents]);

  return (
    <div
      className={twMerge("rounded-xl bg-white py-2 px-4", className)}
      onMouseLeave={() => {
        setActiveWeekday(-1); // Reset active weekday when mouse leaves the calendar
      }}
    >
      <div className="flex flex-col gap-y-1">
        <div className="w-full flex justify-between">
          <p className="font-semibold text-xl leading-6">Kalender</p>
          <div className="flex items-center gap-x-2.5 relative">

            <div className="relative w-8 h-8">
              {/* <FaChevronDown /> */}
              <input
                type="date"
                value={selectedDate}
                id="date-input"
                onChange={(e) => {
                  const newDate = e.target.value;
                  setSelectedDate(newDate);
                  handleWeekSelect(new Date(newDate)); // Update the week start date based on selected date
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <label
                htmlFor="date-input" // Link the label with the input
                className="cursor-pointer w-8 h-8 flex items-center justify-center text-primary-text"
              >
                {/* <FaCalendarAlt className="w-full h-full" />{" "} */}
                <FaChevronDown className="cursor-pointer" />
                {/* Calendar Icon */}
              </label>
            </div>

            <p className="leading-5">
              {monthTexts[weekStartDay.getMonth()]} {weekStartDay.getFullYear()}
            </p>

          </div>
        </div>
        <div className="flex py-2">
          <span
            className="w-6 h-6 flex items-center justify-center cursor-pointer"
            onClick={handlePrevWeekClick}
          >
            <FaChevronLeft />
          </span>
          <p className="grow font-semibold text-xl leading-6">
            Vecka {weekNumber}
          </p>
          <span
            className="w-6 h-6 flex items-center justify-center cursor-pointer"
            onClick={handleNextWeekClick}
          >
            <FaChevronRight />
          </span>
        </div>
        <motion.div className="py-2 flex gap-x-2.5">
          {weekdayItems.map((weekdayItem, index) => (
            <WeekdayItem
              key={index}
              weekday={index}
              isActive={activeWeekday === index}
              onWeekdayChange={(index) => {
                setActiveWeekday(index);
              }}
              onSubmit={handleSubmit}
              {...weekdayItem}
            />
          ))}
        </motion.div>
      </div>

      {/* Week Select Dialog */}
      {/* <WeekSelectDialog
        isOpen={isWeekDialogOpen}
        onClose={() => setIsWeekDialogOpen(false)}
        onSelect={handleWeekSelect}
      /> */}
    </div>
  );
}

export default Calendar; // Export the Calendar component for use in other parts of the application
