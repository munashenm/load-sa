import { SA_PROVINCES, type SAProvince } from "@/lib/sa-data";

export type LatLng = { lat: number; lng: number };

export type ParsedPlace = {
  address: string;
  city: string;
  province: SAProvince;
  lat: number;
  lng: number;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

const PROVINCE_ALIASES: Record<string, SAProvince> = {
  Gauteng: "Gauteng",
  GP: "Gauteng",
  "Western Cape": "Western Cape",
  WC: "Western Cape",
  "KwaZulu-Natal": "KwaZulu-Natal",
  "Kwazulu-Natal": "KwaZulu-Natal",
  KZN: "KwaZulu-Natal",
  "Eastern Cape": "Eastern Cape",
  EC: "Eastern Cape",
  "Free State": "Free State",
  FS: "Free State",
  Limpopo: "Limpopo",
  LP: "Limpopo",
  Mpumalanga: "Mpumalanga",
  MP: "Mpumalanga",
  "Northern Cape": "Northern Cape",
  NC: "Northern Cape",
  "North West": "North West",
  NW: "North West",
};

export function mapGoogleProvince(value: string): SAProvince {
  const hit = PROVINCE_ALIASES[value.trim()];
  if (hit) return hit;
  const match = SA_PROVINCES.find(
    (p) => p.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? "Gauteng";
}

function component(components: AddressComponent[], ...types: string[]) {
  return components.find((c) => types.some((t) => c.types.includes(t)));
}

export function parseAddressComponents(
  components: AddressComponent[],
  formattedAddress: string,
  lat: number,
  lng: number,
): ParsedPlace {
  const locality =
    component(components, "locality") ??
    component(components, "sublocality", "sublocality_level_1") ??
    component(components, "administrative_area_level_2");

  const provinceComp = component(components, "administrative_area_level_1");
  const province = mapGoogleProvince(
    provinceComp?.long_name ?? provinceComp?.short_name ?? "Gauteng",
  );

  const city =
    locality?.long_name ??
    formattedAddress.split(",")[0]?.trim() ??
    "Unknown";

  return {
    address: formattedAddress,
    city,
    province,
    lat,
    lng,
  };
}
