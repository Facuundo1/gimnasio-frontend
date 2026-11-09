import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { normalizar } from '../../lib/format';
import { Async, Button, ConfirmDialog, Modal, PageHeader, Table, useToast } from '../ui';
import EntityForm from './EntityForm';

/**
 * Pantalla estándar con tabla + búsqueda + modal de formulario + confirmación de borrado.
 *
 * loader()                       -> datos (referencia estable: definir fuera del componente)
 * getRows(data)                  -> filas a mostrar (pueden venir ya enriquecidas)
 * fields(data)                   -> campos del formulario
 * initialValues(fila|null, data) -> valores iniciales
 * onSubmit(valores, fila|null, data) -> crea o actualiza (lanzar error si falla)
 * onDelete(fila, data)           -> elimina (opcional)
 */
export default function CrudPage({
  title,
  subtitle,
  labels,
  loader,
  getRows,
  rowKey,
  columns,
  fields,
  initialValues,
  onSubmit,
  onDelete,
  searchText,
  searchPlaceholder = 'Buscar…',
  emptyText = 'Todavía no hay registros.',
  deleteMessage,
  extraActions,
}) {
  const state = useFetch(loader);
  const toast = useToast();
  const [edicion, setEdicion] = useState(null); // { fila } — fila null = alta
  const [aBorrar, setABorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const data = state.data;
  const filas = data ? getRows(data) : [];
  const q = normalizar(busqueda);
  const visibles = q && searchText ? filas.filter((f) => normalizar(searchText(f)).includes(q)) : filas;

  const columnas = [
    ...columns,
    {
      key: '_acciones',
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      render: (fila) => (
        <div className="row-actions">
          <Button size="sm" variant="ghost" onClick={() => setEdicion({ fila })}>
            Editar
          </Button>
          {onDelete && (
            <Button size="sm" variant="danger" onClick={() => setABorrar(fila)}>
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ];

  async function guardar(valores) {
    await onSubmit(valores, edicion.fila, data);
    toast.exito(edicion.fila ? 'Cambios guardados' : 'Creado correctamente');
    setEdicion(null);
    state.reload();
  }

  async function confirmarBorrado() {
    setBorrando(true);
    try {
      await onDelete(aBorrar, data);
      toast.exito('Eliminado correctamente');
      setABorrar(null);
      state.reload();
    } catch (err) {
      toast.error(
        err.status === 500
          ? 'No se pudo eliminar: puede tener datos asociados (reservas, membresías, pedidos).'
          : err.message,
      );
    } finally {
      setBorrando(false);
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          data && (
            <>
              {extraActions}
              <Button onClick={() => setEdicion({ fila: null })}>{labels.nuevo}</Button>
            </>
          )
        }
      />

      <Async state={state}>
        {() => (
          <>
            {searchText && (
              <input
                type="search"
                className="input input--search"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            )}
            <Table
              columns={columnas}
              rows={visibles}
              rowKey={rowKey}
              empty={filas.length ? 'Nada coincide con la búsqueda.' : emptyText}
            />
          </>
        )}
      </Async>

      <Modal
        open={!!edicion}
        title={edicion?.fila ? labels.editar : labels.nuevo}
        onClose={() => setEdicion(null)}
      >
        {edicion && (
          <EntityForm
            fields={fields(data)}
            initialValues={initialValues(edicion.fila, data)}
            isEdit={!!edicion.fila}
            onSubmit={guardar}
            onCancel={() => setEdicion(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!aBorrar}
        title={labels.eliminar}
        message={
          aBorrar
            ? (deleteMessage?.(aBorrar) ?? '¿Seguro que querés eliminarlo? Esta acción no se puede deshacer.')
            : ''
        }
        confirmLabel="Eliminar"
        danger
        loading={borrando}
        onConfirm={confirmarBorrado}
        onCancel={() => setABorrar(null)}
      />
    </>
  );
}
