import { bookingStepLabels, SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants";
import type { BookingStep } from "@/features/sendMe/types";

interface BookingStepIndicatorProps {
  step: BookingStep;
}

const BookingStepIndicator = ({ step }: BookingStepIndicatorProps) => {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:text-sm">
      {bookingStepLabels.map((label, index) => {
        const current = index + 1;
        const active = step >= current;
        return (
          <div
            key={label}
            className={`rounded-lg px-3 py-2 text-center ${
              active ? "bg-white font-semibold" : "bg-white/10 text-white/80"
            }`}
            style={active ? { color: SEND_ME_BRAND_BLUE } : undefined}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default BookingStepIndicator;
