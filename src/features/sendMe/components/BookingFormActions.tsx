import { Button } from "@/components/ui/button";
import type { BookingStep } from "@/features/sendMe/types";

interface BookingFormActionsProps {
  step: BookingStep;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  submitColor: string;
}

const BookingFormActions = ({ step, submitting, onBack, onNext, submitColor }: BookingFormActionsProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Button
        type="button"
        variant="outlineLight"
        className="sm:min-w-[120px]"
        onClick={onBack}
        disabled={step === 1 || submitting}
      >
        Back
      </Button>

      {step < 3 ? (
        <Button
          type="button"
          onClick={onNext}
          className="text-white hover:opacity-90 sm:min-w-[140px]"
          style={{ backgroundColor: submitColor }}
          disabled={submitting}
        >
          Next
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={submitting}
          className="text-white hover:opacity-90 sm:min-w-[180px]"
          style={{ backgroundColor: submitColor }}
        >
          {submitting ? "Submitting..." : "Submit Booking"}
        </Button>
      )}
    </div>
  );
};

export default BookingFormActions;
