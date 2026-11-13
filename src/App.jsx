import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthProvider from './features/auth/AuthProvider';
import { PublicOnly, RequireRole } from './features/auth/RouteGuards';
import { ToastProvider } from './components/ui';
import AppLayout from './components/layout/AppLayout';
import { ROLES } from './lib/roles';

import Login from './pages/public/Login';
import Register from './pages/public/Register';
import RegisterGym from './pages/public/RegisterGym';
import NotFound from './pages/public/NotFound';

import UserHome from './pages/user/UserHome';
import UserClasses from './pages/user/UserClasses';
import UserMembership from './pages/user/UserMembership';
import UserReservations from './pages/user/UserReservations';
import UserStore from './pages/user/UserStore';

import AdminDashboard from './pages/admin/AdminDashboard';
import Members from './pages/admin/Members';
import AdminClasses from './pages/admin/AdminClasses';
import Profesores from './pages/admin/Profesores';
import Finance from './pages/admin/Finance';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import AdminUsuarios from './pages/admin/AdminUsuarios';

import SuperDashboard from './pages/superadmin/SuperDashboard';
import Gyms from './pages/superadmin/Gyms';
import Admins from './pages/superadmin/Admins';
import System from './pages/superadmin/System';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/registrar-gimnasio" element={<RegisterGym />} />
            </Route>

            <Route element={<RequireRole roles={[ROLES.USER]} />}>
              <Route element={<AppLayout />}>
                <Route index element={<UserHome />} />
                <Route path="clases" element={<UserClasses />} />
                <Route path="membresia" element={<UserMembership />} />
                <Route path="reservas" element={<UserReservations />} />
                <Route path="tienda" element={<UserStore />} />
              </Route>
            </Route>

            <Route element={<RequireRole roles={[ROLES.ADMIN]} />}>
              <Route path="admin" element={<AppLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="miembros" element={<Members />} />
                <Route path="clases" element={<AdminClasses />} />
                <Route path="profesores" element={<Profesores />} />
                <Route path="finanzas" element={<Finance />} />
                <Route path="tienda" element={<ProductsAdmin />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
              </Route>
            </Route>

            <Route element={<RequireRole roles={[ROLES.SUPERADMIN]} />}>
              <Route path="superadmin" element={<AppLayout />}>
                <Route index element={<SuperDashboard />} />
                <Route path="gimnasios" element={<Gyms />} />
                <Route path="admins" element={<Admins />} />
                <Route path="sistema" element={<System />} />
                <Route path="tienda" element={<ProductsAdmin />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
