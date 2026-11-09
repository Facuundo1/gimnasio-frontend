import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import useFormulario from '../../hooks/useFormulario';
import {
  reglasConfirmar, reglasCorreo, reglasNombre, reglasPasswordNueva,
} from '../../lib/validators';
import { authApi } from '../../services';
import { HOME_POR_ROL } from '../../lib/roles';
import { Button, Input } from '../../components/ui';
import AuthShell from './AuthShell';

const INICIAL = { nombre: '', apellido: '', correo: '', password: '', confirmar: '' };
const REGLAS = {
  nombre: reglasNombre('nombre'),
  apellido: reglasNombre('apellido'),
  correo: reglasCorreo,
  password: reglasPasswordNueva,
  confirmar: reglasConfirmar,
};

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const f = useFormulario(INICIAL, REGLAS);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enfocar = (nombre) => formRef.current?.elements.namedItem(nombre)?.focus();

  async function enviar(e) {
    e.preventDefault();
    const { valido, primero } = f.validar();
    if (!valido) {
      enfocar(primero);
      return;
    }

    setEnviando(true);
    setError('');
    try {
      const { nombre, apellido, correo, password } = f.valores;
      await authApi.registro({ nombre: nombre.trim(), apellido: apellido.trim(), correo: correo.trim(), password });
      const sesion = await login(correo.trim(), password);
      navigate(HOME_POR_ROL[sesion.rol], { replace: true });
    } catch (err) {
      if (err.status === 409) {
        f.marcarError('correo', err.message); // "Ya existe una cuenta con ese correo"
        enfocar('correo');
      } else {
        setError(err.message);
      }
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Creá tu cuenta" subtitle="Unite y empezá a reservar tus clases">
      <form ref={formRef} className="form" onSubmit={enviar} onChange={() => error && setError('')} noValidate>
        <div className="form-grid">
          <Input label="Nombre" required autoComplete="given-name" maxLength={60} {...f.campo('nombre')} />
          <Input label="Apellido" required autoComplete="family-name" maxLength={60} {...f.campo('apellido')} />
          <Input
            label="Correo electrónico"
            type="email"
            full
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            maxLength={120}
            {...f.campo('correo')}
          />
          <Input
            label="Contraseña"
            type="password"
            required
            autoComplete="new-password"
            maxLength={72}
            hint="Mínimo 6 caracteres, con letras y números"
            {...f.campo('password')}
          />
          <Input
            label="Repetir contraseña"
            type="password"
            required
            autoComplete="new-password"
            maxLength={72}
            {...f.campo('confirmar')}
          />
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
