import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import { authApi } from '../../services';
import { HOME_POR_ROL } from '../../lib/roles';
import { Button, Input } from '../../components/ui';
import AuthShell from './AuthShell';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState({ nombre: '', apellido: '', correo: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    if (datos.password !== datos.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      const { nombre, apellido, correo, password } = datos;
      await authApi.registro({ nombre, apellido, correo, password });
      const sesion = await login(correo, password);
      navigate(HOME_POR_ROL[sesion.rol], { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Creá tu cuenta" subtitle="Unite y empezá a reservar tus clases">
      <form className="form" onSubmit={enviar}>
        <div className="form-grid">
          <Input label="Nombre" required autoComplete="given-name" value={datos.nombre} onChange={cambiar('nombre')} />
          <Input label="Apellido" required autoComplete="family-name" value={datos.apellido} onChange={cambiar('apellido')} />
          <Input label="Correo electrónico" type="email" full required autoComplete="email" placeholder="tu@correo.com" value={datos.correo} onChange={cambiar('correo')} />
          <Input label="Contraseña" type="password" required minLength={6} autoComplete="new-password" hint="Mínimo 6 caracteres" value={datos.password} onChange={cambiar('password')} />
          <Input label="Repetir contraseña" type="password" required autoComplete="new-password" value={datos.confirmar} onChange={cambiar('confirmar')} />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button type="submit" block loading={enviando}>Crear cuenta</Button>
      </form>
      <p className="muted">
        ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
      </p>
    </AuthShell>
  );
}
