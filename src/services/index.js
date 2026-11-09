import { api } from './api';
import { ROL_EN_BD } from '../lib/roles';

const crud = (recurso) => ({
  listar: () => api.get(`/${recurso}`),
  obtener: (id) => api.get(`/${recurso}/${id}`),
  crear: (datos) => api.post(`/${recurso}`, datos),
  actualizar: (id, datos) => api.put(`/${recurso}/${id}`, datos),
  eliminar: (id) => api.delete(`/${recurso}/${id}`),
});

export const clasesApi = crud('clases');
export const usuariosApi = crud('usuarios');
export const productosApi = crud('productos');
export const gimnasiosApi = crud('gimnasio');
export const membresiasApi = crud('membresias');
export const profesoresApi = crud('profesores');
export const pedidosApi = crud('pedidocarrito');
export const detallePedidoApi = crud('detallepedido');

export const reservasApi = {
  ...crud('reservas'),
  cancelar: (id) => api.patch(`/reservas/${id}/cancelar`),
};

export const authApi = {
  login: (correo, password) => api.post('/auth/login', { correo, password }),
  registro: (datos) => api.post('/auth/registro', datos),
};

export const sistemaApi = {
  health: () => api.get('/health'),
};

/**
 * Crea un usuario con contraseña hasheada y datos completos.
 * TODO(backend): POST /usuarios guarda la contraseña sin hashear, así que se crea
 * con /auth/registro (que hashea) y después se completan rol, teléfono y gimnasio.
 */
export async function crearUsuarioCompleto({ nombre, apellido, correo, password, telefono, rol, id_gimnasio }) {
  const { usuario } = await authApi.registro({ nombre, apellido, correo, password });
  const fila = await usuariosApi.obtener(usuario.id);
  await usuariosApi.actualizar(usuario.id, {
    ...fila,
    telefono: telefono || null,
    rol: ROL_EN_BD[rol],
    id_gimnasio: id_gimnasio ?? null,
  });
  return usuario.id;
}
