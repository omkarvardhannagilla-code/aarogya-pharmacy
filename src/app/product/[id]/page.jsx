import { notFound } from 'next/navigation';
import { ALL, getById } from '../../../lib/catalog';
import ProductDetail from './ProductDetail';

export function generateStaticParams() { return ALL.map((m) => ({ id: m.id })); }
export function generateMetadata({ params }) {
  const med = getById(params.id);
  return med ? { title: `${med.name} (${med.generic}) — Aarogya Pharmacy` } : {};
}
export default function ProductPage({ params }) {
  const med = getById(params.id);
  if (!med) notFound();
  const related = ALL.filter((m) => m.category === med.category && m.id !== med.id).sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  return <ProductDetail med={med} related={related} />;
}
