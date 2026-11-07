import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import { HOME_POR_ROL } from '../../lib/roles';
import { DEMO_USERS } from '../../config/demoUsers';
import { Button, Input } from '../../components/ui';
import AuthShell from './AuthShell';

const DEMO = import.meta.env.DEV ? DEMO_USERS : [];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const sesion = await login(correo, password);
      navigate(location.state?.from?.pathname ?? HOME_POR_ROL[sesion.rol], { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Bienvenido de nuevo" subtitle="Ingresá tus credenciales para continuar">
      <form className="form" onSubmit={enviar}>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button type="submit" block loading={enviando}>Ingresar</Button>
      </form>

      <div className="auth__alt">
        <Link className="btn btn--ghost" to="/registro">Registrarse como usuario</Link>
        <Link className="btn btn--ghost" to="/registrar-gimnasio">Registrar gimnasio</Link>
      </div>

      {DEMO.length > 0 && (
        <>
          <p className="auth__divider">Acceso rápido demo</p>
          <ul className="stack">
            {DEMO.map((d) => (
              <li key={d.correo}>
                <button type="button" className="demo-user" onClick={() => setCorreo(d.correo)}>
                  <span>
                    <span className="demo-user__name">{d.nombre}</span>
                    <span className="demo-user__mail">{d.correo}</span>
                  </span>
                  <span className="demo-user__tag">{d.etiqueta}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </AuthShell>
  );
}
