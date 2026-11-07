import { useState } from 'react';
import useAuth from '../../features/auth/useAuth';
import useFetch from '../../hooks/useFetch';
import { membresiasApi } from '../../services';
import {
  PLANES, asignarPlan, membresiaVigente, planPorNombre, ultimaMembresia,
} from '../../features/memberships/planes';
import { moneda } from '../../lib/format';
import { Async, Button, Card, ConfirmDialog, PageHeader, useToast } from '../../components/ui';

const cargar = () => membresiasApi.listar();

function Planes({ membresias, usuario, recargar }) {
  const toast = useToast();
  const [elegido, setElegido] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const vigente = membresiaVigente(membresias, usuario.id);
  const actual = vigente ? planPorNombre(vigente.tipo_membresia) : null;

  async function contratar() {
    setGuardando(true);
    try {
      await asignarPlan({
        idUsuario: usuario.id,
        plan: elegido,
        existente: ultimaMembresia(membresias, usuario.id),
      });
      toast.exito(`Ahora tenés el plan ${elegido.id}`);
      setElegido(null);
      recargar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="plan-grid">
        {PLANES.map((plan) => {
          const esActual = actual?.id === plan.id;
          return (
            <Card key={plan.id} as="article" highlight={plan.popular} className="plan">
              {plan.popular && <span className="plan__tag">POPULAR</span>}
              <h2 className="plan__name">{plan.id}</h2>
              <p className="muted">{plan.lema}</p>
              <p className="plan__price">
                {plan.precio === 0 ? (
                  'Gratis'
                ) : (
                  <>
                    <span className="plan__currency">$</span>
                    {plan.precio.toLocaleString('es-AR')}
                    <span className="plan__period">/mes</span>
                  </>
                )}
              </p>
              <ul className="plan__features">
                {plan.beneficios.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Button
                variant={esActual ? 'ghost' : 'outline'}
                block
                disabled={esActual}
                onClick={() => setElegido(plan)}
              >
                {esActual ? 'Plan actual' : 'Contratar'}
              </Button>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!elegido}
        title={elegido ? `Plan ${elegido.id}` : ''}
        message={
          elegido
            ? elegido.precio === 0
              ? 'Vas a pasar al plan gratuito.'
              : `Vas a pasar al plan ${elegido.id} por ${moneda(elegido.precio)} al mes.`
            : ''
        }
        confirmLabel="Confirmar"
        loading={guardando}
        onConfirm={contratar}
        onCancel={() => setElegido(null)}
      />
    </>
  );
}

export default function UserMembership() {
  const { usuario } = useAuth();
  const state = useFetch(cargar);

  return (
    <>
      <PageHeader title="Planes y membresías" subtitle="Elegí el plan que mejor se adapte a tus objetivos" />
      <Async state={state}>
        {(membresias) => <Planes membresias={membresias} usuario={usuario} recargar={state.reload} />}
      </Async>
    </>
  );
}
