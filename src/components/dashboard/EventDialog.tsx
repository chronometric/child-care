import { useEffect, useState } from "react";
import Dialog from "../common/Dialog";
import Input from "../common/Input";
import TextField from "../common/TextField";
import Button from "../common/Button";
import Checkbox from "../common/Checkbox";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import dayjs from 'dayjs';

// Enum to manage the dialog's staging (confirm or editing)
enum Staging {
  Confirm = "confirm",
  Editing = "editing",
}

// Enum to define the action type (create or update)
export enum Action {
  Create = "create",
  Update = "update",
}

export interface IEvent {
  id?: string;
  startTime: string;
  endTime: string;
  eventName: string;
  patientName: string;
  /** Stable id when provided — links calendar to patient records / student portal */
  patientPersonalId?: string;
  description: string;
  createdAt: string;
}

// Props for the EventDialog component
interface EventDialogProps {
  currentDay?: Date;
  open: boolean; // Flag to control the dialog visibility
  action: Action; // Action type (create or update)
  event: IEvent | null;
  onClose: () => void; // Callback to close the dialog
  onSubmit: (event: IEvent, action: 'create' | 'update' | 'delete') => void;
}

const initialEvent: IEvent = {
  startTime: '',
  endTime: '',
  eventName: '',
  patientName: '',
  patientPersonalId: '',
  description: '',
  createdAt: ''
}

function EventDialog({
  open,
  onClose,
  event: activeEvent,
  action,
  onSubmit,
  currentDay,
}: EventDialogProps) {
  const [staging, setStaging] = useState<Staging>(
    action === Action.Create ? Staging.Editing : Staging.Confirm
  ); // State to manage the dialog's staging (confirm or editing)
  const [event, setEvent] = useState<IEvent>(activeEvent || initialEvent);
  const [error, setError] = useState<string | null>(null); // State for error messages

  const handleSaveClick = () => {
    // Validate that start time is not later than end time
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (startTime > endTime) {
      setError("Start time cannot be later than end time.");
      return;
    }

    setError(null); // Clear error if validation passes
    onSubmit(event, action === Action.Create ? 'create' : 'update');
    onClose();
  };

  const handleDateChange = (field: 'startTime' | 'endTime') => (value: any) => {
    setEvent((prevEvent) => ({
      ...prevEvent,
      [field]: value.toISOString(),
    }));
  };

  useEffect(() => {
    if (action === Action.Update) {
      setStaging(Staging.Confirm);
    } else {
      setStaging(Staging.Editing);
    }
  }, [action, open]);

  useEffect(() => {
    if (action === Action.Create) {
      setEvent(initialEvent);
    } else {
      setEvent(activeEvent || initialEvent);
    }
  }, [action, activeEvent]);

  useEffect(() => {
    if (currentDay) {
      setEvent(event => ({
        ...event,
        startTime: currentDay.toISOString(),
        endTime: currentDay.toISOString(),
      }));
    }
  }, [currentDay?.toString()]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="text-primary-text bg-white rounded-lg p-8"
      maxWidth={staging === Staging.Confirm ? "sm" : "xs"}
    >
      <div className="px-2 flex flex-col gap-y-1 text-primary-text">
        {staging === "confirm" ? (
          <>
            {/* Display event details in confirm stage */}
            <p className="text-xl leading-6 font-bold"></p>
            <p className="text-xs">{ }</p>
            <p className="font-bold leading-5">{event.eventName}</p>
            <p className="font-light leading-4 text-sm">{event.description}</p>
            <div className="flex justify-end">
              <Button
                size="small"
                variant="text"
                className="text-[#FF3E4C]"
                onClick={() => {
                  onSubmit(event, 'delete');
                  onClose();
                }}
              >
                Ta bort
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setStaging(Staging.Editing); // Switch to editing stage
                }}
              >
                Redigera
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Display form for creating or editing an event */}
            <h1 className="mb-4 font-bold text-xl leading-6">
              {action === Action.Create ? "Skapa" : "Redigera"} händelse
            </h1>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>} {/* Display error message */}
            <div className="space-y-1 mb-4">
              <p className="pl-2 text-xs">Händelsenamn</p>
              <Input
                name="eventName"
                placeholder="Noah och Elsa"
                className="w-full"
                value={event.eventName}
                onChange={(e) => setEvent({ ...event, eventName: e.target.value })}
              />
            </div>
            <div className="space-y-1 mb-4">
              <p className="pl-2 text-xs">Patient / Rum namn</p>
              <Input
                name="patientName"
                placeholder="Noah"
                className="w-full"
                value={event.patientName}
                onChange={(e) => setEvent({ ...event, patientName: e.target.value })}
              />
            </div>
            <div className="space-y-1 mb-4">
              <p className="pl-2 text-xs">Patient-ID (valfritt, personnummer)</p>
              <Input
                name="patientPersonalId"
                placeholder="YYYYMMDD-XXXX"
                className="w-full"
                value={event.patientPersonalId || ""}
                onChange={(e) =>
                  setEvent({ ...event, patientPersonalId: e.target.value })
                }
              />
            </div>
            <div className="space-y-1 mb-4">
              <p className="pl-2 text-xs">Tid</p>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex gap-x-1">
                  <div className="space-y-1 grow">
                    <DesktopDateTimePicker
                      label="Start Time"
                      value={dayjs(event.startTime)}
                      onChange={handleDateChange("startTime")}
                      ampm={false}
                      minutesStep={1}
                      timeSteps={{ minutes: 1 }}
                    />

                    <p className="pl-2 text-disabled-text text-xs">Start tid</p>
                  </div>
                  <div className="space-y-1 grow">
                    <DesktopDateTimePicker
                      label="End Time"
                      value={dayjs(event.endTime)}
                      onChange={handleDateChange('endTime')}
                      ampm={false}
                      minutesStep={1}
                      timeSteps={{ minutes: 1 }}
                    />
                    <p className="pl-2 text-disabled-text text-xs">Slut tid</p>
                  </div>
                </div>
              </LocalizationProvider>
              <Checkbox
                label="Ange bara start tid"
                className="text-xs leading-4 text-disabled-text"
              />
            </div>
            <div className="space-y-1 mb-4">
              <p className="pl-2 text-xs">Beskrivning</p>
              <TextField
                name="description"
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                className="w-full leading-5"
                value={event.description}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
              />
            </div>
            <div className="self-end">
              <Button onClick={handleSaveClick}>
                {action === Action.Create ? "Skapa" : "Spara"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

export default EventDialog;
