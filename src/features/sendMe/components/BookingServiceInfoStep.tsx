import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddressAutocompleteInput from "@/features/sendMe/components/AddressAutocompleteInput";
import {
  bookingContactMethodOptions,
  bookingDateTimeInputWithIconClass,
  bookingGlassPanelClass,
  bookingInputLabelClass,
  bookingInputClass,
  bookingInputWithIconClass,
  bookingPanelHeadingClass,
  bookingSelectContentClass,
  bookingSelectItemClass,
  bookingSelectTriggerClass,
  bookingSpecificServiceOptions,
  bookingTextareaClass,
  bookingUrgencyOptions,
} from "@/features/sendMe/constants";
import type { BookingFormData, BookingFormUpdater } from "@/features/sendMe/types";
import { getMinBookingDateString, getMinTimeForBookingDate } from "@/features/sendMe/utils/bookingValidation";

const mapsKeyConfigured = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim());
const MAX_TRIP_STOPS = 10;

interface BookingServiceInfoStepProps {
  form: BookingFormData;
  update: BookingFormUpdater;
  onSpecificServiceChange: (value: string) => void;
}

const BookingServiceInfoStep = ({ form, update, onSpecificServiceChange }: BookingServiceInfoStepProps) => {
  const now = new Date();
  const minDate = getMinBookingDateString(now);
  const minTime = getMinTimeForBookingDate(form.date, now);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="date" className={bookingInputLabelClass}>Preferred Date</Label>
          <div className="relative mt-1">
            <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input id="date" type="date" min={minDate} value={form.date} onChange={(e) => update("date", e.target.value)} className={bookingDateTimeInputWithIconClass} required />
          </div>
        </div>
        <div>
          <Label htmlFor="time" className={bookingInputLabelClass}>Preferred Time</Label>
          <div className="relative mt-1">
            <Clock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="time"
              type="time"
              min={minTime}
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className={bookingDateTimeInputWithIconClass}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <Label className={bookingInputLabelClass}>Specific Service</Label>
        <Select value={form.specificService} onValueChange={onSpecificServiceChange}>
          <SelectTrigger className={bookingSelectTriggerClass}>
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent className={bookingSelectContentClass}>
            {bookingSpecificServiceOptions.map((option) => (
              <SelectItem key={option.value} className={bookingSelectItemClass} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {form.specificService === "other" && (
        <div>
          <Label htmlFor="customService" className={bookingInputLabelClass}>Specify Service</Label>
          <Input id="customService" placeholder="Describe the service" value={form.customService} onChange={(e) => update("customService", e.target.value)} className={bookingInputClass} required />
        </div>
      )}

      {form.specificService === "trip" && (
        <div className={bookingGlassPanelClass}>
          <h3 className={bookingPanelHeadingClass}>Trip route</h3>
          <p className="text-xs text-white/70">
            {mapsKeyConfigured ? "Search addresses with Google, or type the full location." : "Enter full pickup and drop-off addresses."}
          </p>
          <div>
            <Label htmlFor="tripPickup" className={bookingInputLabelClass}>Pick up</Label>
            <div className="relative mt-1">
              <MapPin className="pointer-events-none absolute left-3 top-3 z-[1] h-4 w-4 text-gray-400" />
              <AddressAutocompleteInput
                id="tripPickup"
                placeholder={mapsKeyConfigured ? "Start typing pickup address…" : "Pickup address"}
                value={form.tripPickup}
                onValueChange={(v) => update("tripPickup", v)}
                className={bookingInputWithIconClass}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tripDropoff" className={bookingInputLabelClass}>Drop off</Label>
            <div className="relative mt-1">
              <MapPin className="pointer-events-none absolute left-3 top-3 z-[1] h-4 w-4 text-gray-400" />
              <AddressAutocompleteInput
                id="tripDropoff"
                placeholder={mapsKeyConfigured ? "Start typing drop-off address…" : "Drop-off address"}
                value={form.tripDropoff}
                onValueChange={(v) => update("tripDropoff", v)}
                className={bookingInputWithIconClass}
                required
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className={bookingInputLabelClass}>Stops along the way</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-lg bg-white/15 text-white hover:bg-white/25"
                disabled={form.tripStops.length >= MAX_TRIP_STOPS}
                onClick={() => update("tripStops", [...form.tripStops, ""])}
              >
                Add stop
              </Button>
            </div>
            {form.tripStops.length === 0 ? (
              <p className="text-xs text-white/60">Optional. Add intermediate stops if needed.</p>
            ) : (
              <ul className="space-y-3">
                {form.tripStops.map((stop, i) => (
                  <li key={i} className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <MapPin className="pointer-events-none absolute left-3 top-3 z-[1] h-4 w-4 text-gray-400" />
                      <AddressAutocompleteInput
                        id={`tripStop-${i}`}
                        aria-label={`Stop ${i + 1}`}
                        placeholder={`Stop ${i + 1}`}
                        value={stop}
                        onValueChange={(v) =>
                          update(
                            "tripStops",
                            form.tripStops.map((s, j) => (j === i ? v : s)),
                          )
                        }
                        className={bookingInputWithIconClass}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-white/80 hover:bg-white/10 hover:text-white"
                      aria-label={`Remove stop ${i + 1}`}
                      onClick={() => update("tripStops", form.tripStops.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className={bookingInputLabelClass}>Urgency</Label>
          <Select value={form.urgency} onValueChange={(v) => update("urgency", v)}>
            <SelectTrigger className={bookingSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={bookingSelectContentClass}>
              {bookingUrgencyOptions.map((option) => (
                <SelectItem key={option.value} className={bookingSelectItemClass} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className={bookingInputLabelClass}>Preferred Contact</Label>
          <Select value={form.contactMethod} onValueChange={(v) => update("contactMethod", v)}>
            <SelectTrigger className={bookingSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={bookingSelectContentClass}>
              {bookingContactMethodOptions.map((option) => (
                <SelectItem key={option.value} className={bookingSelectItemClass} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description" className={bookingInputLabelClass}>Additional Details</Label>
        <Textarea id="description" placeholder="Share any extra instructions" value={form.description} onChange={(e) => update("description", e.target.value)} className={bookingTextareaClass} />
      </div>
    </div>
  );
};

export default BookingServiceInfoStep;
