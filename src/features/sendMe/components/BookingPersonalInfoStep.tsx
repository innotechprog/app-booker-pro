import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  bookingGlassPanelClass,
  bookingInputClass,
  bookingInputLabelClass,
  bookingInputWithIconClass,
  bookingPanelHeadingClass,
} from "@/features/sendMe/constants";
import type { BookingFormData } from "@/features/sendMe/types";

interface BookingPersonalInfoStepProps {
  form: BookingFormData;
  update: (key: keyof BookingFormData, value: string) => void;
}

const BookingPersonalInfoStep = ({ form, update }: BookingPersonalInfoStepProps) => {
  return (
    <div className={bookingGlassPanelClass}>
      <h3 className={bookingPanelHeadingClass}>Personal Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName" className={bookingInputLabelClass}>Full Name</Label>
          <Input id="fullName" placeholder="Enter full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={bookingInputClass} required />
        </div>
        <div>
          <Label htmlFor="cellphone" className={bookingInputLabelClass}>Cellphone</Label>
          <Input id="cellphone" placeholder="e.g. 0812345678" inputMode="numeric" value={form.cellphone} onChange={(e) => update("cellphone", e.target.value.replace(/\D/g, ""))} className={bookingInputClass} required />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="email" className={bookingInputLabelClass}>Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className={bookingInputClass} required />
        </div>
        <div>
          <Label htmlFor="alternativeNumber" className={bookingInputLabelClass}>Alternative Number</Label>
          <Input id="alternativeNumber" placeholder="Optional" inputMode="numeric" value={form.alternativeNumber} onChange={(e) => update("alternativeNumber", e.target.value.replace(/\D/g, ""))} className={bookingInputClass} />
        </div>
      </div>
      <div>
        <Label htmlFor="address" className={bookingInputLabelClass}>Address</Label>
        <div className="relative mt-1">
          <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input id="address" placeholder="Street address / area" value={form.address} onChange={(e) => update("address", e.target.value)} className={bookingInputWithIconClass} required />
        </div>
      </div>
    </div>
  );
};

export default BookingPersonalInfoStep;
