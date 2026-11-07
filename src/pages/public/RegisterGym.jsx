import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import { authApi, gimnasiosApi, usuariosApi } from '../../services';
import { HOME_POR_ROL, ROL_EN_BD, ROLES } from '../../lib/roles';
import { Button, Input } from '../../components/ui';
import AuthShell from './AuthShell';

const VACIO = {
  nombre_gimnasio: '', direccion_gimnasio: '', telefono_gimnasio: '',
  nombre: '', apellido: '', correo: '', password: '',
};

export default function RegisterGym() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(VACIO);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      // 1) cuenta del administrador (si el correo ya existe, falla antes de crear el gimnasio)
      const { nombre, apellido, correo, password } = datos;
      const { usuario } = await authApi.registro({ nombre, apellido, correo, password });
      // 2) gimnasio
      const gimnasio = await gimnasiosApi.crear({
        nombre_gimnasio: datos.nombre_gimnasio,
        direccion_gimnasio: datos.direccion_gimnasio,
        telefono_gimnasio: datos.telefono_gimnasio || null,
      });
      // 3) vincula al usuario como admin del gimnasio
      // TODO(backend): hoy se hace en 3 pasos desde el front; conviene un endpoint único.
      const fila = await usuariosApi.obtener(usuario.id);
      await usuariosApi.actualizar(usuario.id, { ...fila, rol: ROL_EN_BD[ROLES.ADMIN], id_gimnasio: gimnasio.id });
      // 4) inicia sesión
      const sesion = await login(correo, password);
      navigate(HOME_POR_ROL[sesion.rol], { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Registrá tu gimnasio" subtitle="Creá el gimnasio y la cuenta de quien lo administra">
      <form className="form" onSubmit={enviar}>
        <p className="auth__legend">Datos del gimnasio</p>
        <div className="form-grid">
          <Input label="Nombre del gimnasio" full required value={datos.nombre_gimnasio} onChange={cambiar('nombre_gimnasio')} />
          <Input label="Dirección" required autoComplete="street-address" value={datos.direccion_gimnasio} onChange={cambiar('direccion_gimnasio')} />
          <Input label="Teléfono" type="tel" autoComplete="tel" value={datos.telefono_gimnasio} onChange={cambiar('telefono_gimnasio')} />
        </div>

        <p className="auth__legend">Cuenta del administrador</p>
        <div className="form-grid">
          <Input label="Nombre" required autoComplete="given-name" value={datos.nombre} onChange={cambiar('nombre')} />
          <Input label="Apellido" required autoComplete="family-name" value={datos.apellido} onChange={cambiar('apellido')} />
          <Input label="Correo electrónico" type="email" required autoComplete="email" value={datos.correo} onChange={cambiar('correo')} />
          <Input label="Contraseña" type="password" required minLength={6} autoComplete="new-password" hint="Mínimo 6 caracteres" value={datos.password} onChange={cambiar('password')} />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <Button type="submit" block loading={enviando}>Registrar gimnasio</Button>
      </form>
      <p className="muted">
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </AuthShell>
  );
}
