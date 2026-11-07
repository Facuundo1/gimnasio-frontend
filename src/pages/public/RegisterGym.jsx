import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../features/auth/useAuth';
import useFormulario from '../../hooks/useFormulario';
import {
  reglasCorreo, reglasDireccion, reglasNombre, reglasNombreGimnasio, reglasPasswordNueva, reglasTelefonoOpcional,
} from '../../lib/validators';
import { authApi, gimnasiosApi, usuariosApi } from '../../services';
import { HOME_POR_ROL, ROL_EN_BD, ROLES } from '../../lib/roles';
import { Button, Input } from '../../components/ui';
import AuthShell from './AuthShell';

const INICIAL = {
  nombre_gimnasio: '', direccion_gimnasio: '', telefono_gimnasio: '',
  nombre: '', apellido: '', correo: '', password: '',
};
const REGLAS = {
  nombre_gimnasio: reglasNombreGimnasio,
  direccion_gimnasio: reglasDireccion,
  telefono_gimnasio: reglasTelefonoOpcional,
  nombre: reglasNombre('nombre'),
  apellido: reglasNombre('apellido'),
  correo: reglasCorreo,
  password: reglasPasswordNueva,
};

export default function RegisterGym() {
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
      const v = f.valores;
      const correo = v.correo.trim();
      // 1) cuenta del administrador (si el correo ya existe, falla antes de crear el gimnasio)
      const { usuario } = await authApi.registro({
        nombre: v.nombre.trim(), apellido: v.apellido.trim(), correo, password: v.password,
      });
      // 2) gimnasio
      const gimnasio = await gimnasiosApi.crear({
        nombre_gimnasio: v.nombre_gimnasio.trim(),
        direccion_gimnasio: v.direccion_gimnasio.trim(),
        telefono_gimnasio: v.telefono_gimnasio.trim() || null,
      });
      // 3) vincula al usuario como admin del gimnasio
      // TODO(backend): hoy se hace en 3 pasos desde el front; conviene un endpoint único.
      const fila = await usuariosApi.obtener(usuario.id);
      await usuariosApi.actualizar(usuario.id, { ...fila, rol: ROL_EN_BD[ROLES.ADMIN], id_gimnasio: gimnasio.id });
      // 4) inicia sesión
      const sesion = await login(correo, v.password);
      navigate(HOME_POR_ROL[sesion.rol], { replace: true });
    } catch (err) {
      if (err.status === 409) {
        f.marcarError('correo', err.message);
        enfocar('correo');
      } else {
        setError(err.message);
      }
      setEnviando(false);
    }
  }

  return (
    <AuthShell title="Registrá tu gimnasio" subtitle="Creá el gimnasio y la cuenta de quien lo administra">
      <form ref={formRef} className="form" onSubmit={enviar} onChange={() => error && setError('')} noValidate>
        <p className="auth__legend">Datos del gimnasio</p>
        <div className="form-grid">
          <Input label="Nombre del gimnasio" full required maxLength={80} {...f.campo('nombre_gimnasio')} />
          <Input label="Dirección" required autoComplete="street-address" maxLength={150} {...f.campo('direccion_gimnasio')} />
          <Input label="Teléfono (opcional)" type="tel" autoComplete="tel" maxLength={20} {...f.campo('telefono_gimnasio')} />
        </div>

        <p className="auth__legend">Cuenta del administrador</p>
        <div className="form-grid">
          <Input label="Nombre" required autoComplete="given-name" maxLength={60} {...f.campo('nombre')} />
          <Input label="Apellido" required autoComplete="family-name" maxLength={60} {...f.campo('apellido')} />
          <Input label="Correo electrónico" type="email" required autoComplete="email" maxLength={120} {...f.campo('correo')} />
          <Input
            label="Contraseña"
            type="password"
            required
            autoComplete="new-password"
            maxLength={72}
            hint="Mínimo 6 caracteres, con letras y números"
            {...f.campo('password')}
          />
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
