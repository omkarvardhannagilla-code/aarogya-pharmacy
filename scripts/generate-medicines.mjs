// Generates src/data/medicines.json — 500 unique Indian pharmacy products.
// Run: node scripts/generate-medicines.mjs
import { SEEDS1 } from './seeds-part1.mjs';
import { SEEDS2 } from './seeds-part2.mjs';
import { SEEDS3 } from './seeds-part3.mjs';
import { SEEDS4 } from './seeds-part4.mjs';
import { SEEDS5 } from './seeds-part5.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const SEEDS = [...SEEDS1, ...SEEDS2, ...SEEDS3, ...SEEDS4, ...SEEDS5];

export const CATEGORIES = {
  'fever-pain':   { label: 'Fever & Pain Relief',        blurb: 'Trusted analgesics and antipyretics for everyday relief.' },
  'antibiotics':  { label: 'Antibiotics & Anti-infectives', blurb: 'Prescription anti-infectives dispensed with pharmacist care.' },
  'diabetes':     { label: 'Diabetes Care',              blurb: 'Complete sugar management, from metformin to insulin.' },
  'cardiac':      { label: 'Heart & Blood Pressure',     blurb: 'Cardiac care medicines for long-term heart health.' },
  'gastro':       { label: 'Digestive Health',           blurb: 'Acidity, digestion and gut wellness essentials.' },
  'vitamins':     { label: 'Vitamins & Supplements',     blurb: 'Daily nutrition, minerals and micronutrient support.' },
  'respiratory':  { label: 'Cold, Cough & Respiratory',  blurb: 'Breathing care, from cold relief to inhalers.' },
  'allergy':      { label: 'Allergy Care',               blurb: 'Fast-acting antihistamines and allergy management.' },
  'skin':         { label: 'Skin Care',                  blurb: 'Dermatologist-trusted creams, cleansers and treatments.' },
  'eye-ear':      { label: 'Eye & Ear Care',             blurb: 'Gentle, sterile drops for eyes and ears.' },
  'womens':       { label: "Women's Health",             blurb: 'Care designed around every stage of womanhood.' },
  'mens':         { label: "Men's Health",               blurb: 'Wellness, vitality and hair care for men.' },
  'children':     { label: 'Baby & Child Care',          blurb: 'Paediatric syrups, drops and gentle nutrition.' },
  'ortho':        { label: 'Bone, Joint & Muscle',       blurb: 'Sprays, gels and support for active movement.' },
  'neuro':        { label: 'Neurology & Migraine',       blurb: 'Specialist neurological and migraine medicines.' },
  'liver-kidney': { label: 'Liver & Kidney Care',        blurb: 'Hepatic and renal support, modern and classical.' },
  'thyroid':      { label: 'Thyroid & Hormonal',         blurb: 'Precise hormone therapies in every strength.' },
  'dental':       { label: 'Dental & Oral Care',         blurb: 'Oral gels, rinses and sensitivity relief.' },
  'ayurvedic':    { label: 'Ayurvedic & Herbal',         blurb: 'Time-tested classical and herbal formulations.' },
  'firstaid':     { label: 'First Aid & OTC Essentials', blurb: 'Antiseptics, ORS and everyday home essentials.' },
  'wellness':     { label: 'General Wellness & Nutrition', blurb: 'Protein, nutrition drinks and daily wellness.' },
};

// Deterministic hash → stable pseudo-random per product
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const pick = (h, arr) => arr[h % arr.length];
const range = (h, min, max, salt = 1) => min + ((h * salt) % 1000) / 1000 * (max - min);

// Curated duotone palettes for procedural medicine-box art
const PALETTES = [
  { a: '#6B54FD', b: '#F4F2FF', accent: '#FFC943' },
  { a: '#1C0D71', b: '#EDEBFF', accent: '#FF8A5C' },
  { a: '#4D7CFE', b: '#EAF0FF', accent: '#FFC943' },
  { a: '#E5484D', b: '#FFEDEE', accent: '#0D0056' },
  { a: '#F59E2D', b: '#FFF4E0', accent: '#6B54FD' },
  { a: '#8B5CF6', b: '#F3EDFF', accent: '#FF6B6B' },
  { a: '#0EA5A4', b: '#E4F7F6', accent: '#FFC943' },
  { a: '#D9578B', b: '#FDECF3', accent: '#1C0D71' },
  { a: '#3B4CCA', b: '#E9ECFF', accent: '#FF8A5C' },
  { a: '#B4764A', b: '#FAF0E6', accent: '#6B54FD' },
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const isLiquid = (pack) => /ml|syrup|solution|drops|liquid|tonic|suspension|gel$|lotion|wash|shampoo|oil/i.test(pack);
const formOf = (pack) => {
  if (/inhaler/i.test(pack)) return 'Inhaler';
  if (/respule/i.test(pack)) return 'Respules';
  if (/sachet/i.test(pack)) return 'Sachet';
  if (/capsule|softgel/i.test(pack)) return 'Capsule';
  if (/syrup|suspension|solution|liquid|tonic/i.test(pack)) return 'Syrup';
  if (/drops/i.test(pack)) return 'Drops';
  if (/cream|ointment|gel|balm|lotion/i.test(pack)) return 'Topical';
  if (/spray/i.test(pack)) return 'Spray';
  if (/powder|churna/i.test(pack)) return 'Powder';
  if (/tablet|lozenge/i.test(pack)) return 'Tablet';
  return 'Pack';
};

function describe(name, generic, cat, rx, pack) {
  const c = CATEGORIES[cat].label.toLowerCase();
  const base = `${name} (${generic}) is a ${rx ? 'prescription medicine' : 'trusted over-the-counter product'} from the ${c} range, supplied as a ${pack.toLowerCase()}.`;
  const tail = rx
    ? ' It should be used exactly as advised by a registered medical practitioner, and the full prescribed course should be completed.'
    : ' Read the label carefully before use and consult a pharmacist if symptoms persist.';
  return base + ' Sourced directly from the authorised manufacturer and stored under pharmacy-grade conditions to guarantee authenticity.' + tail;
}

const USES = {
  'fever-pain': ['Relief from fever', 'Headache and body ache', 'Mild to moderate pain', 'Toothache and menstrual cramps'],
  'antibiotics': ['Treatment of bacterial infections as diagnosed by a doctor', 'Respiratory, urinary, skin and soft-tissue infections (as prescribed)'],
  'diabetes': ['Management of type 2 diabetes mellitus', 'Blood sugar control alongside diet and exercise'],
  'cardiac': ['Management of hypertension', 'Long-term cardiovascular protection as prescribed'],
  'gastro': ['Relief from acidity, gas and indigestion', 'Digestive comfort and gut health'],
  'vitamins': ['Fills daily nutritional gaps', 'Supports energy, immunity and recovery'],
  'respiratory': ['Relief from cold, cough and congestion', 'Support for comfortable breathing'],
  'allergy': ['Relief from sneezing, itching and watery eyes', 'Management of allergic rhinitis and skin allergies'],
  'skin': ['Targeted care for skin concerns', 'Maintains healthy, comfortable skin'],
  'eye-ear': ['Soothing care for eyes and ears', 'Relief from dryness, irritation or infection (as directed)'],
  'womens': ["Supports women's health needs", 'Use as advised by a healthcare professional'],
  'mens': ["Supports men's wellness and vitality", 'Use as advised by a healthcare professional'],
  'children': ['Gentle, paediatric-strength care', 'Dose strictly by age and weight as advised'],
  'ortho': ['Relief from muscle and joint pain', 'Support for sprains, strains and backache'],
  'neuro': ['Specialist neurological care as prescribed', 'Symptom management under medical supervision'],
  'liver-kidney': ['Supports liver and urinary health', 'Use as advised by a healthcare professional'],
  'thyroid': ['Thyroid hormone replacement therapy', 'Take on an empty stomach as prescribed'],
  'dental': ['Relief from oral pain and sensitivity', 'Supports gum and mouth hygiene'],
  'ayurvedic': ['Classical herbal support for daily wellness', 'Traditional formulation prepared to authentic texts'],
  'firstaid': ['Everyday first-aid and home care', 'Keep handy for cuts, burns, dehydration and emergencies'],
  'wellness': ['Daily nutrition and active lifestyle support', 'Complements a balanced diet'],
};

const SIDE_EFFECTS = {
  rx: 'Possible side effects vary by individual and may include nausea, dizziness, stomach upset or drowsiness. Contact your doctor immediately if you notice rash, swelling, breathing difficulty or any severe reaction.',
  otc: 'Generally well tolerated when used as directed. Mild stomach upset or drowsiness may occur in some users. Discontinue and consult a doctor if irritation or unusual symptoms appear.',
};

function build(seed, i) {
  const [name, generic, mfr, cat, price, rx, pack] = seed;
  const h = hash(name);
  const discountPct = 5 + (h % 18); // 5–22%
  const mrp = Math.max(price + 2, Math.round(price / (1 - discountPct / 100)));
  const stockRoll = h % 100;
  const stock = stockRoll < 90 ? 'in-stock' : stockRoll < 97 ? 'low-stock' : 'out-of-stock';
  const rating = Math.round(range(h, 3.9, 4.9, 7) * 10) / 10;
  const reviews = 40 + (h % 2300);
  const mfgMonth = 1 + (h % 12);
  const mfgYear = 2025 + (h % 2 === 0 ? 0 : 1) * 0; // 2025
  const expYear = mfgYear + 2;
  const mm = String(mfgMonth).padStart(2, '0');
  return {
    id: slugify(name),
    name, generic, manufacturer: mfr, brand: name.split(' ')[0],
    category: cat, categoryLabel: CATEGORIES[cat].label,
    price, mrp, discountPct, rx: !!rx, pack, form: formOf(pack),
    stock, rating, reviews,
    popularity: (h % 1000),
    description: describe(name, generic, cat, rx, pack),
    uses: USES[cat],
    benefits: [
      '100% authentic, sourced from authorised distributors',
      'Checked for batch, seal and expiry before dispatch',
      rx ? 'Dispensed only against a valid prescription' : 'Available without prescription',
    ],
    dosage: rx
      ? 'Take strictly as prescribed by your doctor. Do not alter the dose or stop the course without medical advice.'
      : `Use as directed on the label${isLiquid(pack) ? '; shake well before use' : ''}. Do not exceed the recommended dose.`,
    warnings: [
      'Keep out of reach of children.',
      rx ? 'Schedule H: to be sold by retail on the prescription of a Registered Medical Practitioner only.' : 'Consult a doctor if symptoms persist beyond 3 days.',
      'Inform your doctor about ongoing medicines, pregnancy or existing conditions.',
    ],
    sideEffects: rx ? SIDE_EFFECTS.rx : SIDE_EFFECTS.otc,
    storage: isLiquid(pack)
      ? 'Store below 25°C away from direct sunlight. Keep the bottle tightly closed. Do not freeze.'
      : 'Store in a cool, dry place below 25°C, protected from light and moisture.',
    mfgDate: `${mm}/${mfgYear}`, expDate: `${mm}/${expYear}`,
    deliveryDays: 1 + (h % 2),
    box: pick(h, PALETTES),
  };
}

const items = SEEDS.map(build);
if (items.length !== 500) { console.error(`Expected 500 medicines, got ${items.length}`); process.exit(1); }
const ids = new Set(items.map(m => m.id));
if (ids.size !== 500) { console.error('Duplicate ids detected'); process.exit(1); }

mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/data/medicines.json', import.meta.url), JSON.stringify(items));
writeFileSync(new URL('../src/data/categories.json', import.meta.url), JSON.stringify(
  Object.entries(CATEGORIES).map(([key, v]) => ({ key, ...v, count: items.filter(m => m.category === key).length }))
));
console.log(`✔ Generated ${items.length} medicines across ${Object.keys(CATEGORIES).length} categories`);
