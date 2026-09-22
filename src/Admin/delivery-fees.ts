/* eslint-disable prettier/prettier */
// Delivery fees, mirroring the storefront checkout (components/Cart/BuyingAddress.js).
// Area lists come from the storefront's public/Dhaka-*-delivery.json.
export const DELIVERY_FEES = { dhakaCity: 80, aroundDhaka: 120, outsideDhaka: 150, other: 150 };
const DHAKA_CITY_AREAS = ['Dhaka - North', 'Dhaka - South'];
const OUTSIDE_AREAS = new Set(["Faridpur","Gazipur","Gopalganj","Kishoreganj","Madaripur","Manikganj - Shibloya","Manikganj - Singair","Manikganj - Town","Munshiganj - Gajaria","Munshiganj - Lohajong","Munshiganj - Sirajdikhan","Munshiganj - Town","Narayanganj","Narsingdi","Nawabganj","Rajbari - Baliakandi","Rajbari - Pangsha","Rajbari - Town","Shariatpur - Naria","Shariatpur - Town","Tangail - Basail","Tangail - Bhuapur","Tangail - Deldur","Tangail - Dhanbari","Tangail - Ghatail","Tangail - Gopalpur","Tangail - Kalihati","Tangail - Madhupur","Tangail - Mirzapur","Tangail - Nagarpur","Tangail - Sakhipur","Tangail - Town"]);

export function expectedDeliveryFee(region: string, city: string): number {
  if (region !== 'Dhaka') return DELIVERY_FEES.other;
  if (DHAKA_CITY_AREAS.includes(city)) return DELIVERY_FEES.dhakaCity;
  if (OUTSIDE_AREAS.has(city)) return DELIVERY_FEES.outsideDhaka;
  return DELIVERY_FEES.aroundDhaka;
}
