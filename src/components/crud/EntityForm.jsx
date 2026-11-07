import { useState } from 'react';
import { Button, Input, Select } from '../ui';

/**
 * fields: [{ name, label, type?, required?, options?, placeholder?, hint?, full?, min?, step?, soloAlCrear?, minLength? }]
 * type 'select' usa `options: [{ value, label }]`.
 */
export default function EntityForm({ fields, initialValues, isEdit, onSubmit, onCancel }) {
  const [valores, setValores] = useState(initialValues);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const visibles = fields.filter((f) => !(isEdit && f.soloAlCrear));
  const cambiar = (name) => (e) => setValores((v) => ({ ...v, [name]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await onSubmit(valores);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="form">
      <div className="form-grid">
        {visibles.map((f) =>
          f.type === 'select' ? (
            <Select
              key={f.name}
              label={f.label}
              required={f.required}
              full={f.full}
              hint={f.hint}
              value={valores[f.name] ?? ''}
              onChange={cambiar(f.name)}
            >
              <option value="">{f.placeholder ?? 'Seleccioná una opción'}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              key={f.name}
              label={f.label}
              type={f.type ?? 'text'}
              required={f.required}
              full={f.full}
              hint={f.hint}
              placeholder={f.placeholder}
              min={f.min}
              minLength={f.minLength}
              step={f.step}
              autoComplete={f.type === 'password' ? 'new-password' : 'off'}
              value={valores[f.name] ?? ''}
              onChange={cambiar(f.name)}
            />
          ),
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="modal__actions">
        <Button variant="ghost" onClick={onCancel} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" loading={enviando}>
          {isEdit ? 'Guardar cambios' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
