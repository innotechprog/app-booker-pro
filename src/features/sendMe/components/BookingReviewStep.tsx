import { useState } from "react";
import type { BookingFormData } from "@/features/sendMe/types";
import {
  bookingGlassPanelClass,
  bookingPanelHeadingClass,
  bookingReviewFieldLabelClass,
  bookingReviewGridClass,
  bookingTermsLabelClass,
  getBookingSpecificServiceLabel,
  sendMeBookingTermsClauses,
} from "@/features/sendMe/constants";

interface BookingReviewStepProps {
  form: BookingFormData;
  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
}

const BookingReviewStep = ({ form, acceptedTerms, setAcceptedTerms }: BookingReviewStepProps) => {
  const [showTerms, setShowTerms] = useState(false);
  const serviceLabel =
    form.specificService === "other" ? form.customService : getBookingSpecificServiceLabel(form.specificService);
  const tripStopsListed = form.tripStops.map((s) => s.trim()).filter(Boolean);

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
        <p><span className={bookingReviewFieldLabelClass}>Service:</span> {serviceLabel}</p>
        {form.specificService === "trip" && (
          <>
            <p className="md:col-span-2"><span className={bookingReviewFieldLabelClass}>Pick up:</span> {form.tripPickup}</p>
            <p className="md:col-span-2"><span className={bookingReviewFieldLabelClass}>Drop off:</span> {form.tripDropoff}</p>
            <p className="md:col-span-2">
              <span className={bookingReviewFieldLabelClass}>Stops:</span>{" "}
              {tripStopsListed.length > 0 ? tripStopsListed.join(" → ") : "None"}
            </p>
          </>
        )}
        <p><span className={bookingReviewFieldLabelClass}>Urgency:</span> {form.urgency}</p>
        <p><span className={bookingReviewFieldLabelClass}>Preferred Contact:</span> {form.contactMethod}</p>
        <p className="md:col-span-2"><span className={bookingReviewFieldLabelClass}>Additional Details:</span> {form.description || "N/A"}</p>
      </div>

      <div className="mt-4 rounded-lg border border-white/20 bg-white/5">
        <button
          type="button"
          onClick={() => setShowTerms((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
        >
          <span>Terms &amp; Conditions</span>
          <span className="text-white/60 text-xs">{showTerms ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showTerms && (
          <div className="max-h-64 space-y-3 overflow-y-auto border-t border-white/10 px-4 pb-4 pt-3 text-xs text-white/80">
            {sendMeBookingTermsClauses.map((t) => (
              <div key={t.heading}>
                <p className="mb-0.5 font-semibold text-white/90">{t.heading}</p>
                <p className="leading-relaxed">{t.body}</p>
              </div>
            ))}
            <p className="mt-2 text-white/60 italic">Last updated: March 2026. IB Innovative Solutions. All rights reserved.</p>
          </div>
        )}
      </div>

      <label className={bookingTermsLabelClass}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span>
          I have read and accept the{" "}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="font-medium text-blue-300 underline hover:text-blue-200"
          >
            Terms &amp; Conditions
          </button>{" "}
          and agree to be contacted regarding this booking request.
        </span>
      </label>
    </div>
  );
};

export default BookingReviewStep;
