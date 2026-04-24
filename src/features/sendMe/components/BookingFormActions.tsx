import { Button } from "@/components/ui/button";
import type { BookingStep } from "@/features/sendMe/types";
import {
  SEND_ME_BRAND_BLUE,
  SEND_ME_BTN_PRIMARY_FORM,
  SEND_ME_BTN_SECONDARY_ON_DARK,
  SEND_ME_BTN_SUBMIT_FORM,
} from "@/features/sendMe/buttonStyles";

interface BookingFormActionsProps {
  step: BookingStep;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

const BookingFormActions = ({ step, submitting, onBack, onNext }: BookingFormActionsProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Button
        type="button"
        variant="outline"
        className={`${SEND_ME_BTN_SECONDARY_ON_DARK} sm:min-w-[120px]`}
        onClick={onBack}
        disabled={step === 1 || submitting}
      >
        Back
      </Button>

      {step < 3 ? (
        <Button
          type="button"
          onClick={onNext}
          className={SEND_ME_BTN_PRIMARY_FORM}
          style={{ backgroundColor: SEND_ME_BRAND_BLUE }}
          disabled={submitting}
        >
          Next
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={submitting}
          className={SEND_ME_BTN_SUBMIT_FORM}
          style={{ backgroundColor: SEND_ME_BRAND_BLUE }}
        >
          {submitting ? "Submitting..." : "Submit Booking"}
        </Button>
      )}
    </div>
  );
};

export default BookingFormActions;
