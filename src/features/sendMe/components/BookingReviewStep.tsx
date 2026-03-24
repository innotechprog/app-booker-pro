import type { BookingFormData } from "@/features/sendMe/types";
import {
  bookingGlassPanelClass,
  bookingPanelHeadingClass,
  bookingReviewFieldLabelClass,
  bookingReviewGridClass,
  bookingTermsLabelClass,
} from "@/features/sendMe/constants";

interface BookingReviewStepProps {
  form: BookingFormData;
  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
}

const BookingReviewStep = ({ form, acceptedTerms, setAcceptedTerms }: BookingReviewStepProps) => {
  return (
    <div className={bookingGlassPanelClass}>
      <h3 className={bookingPanelHeadingClass}>Review Your Booking</h3>
      <div className={bookingReviewGridClass}>
        <p><span className={bookingReviewFieldLabelClass}>Full Name:</span> {form.fullName}</p>
        <p><span className={bookingReviewFieldLabelClass}>Cellphone:</span> {form.cellphone}</p>
        <p><span className={bookingReviewFieldLabelClass}>Email:</span> {form.email}</p>
        <p><span className={bookingReviewFieldLabelClass}>Alternative Number:</span> {form.alternativeNumber || "N/A"}</p>
        <p className="md:col-span-2"><span className={bookingReviewFieldLabelClass}>Address:</span> {form.address}</p>
        <p><span className={bookingReviewFieldLabelClass}>Date:</span> {form.date}</p>
        <p><span className={bookingReviewFieldLabelClass}>Time:</span> {form.time}</p>
        <p><span className={bookingReviewFieldLabelClass}>Service:</span> {form.specificService === "other" ? form.customService : form.specificService}</p>
        <p><span className={bookingReviewFieldLabelClass}>Urgency:</span> {form.urgency}</p>
        <p><span className={bookingReviewFieldLabelClass}>Preferred Contact:</span> {form.contactMethod}</p>
        <p className="md:col-span-2"><span className={bookingReviewFieldLabelClass}>Additional Details:</span> {form.description || "N/A"}</p>
      </div>

      <label className={bookingTermsLabelClass}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          I accept the terms and conditions and agree to be contacted regarding this booking request.
        </span>
      </label>
    </div>
  );
};

export default BookingReviewStep;
