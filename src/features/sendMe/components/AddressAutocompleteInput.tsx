import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loadGoogleMapsPlacesScript } from "@/utils/googleMapsPlacesLoader";

const PAC_Z_INDEX_STYLE_ID = "sendme-google-pac-zindex";

function ensurePacContainerAboveDialogs() {
  if (document.getElementById(PAC_Z_INDEX_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = PAC_Z_INDEX_STYLE_ID;
  el.textContent = ".pac-container { z-index: 10000 !important; }";
  document.head.appendChild(el);
}

export interface AddressAutocompleteInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Google Places Autocomplete when `VITE_GOOGLE_MAPS_API_KEY` is set; otherwise a normal text field.
 * Restricted to South Africa (`za`) to match Send Me service area; adjust if you expand regions.
 */
const AddressAutocompleteInput = ({
  value,
  onValueChange,
  className,
  ...rest
}: AddressAutocompleteInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  useEffect(() => {
    if (!apiKey) return;

    const input = inputRef.current;
    if (!input) return;

    let cancelled = false;

    loadGoogleMapsPlacesScript(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current) return;
        ensurePacContainerAboveDialogs();

        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: ["za"] },
          fields: ["formatted_address", "name"],
          types: ["address"],
        });
        autocompleteRef.current = ac;

        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const text = place.formatted_address || place.name || "";
          if (text) onValueChangeRef.current(text);
        });
      })
      .catch(() => {
        /* Plain typing still works */
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [apiKey]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      autoComplete="street-address"
      className={cn(className)}
      {...rest}
    />
  );
};

export default AddressAutocompleteInput;
