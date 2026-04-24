import { SEND_ME_BRAND_BLUE } from "./constants/brand";

export { SEND_ME_BRAND_BLUE };

/** Primary CTA on dark or light — pair with `style={{ backgroundColor: SEND_ME_BRAND_BLUE }}`. */
export const SEND_ME_BTN_PRIMARY =
  "rounded-lg font-semibold text-white shadow-md hover:opacity-90 hover:text-white focus-visible:text-white transition-opacity";

export const SEND_ME_BTN_PRIMARY_LG = `${SEND_ME_BTN_PRIMARY} h-12 px-8 text-lg inline-flex items-center justify-center gap-2`;

export const SEND_ME_BTN_PRIMARY_MD = `${SEND_ME_BTN_PRIMARY} h-10 px-5 text-sm inline-flex items-center justify-center gap-2`;

export const SEND_ME_BTN_PRIMARY_FORM = `${SEND_ME_BTN_PRIMARY} sm:min-w-[140px]`;

export const SEND_ME_BTN_SUBMIT_FORM = `${SEND_ME_BTN_PRIMARY} sm:min-w-[180px]`;

/** Back / ghost navigation on dark gradient pages. */
export const SEND_ME_BTN_GHOST_ON_DARK = "rounded-lg text-white/90 hover:bg-white/10 hover:text-white";

/** Secondary actions on dark glass panels (e.g. form Back). */
export const SEND_ME_BTN_SECONDARY_ON_DARK =
  "rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white";

/** Outline on dark (e.g. success page Home). */
export const SEND_ME_BTN_OUTLINE_ON_DARK =
  "rounded-lg border border-white/40 bg-white/5 text-white hover:bg-white/10 hover:text-white";
