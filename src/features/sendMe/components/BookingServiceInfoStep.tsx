import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  bookingContactMethodOptions,
  bookingDateTimeInputWithIconClass,
  bookingInputLabelClass,
  bookingInputClass,
  bookingSelectContentClass,
  bookingSelectItemClass,
  bookingSelectTriggerClass,
  bookingSpecificServiceOptions,
  bookingTextareaClass,
  bookingUrgencyOptions,
} from "@/features/sendMe/constants";
import type { BookingFormData } from "@/features/sendMe/types";

interface BookingServiceInfoStepProps {
  form: BookingFormData;
  update: (key: keyof BookingFormData, value: string) => void;
}

const BookingServiceInfoStep = ({ form, update }: BookingServiceInfoStepProps) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="date" className={bookingInputLabelClass}>Preferred Date</Label>
          <div className="relative mt-1">
            <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input id="date" type="date" min={new Date().toISOString().split("T")[0]} value={form.date} onChange={(e) => update("date", e.target.value)} className={bookingDateTimeInputWithIconClass} required />
          </div>
        </div>
        <div>
          <Label htmlFor="time" className={bookingInputLabelClass}>Preferred Time</Label>
          <div className="relative mt-1">
            <Clock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input id="time" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className={bookingDateTimeInputWithIconClass} required />
          </div>
        </div>
      </div>

      <div>
        <Label className={bookingInputLabelClass}>Specific Service</Label>
        <Select value={form.specificService} onValueChange={(v) => update("specificService", v)}>
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
