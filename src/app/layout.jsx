import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import Assistant from '../components/Assistant';

export const metadata = {
  title: 'Aarogya Pharmacy — Authentic medicines, delivered across Telangana',
  description: 'Premium online pharmacy with 500+ genuine medicines, AI-verified prescriptions and fast doorstep delivery within Telangana.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <CartDrawer />
        <Assistant />
      </body>
    </html>
  );
}
