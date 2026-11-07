import { Outlet } from 'react-router-dom';
import CartProvider from '../../features/store/CartProvider';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <CartProvider>
      <Navbar />
      <main id="contenido" className="page">
        <Outlet />
      </main>
    </CartProvider>
  );
}
