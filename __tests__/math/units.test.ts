import {
  convertUnit,
  getUnitsByCategory,
  getAllCategories,
  convertCurrency,
} from '@/lib/math/units';

describe('MathHub Units & Currency', () => {
  it('converts length units (meters to feet)', () => {
    const feet = convertUnit(1, 'm', 'ft');
    expect(feet).toBeCloseTo(3.28084, 3);
  });

  it('converts mass units (kg to lb)', () => {
    const lb = convertUnit(1, 'kg', 'lb');
    expect(lb).toBeCloseTo(2.20462, 3);
  });

  it('converts temperature units (degC to degF)', () => {
    const degF = convertUnit(0, 'degC', 'degF');
    expect(degF).toBeCloseTo(32, 2);
  });

  it('converts currency with mock rates', () => {
    const mockRates = { USD: 1.0, EUR: 0.9, GBP: 0.8, INR: 83.0 };
    const inr = convertCurrency(100, 'USD', 'INR', mockRates);
    expect(inr).toBe(8300);

    const eurToGbp = convertCurrency(90, 'EUR', 'GBP', mockRates);
    // (90 / 0.9) * 0.8 = 80
    expect(eurToGbp).toBeCloseTo(80, 2);
  });

  it('retrieves all unit categories', () => {
    const categories = getAllCategories();
    expect(categories.length).toBeGreaterThanOrEqual(8);
  });
});
