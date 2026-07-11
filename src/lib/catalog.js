import medicines from '../data/medicines.json';
import categories from '../data/categories.json';

export const ALL = medicines;
export const CATEGORIES = categories;
export const getById = (id) => ALL.find((m) => m.id === id);
export const MANUFACTURERS = [...new Set(ALL.map((m) => m.manufacturer))].sort();

export function searchMedicines(list, q) {
  if (!q) return list;
  const t = q.trim().toLowerCase();
  if (!t) return list;
  return list.filter((m) =>
    m.name.toLowerCase().includes(t) ||
    m.generic.toLowerCase().includes(t) ||
    m.brand.toLowerCase().includes(t) ||
    m.manufacturer.toLowerCase().includes(t) ||
    m.categoryLabel.toLowerCase().includes(t)
  );
}

export function applyFilters(list, f) {
  return list.filter((m) =>
    (!f.category || m.category === f.category) &&
    (f.rx === 'all' || (f.rx === 'rx' ? m.rx : !m.rx)) &&
    (!f.inStockOnly || m.stock !== 'out-of-stock') &&
    (!f.manufacturer || m.manufacturer === f.manufacturer) &&
    m.price >= f.minPrice && m.price <= f.maxPrice
  );
}

export const SORTERS = {
  popular:    { label: 'Most popular',        fn: (a, b) => b.popularity - a.popularity },
  'price-asc':  { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  rating:     { label: 'Top rated',           fn: (a, b) => b.rating - a.rating },
  az:         { label: 'A to Z',              fn: (a, b) => a.name.localeCompare(b.name) },
  availability: { label: 'Availability',      fn: (a, b) => (a.stock === 'out-of-stock') - (b.stock === 'out-of-stock') },
};
