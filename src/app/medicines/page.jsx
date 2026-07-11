import { Suspense } from 'react';
import ShopClient from './ShopClient';
export const metadata = { title: 'All medicines — Aarogya Pharmacy' };
export default function MedicinesPage() {
  return <Suspense fallback={<div className="p-10 text-center text-ink-soft">Loading catalog…</div>}><ShopClient /></Suspense>;
}
