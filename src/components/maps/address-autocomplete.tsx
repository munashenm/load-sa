"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { parseAddressComponents, type ParsedPlace } from "@/lib/maps-places";

export type { ParsedPlace };

type AddressAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: ParsedPlace) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export function AddressAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  required,
  disabled,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [mapsReady, setMapsReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim();

  onChangeRef.current = onChange;
  onPlaceSelectedRef.current = onPlaceSelected;

  useEffect(() => {
    if (!apiKey || !inputRef.current || disabled) return;

    let cancelled = false;
    const loader = new Loader({
      apiKey,
      libraries: ["places"],
      region: "ZA",
    });

    loader
      .importLibrary("places")
      .then(({ Autocomplete }) => {
        if (cancelled || !inputRef.current) return;

        const autocomplete = new Autocomplete(inputRef.current, {
          componentRestrictions: { country: "za" },
          fields: ["formatted_address", "address_components", "geometry"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry?.location || !place.formatted_address) return;

          const parsed = parseAddressComponents(
            (place.address_components ?? []) as {
              long_name: string;
              short_name: string;
              types: string[];
            }[],
            place.formatted_address,
            place.geometry.location.lat(),
            place.geometry.location.lng(),
          );

          onChangeRef.current(parsed.address);
          onPlaceSelectedRef.current(parsed);
        });

        setMapsReady(true);
      })
      .catch(() => {
        setMapsReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, disabled]);

  return (
    <div className="relative">
      <Input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
      />
      {apiKey && mapsReady && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wide text-slate-600">
          Maps
        </span>
      )}
    </div>
  );
}
