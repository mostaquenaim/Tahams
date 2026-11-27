import {
  AROUND_DHAKA_AREAS,
  DELIVERY_FEES,
  DHAKA_CITY_AREAS,
  OUTSIDE_DHAKA_AREAS,
  deliveryFeeConfig,
  expectedDeliveryFee,
} from './delivery-fees';

// The storefront prices checkout from deliveryFeeConfig(); the server
// re-prices every order with expectedDeliveryFee(). These must agree for
// every area the storefront can offer.
describe('delivery fees', () => {
  it('keeps the published fees', () => {
    expect(DELIVERY_FEES).toEqual({ dhakaCity: 80, aroundDhaka: 120, outsideDhaka: 150, other: 150 });
  });

  it('area lists do not overlap or repeat', () => {
    const all = [...DHAKA_CITY_AREAS, ...AROUND_DHAKA_AREAS, ...OUTSIDE_DHAKA_AREAS];
    expect(new Set(all).size).toBe(all.length);
    expect(OUTSIDE_DHAKA_AREAS).toHaveLength(32);
  });

  it('config and server pricing agree for every area', () => {
    const { fees, dhakaAreas } = deliveryFeeConfig();
    for (const [tier, areas] of Object.entries(dhakaAreas)) {
      for (const city of areas) {
        expect(expectedDeliveryFee('Dhaka', city)).toBe(fees[tier]);
      }
    }
  });

  it('prices other regions and unknown Dhaka areas as before', () => {
    expect(expectedDeliveryFee('Chattogram', 'anything')).toBe(150);
    expect(expectedDeliveryFee('Chattogram', 'Dhaka - North')).toBe(150);
    expect(expectedDeliveryFee('Dhaka', 'Somewhere new')).toBe(120);
    expect(expectedDeliveryFee('Dhaka', '')).toBe(120);
  });

  it('hands out copies, not the live table', () => {
    const config = deliveryFeeConfig();
    config.fees.dhakaCity = 0;
    config.dhakaAreas.dhakaCity.push('X');
    expect(DELIVERY_FEES.dhakaCity).toBe(80);
    expect(DHAKA_CITY_AREAS).not.toContain('X');
  });
});
