import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import useFormulario from '../../hooks/useFormulario';
import { reglasCorreo, reglasPasswordLogin } from '../../lib/validators';
import { HOME_POR_ROL } from '../../lib/roles';
import { DEMO_USERS } from '../../config/demoUsers';
import { Button, Input } from '../../components/ui';
import AuthShell from './AuthShell';

const DEMO = import.meta.env.DEV ? DEMO_USERS : [];
const REGLAS = { correo: reglasCorreo, password: reglasPasswordLogin };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const f = useFormulario({ correo: '', password: '' }, REGLAS);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    const { valido, primero } = f.validar();
    if (!valido) {
      formRef.current?.elements.namedItem(primero)?.focus();
      return;
    }

    setEnviando(true);
    setError('');
    try {
      const sesion = await login(f.valores.correo.trim(), f.valores.password);
      navigate(location.state?.from?.pathname ?? HOME_POR_ROL[sesion.rol], { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Bienvenido de nuevo" subtitle="Ingresá tus credenciales para continuar">
      <form ref={formRef} className="form" onSubmit={enviar} onChange={() => error && setError('')} noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          maxLength={120}
          required
          {...f.campo('correo')}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          maxLength={72}
          required
          {...f.campo('password')}
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
                <button
                  type="button"
                  className="demo-user"
                  onClick={() => {
                    f.establecer('correo', d.correo);
                    formRef.current?.elements.namedItem('password')?.focus();
                  }}
                >
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
