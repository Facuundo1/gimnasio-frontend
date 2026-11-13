import { useEffect, useState } from 'react';
import useAuth from '../../features/auth/useAuth';

// Si tu login guarda el token con otro nombre, cambialo acá
const TOKEN_KEY = 'token';

const VACIO = {
  id_usuarios: null,
  nombre_usuarios: '',
  apellido_usuarios: '',
  correo_usuarios: '',
  telefono: '',
  contrasenia_usuarios: '',
  rol: 'usuario',
};

async function api(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

// Misma validación que el backend, para avisar antes de enviar
function validar(f, creando) {
  const e = {};
  if (!f.nombre_usuarios.trim()) e.nombre_usuarios = 'El nombre es obligatorio';
  if (!f.apellido_usuarios.trim()) e.apellido_usuarios = 'El apellido es obligatorio';
  if (!f.correo_usuarios.trim()) e.correo_usuarios = 'El correo es obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo_usuarios.trim()))
    e.correo_usuarios = 'El correo no es válido';
  if (creando && !f.contrasenia_usuarios) e.contrasenia_usuarios = 'La contraseña es obligatoria';
  else if (f.contrasenia_usuarios && f.contrasenia_usuarios.length < 6)
    e.contrasenia_usuarios = 'Mínimo 6 caracteres';
  if (f.telefono && !/^[0-9+()\s-]{6,20}$/.test(f.telefono))
    e.telefono = 'Teléfono no válido';
  return e;
}

export default function AdminUsuarios() {
  const { usuario: yo } = useAuth();
  const esSuper = yo.rol === 'superadmin';

  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const editando = form.id_usuarios !== null;

  const cargar = async () => {
    try {
      setLista(await api('/api/usuarios'));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    const errs = validar(form, !editando);
    setErrores(errs);
    if (Object.keys(errs).length) return;

    const body = {
      nombre_usuarios: form.nombre_usuarios.trim(),
      apellido_usuarios: form.apellido_usuarios.trim(),
      correo_usuarios: form.correo_usuarios.trim(),
      telefono: form.telefono.trim(),
    };
    if (form.contrasenia_usuarios) body.contrasenia_usuarios = form.contrasenia_usuarios;
    if (esSuper) body.rol = form.rol; // el backend ignora el rol si no sos superadmin

    setGuardando(true);
    try {
      await api(editando ? `/api/usuarios/${form.id_usuarios}` : '/api/usuarios', {
        method: editando ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      setMensaje(editando ? 'Usuario modificado correctamente' : 'Usuario creado correctamente');
      setForm(VACIO);
      setErrores({});
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const editar = (u) => {
    setForm({
      id_usuarios: u.id_usuarios,
      nombre_usuarios: u.nombre_usuarios ?? '',
      apellido_usuarios: u.apellido_usuarios ?? '',
      correo_usuarios: u.correo_usuarios ?? '',
      telefono: u.telefono ?? '',
      contrasenia_usuarios: '',
      rol: u.rol,
    });
    setErrores({});
    setMensaje('');
    setError('');
  };

  const eliminar = async (u) => {
    if (!window.confirm(
      `¿Eliminar a ${u.nombre_usuarios} ${u.apellido_usuarios}? Se borran también sus reservas, membresías y pedidos.`
    )) return;
    setMensaje('');
    setError('');
    try {
      await api(`/api/usuarios/${u.id_usuarios}`, { method: 'DELETE' });
      setMensaje('Usuario eliminado correctamente');
      if (form.id_usuarios === u.id_usuarios) setForm(VACIO);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  // El admin solo gestiona socios; el superadmin, todos
  const puedeGestionar = (u) => esSuper || u.rol === 'usuario';
  const q = busqueda.trim().toLowerCase();
  const visibles = q
    ? lista.filter((u) =>
        `${u.nombre_usuarios} ${u.apellido_usuarios} ${u.correo_usuarios}`.toLowerCase().includes(q))
    : lista;

  return (
    <section>
      <h1>Usuarios</h1>

      <form onSubmit={guardar} noValidate>
        <h2>{editando ? `Editando usuario #${form.id_usuarios}` : 'Nuevo usuario'}</h2>

        <label>
          Nombre
          <input className="input" value={form.nombre_usuarios} onChange={cambiar('nombre_usuarios')} />
          {errores.nombre_usuarios && <small role="alert">{errores.nombre_usuarios}</small>}
        </label>

        <label>
          Apellido
          <input className="input" value={form.apellido_usuarios} onChange={cambiar('apellido_usuarios')} />
          {errores.apellido_usuarios && <small role="alert">{errores.apellido_usuarios}</small>}
        </label>

        <label>
          Correo
          <input className="input" type="email" value={form.correo_usuarios}
                 onChange={cambiar('correo_usuarios')} />
          {errores.correo_usuarios && <small role="alert">{errores.correo_usuarios}</small>}
        </label>

        <label>
          Teléfono (opcional)
          <input className="input" value={form.telefono} onChange={cambiar('telefono')} />
          {errores.telefono && <small role="alert">{errores.telefono}</small>}
        </label>

        <label>
          {editando ? 'Contraseña nueva (dejala vacía para no cambiarla)' : 'Contraseña'}
          <input className="input" type="password" autoComplete="new-password"
                 value={form.contrasenia_usuarios} onChange={cambiar('contrasenia_usuarios')} />
          {errores.contrasenia_usuarios && <small role="alert">{errores.contrasenia_usuarios}</small>}
        </label>

        {esSuper ? (
          <label>
            Rol
            <select className="input" value={form.rol} onChange={cambiar('rol')}>
              <option value="usuario">Usuario</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </label>
        ) : (
          <p>Rol: usuario (socio)</p>
        )}

        {error && <p role="alert">{error}</p>}
        {mensaje && <p role="status">{mensaje}</p>}

        <button className="btn btn--primary" type="submit" disabled={guardando}>
          {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
        </button>
        {editando && (
          <button type="button" className="btn"
                  onClick={() => { setForm(VACIO); setErrores({}); }}>
            Cancelar edición
          </button>
        )}
      </form>

      <h2>Usuarios existentes</h2>
      <input type="search" className="input" placeholder="Buscar por nombre o correo…"
             aria-label="Buscar usuario" value={busqueda}
             onChange={(e) => setBusqueda(e.target.value)} />

      {cargando ? (
        <p>Cargando usuarios...</p>
      ) : visibles.length === 0 ? (
        <p>No hay usuarios para mostrar.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {visibles.map((u) => (
              <tr key={u.id_usuarios}>
                <td>{u.nombre_usuarios} {u.apellido_usuarios}</td>
                <td>{u.correo_usuarios}</td>
                <td>{u.telefono ?? '—'}</td>
                <td>{u.rol}</td>
                <td>
                  <button className="btn" disabled={!puedeGestionar(u)} onClick={() => editar(u)}>
                    Modificar
                  </button>
                  <button className="btn"
                          disabled={!puedeGestionar(u) || u.id_usuarios === yo.id}
                          onClick={() => eliminar(u)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}