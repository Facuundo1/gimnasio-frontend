import { Badge, Button } from '../../components/ui';
import { fechaCorta, hora } from '../../lib/format';
import { estadoVisual } from './reservas';

const ESTADOS = {
  activa: { tone: 'success', texto: 'Confirmada' },
  completada: { tone: 'neutral', texto: 'Completada' },
  cancelada: { tone: 'danger', texto: 'Cancelada' },
};

// `reserva` debe traer `clase` (ver unirReservas)
export default function ReservaItem({ reserva, onCancelar, grande = false }) {
  const { clase } = reserva;
  const estado = estadoVisual(reserva);
  const { tone, texto } = ESTADOS[estado];

  return (
    <li className="row-item">
      <span className={`time-chip${grande ? ' time-chip--lg' : ''}`}>{hora(clase?.hora_clase) || '--:--'}</span>
      <div className="row-item__main">
        <p className="row-item__title">{clase?.nombre_clase ?? 'Clase eliminada'}</p>
        <p className="row-item__sub">{clase ? fechaCorta(clase.fecha_clase) : ''}</p>
      </div>
      <div className="row-item__side">
        <Badge tone={tone}>{texto}</Badge>
        {estado === 'activa' && onCancelar && (
          <Button variant="ghost" size="sm" onClick={() => onCancelar(reserva)}>
            Cancelar{grande ? ' reserva' : ''}
          </Button>
        )}
      </div>
    </li>
  );
}
