import { unit } from 'mathjs';

export interface UnitDefinition {
  name: string;
  symbol: string;
  category: string;
}

export interface UnitCategory {
  name: string;
  units: UnitDefinition[];
}

export const CURRENCY_LIST: { code: string; name: string }[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'ZAR', name: 'South African Rand' },
];

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    name: 'length',
    units: [
      { name: 'Meter', symbol: 'm', category: 'length' },
      { name: 'Centimeter', symbol: 'cm', category: 'length' },
      { name: 'Millimeter', symbol: 'mm', category: 'length' },
      { name: 'Kilometer', symbol: 'km', category: 'length' },
      { name: 'Inch', symbol: 'in', category: 'length' },
      { name: 'Foot', symbol: 'ft', category: 'length' },
      { name: 'Yard', symbol: 'yd', category: 'length' },
      { name: 'Mile', symbol: 'mi', category: 'length' },
    ],
  },
  {
    name: 'mass',
    units: [
      { name: 'Kilogram', symbol: 'kg', category: 'mass' },
      { name: 'Gram', symbol: 'g', category: 'mass' },
      { name: 'Milligram', symbol: 'mg', category: 'mass' },
      { name: 'Pound', symbol: 'lb', category: 'mass' },
      { name: 'Ounce', symbol: 'oz', category: 'mass' },
      { name: 'Tonne', symbol: 'tonne', category: 'mass' },
    ],
  },
  {
    name: 'temperature',
    units: [
      { name: 'Celsius', symbol: 'degC', category: 'temperature' },
      { name: 'Fahrenheit', symbol: 'degF', category: 'temperature' },
      { name: 'Kelvin', symbol: 'K', category: 'temperature' },
    ],
  },
  {
    name: 'time',
    units: [
      { name: 'Second', symbol: 's', category: 'time' },
      { name: 'Minute', symbol: 'min', category: 'time' },
      { name: 'Hour', symbol: 'h', category: 'time' },
      { name: 'Day', symbol: 'day', category: 'time' },
      { name: 'Week', symbol: 'week', category: 'time' },
      { name: 'Year', symbol: 'year', category: 'time' },
    ],
  },
  {
    name: 'data',
    units: [
      { name: 'Bit', symbol: 'b', category: 'data' },
      { name: 'Byte', symbol: 'B', category: 'data' },
      { name: 'Kilobyte', symbol: 'kB', category: 'data' },
      { name: 'Megabyte', symbol: 'MB', category: 'data' },
      { name: 'Gigabyte', symbol: 'GB', category: 'data' },
      { name: 'Terabyte', symbol: 'TB', category: 'data' },
    ],
  },
  {
    name: 'speed',
    units: [
      { name: 'Meter/second', symbol: 'm/s', category: 'speed' },
      { name: 'Km/hour', symbol: 'km/h', category: 'speed' },
      { name: 'Miles/hour', symbol: 'mph', category: 'speed' },
      { name: 'Knot', symbol: 'knot', category: 'speed' },
    ],
  },
  {
    name: 'area',
    units: [
      { name: 'Square meter', symbol: 'm^2', category: 'area' },
      { name: 'Square foot', symbol: 'ft^2', category: 'area' },
      { name: 'Square km', symbol: 'km^2', category: 'area' },
      { name: 'Acre', symbol: 'acre', category: 'area' },
      { name: 'Hectare', symbol: 'hectare', category: 'area' },
    ],
  },
  {
    name: 'volume',
    units: [
      { name: 'Liter', symbol: 'l', category: 'volume' },
      { name: 'Milliliter', symbol: 'ml', category: 'volume' },
      { name: 'Cubic meter', symbol: 'm^3', category: 'volume' },
      { name: 'Gallon (US)', symbol: 'gal', category: 'volume' },
      { name: 'Fluid ounce', symbol: 'floz', category: 'volume' },
    ],
  },
  {
    name: 'pressure',
    units: [
      { name: 'Pascal', symbol: 'Pa', category: 'pressure' },
      { name: 'Bar', symbol: 'bar', category: 'pressure' },
      { name: 'Atmosphere', symbol: 'atm', category: 'pressure' },
      { name: 'PSI', symbol: 'psi', category: 'pressure' },
      { name: 'Torr', symbol: 'torr', category: 'pressure' },
    ],
  },
  {
    name: 'energy',
    units: [
      { name: 'Joule', symbol: 'J', category: 'energy' },
      { name: 'Kilojoule', symbol: 'kJ', category: 'energy' },
      { name: 'Calorie', symbol: 'cal', category: 'energy' },
      { name: 'Kilocalorie', symbol: 'kcal', category: 'energy' },
      { name: 'Watt hour', symbol: 'Wh', category: 'energy' },
      { name: 'Kilowatt hour', symbol: 'kWh', category: 'energy' },
    ],
  },
];

export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  try {
    return unit(value, fromUnit).toNumber(toUnit);
  } catch {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }
}

export function getUnitsByCategory(category: string): UnitDefinition[] {
  const cat = UNIT_CATEGORIES.find((c) => c.name === category);
  return cat ? cat.units : [];
}

export function getAllCategories(): UnitCategory[] {
  return UNIT_CATEGORIES;
}

export async function fetchExchangeRates(base: string = 'USD'): Promise<Record<string, number>> {
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();
    return { ...data.rates, USD: 1.0 };
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return { USD: 1.0, EUR: 0.92, GBP: 0.79, INR: 83.5, JPY: 155.0, CAD: 1.36, AUD: 1.51 };
  }
}

export function convertCurrency(
  value: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return value;

  const rateFrom = from === 'USD' ? 1 : rates[from];
  const rateTo = to === 'USD' ? 1 : rates[to];

  if (!rateFrom || !rateTo) return value;

  return (value / rateFrom) * rateTo;
}
