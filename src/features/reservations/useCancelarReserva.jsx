import { useState } from 'react';
import { ConfirmDialog, useToast } from '../../components/ui';
import { reservasApi } from '../../services';
import { fechaCorta, hora } from '../../lib/format';

/**
 * const { pedirCancelar, dialogo } = useCancelarReserva(recargar);
 * pedirCancelar({ ...reserva, clase }) abre la confirmación; `dialogo` va en el JSX.
 */
export default function useCancelarReserva(alTerminar) {
  const toast = useToast();
  const [reserva, setReserva] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  async function confirmar() {
    setCancelando(true);
    try {
      await reservasApi.cancelar(reserva.id_reserva);
      toast.exito('Reserva cancelada');
      setReserva(null);
      alTerminar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelando(false);
    }
  }

  const clase = reserva?.clase;
  const dialogo = (
    <ConfirmDialog
      open={!!reserva}
      title="Cancelar reserva"
      message={
        clase
          ? `Vas a liberar tu lugar en ${clase.nombre_clase} (${fechaCorta(clase.fecha_clase)}, ${hora(clase.hora_clase)}).`
          : 'Vas a liberar tu lugar en esta clase.'
      }
      confirmLabel="Cancelar reserva"
      cancelLabel="Mantener"
      danger
      loading={cancelando}
      onConfirm={confirmar}
      onCancel={() => setReserva(null)}
    />
  );

  return { pedirCancelar: setReserva, dialogo };
}
