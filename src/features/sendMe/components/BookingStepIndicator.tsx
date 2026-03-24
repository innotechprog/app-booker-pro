import { bookingStepLabels } from "@/features/sendMe/constants";
import type { BookingStep } from "@/features/sendMe/types";

interface BookingStepIndicatorProps {
  step: BookingStep;
}

const BookingStepIndicator = ({ step }: BookingStepIndicatorProps) => {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:text-sm">
      {bookingStepLabels.map((label, index) => {
        const current = index + 1;
        return (
          <div
            key={label}
            className={`rounded-md px-3 py-2 text-center ${
              step >= current ? "bg-white font-semibold text-[#1e3a5f]" : "bg-white/10 text-white/80"
            }`}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default BookingStepIndicator;
