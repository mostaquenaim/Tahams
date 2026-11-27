/* eslint-disable prettier/prettier */
// Delivery fees and the Dhaka delivery areas. This file is the ONLY copy:
// the storefront checkout reads it through GET /admin/checkout/delivery-fees
// and every order is re-priced with expectedDeliveryFee() before it is saved,
// so what the customer is shown and what they are charged cannot drift.
// Changing a fee here needs a backend deploy; open checkouts that still hold
// the old fee are refused ("Invalid delivery fee.") and re-fetch it.
export const DELIVERY_FEES = Object.freeze({
  dhakaCity: 80,
  aroundDhaka: 120,
  outsideDhaka: 150,
  other: 150, // any region other than Dhaka
});

// Areas offered when the region is Dhaka (names as Pathao spells them).
export const DHAKA_CITY_AREAS: readonly string[] = Object.freeze(['Dhaka - North', 'Dhaka - South']);
export const AROUND_DHAKA_AREAS: readonly string[] = Object.freeze(['Savar', 'Keraniganj - Dhaka', 'Tongi']);
export const OUTSIDE_DHAKA_AREAS: readonly string[] = Object.freeze(["Faridpur","Gazipur","Gopalganj","Kishoreganj","Madaripur","Manikganj - Shibloya","Manikganj - Singair","Manikganj - Town","Munshiganj - Gajaria","Munshiganj - Lohajong","Munshiganj - Sirajdikhan","Munshiganj - Town","Narayanganj","Narsingdi","Nawabganj","Rajbari - Baliakandi","Rajbari - Pangsha","Rajbari - Town","Shariatpur - Naria","Shariatpur - Town","Tangail - Basail","Tangail - Bhuapur","Tangail - Deldur","Tangail - Dhanbari","Tangail - Ghatail","Tangail - Gopalpur","Tangail - Kalihati","Tangail - Madhupur","Tangail - Mirzapur","Tangail - Nagarpur","Tangail - Sakhipur","Tangail - Town"]);

const OUTSIDE_SET = new Set(OUTSIDE_DHAKA_AREAS);

// A Dhaka city that is in none of the lists is charged the around-Dhaka fee
// (unchanged from before these lists moved here).
export function expectedDeliveryFee(region: string, city: string): number {
  if (region !== 'Dhaka') return DELIVERY_FEES.other;
  if (DHAKA_CITY_AREAS.includes(city)) return DELIVERY_FEES.dhakaCity;
  if (OUTSIDE_SET.has(city)) return DELIVERY_FEES.outsideDhaka;
  return DELIVERY_FEES.aroundDhaka;
}

// What the storefront needs to show the fee before the order is placed.
export function deliveryFeeConfig() {
  return {
    fees: { ...DELIVERY_FEES } as Record<keyof typeof DELIVERY_FEES, number>,
    dhakaAreas: {
      dhakaCity: [...DHAKA_CITY_AREAS],
      aroundDhaka: [...AROUND_DHAKA_AREAS],
      outsideDhaka: [...OUTSIDE_DHAKA_AREAS],
    },
  };
}
