import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-mint-line bg-pine-deep text-mint-soft">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-white">Aarogya Pharmacy</p>
          <p className="mt-2 max-w-xs text-sm text-mint">Authentic medicines, verified prescriptions and doorstep delivery across Telangana.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Explore</p>
          <ul className="mt-2 space-y-1">
            <li><Link className="hover:text-white" href="/medicines">All medicines</Link></li>
            <li><Link className="hover:text-white" href="/cart">Cart</Link></li>
            <li><Link className="hover:text-white" href="/orders">My orders</Link></li>
            <li><Link className="hover:text-white" href="/about">About us</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Good to know</p>
          <ul className="mt-2 space-y-1 text-mint">
            <li>Delivery currently within Telangana only</li>
            <li>Cash on delivery · UPI at the door</li>
            <li>℞ items dispensed only against a valid prescription</li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-mint">© {new Date().getFullYear()} Aarogya Pharmacy. Medicines are dispensed under the supervision of a registered pharmacist.</p>
    </footer>
  );
}
