import { useEffect, useRef } from 'react';

// Usa <dialog>: el navegador se encarga del foco y de cerrar con Escape.
export default function Modal({ open, title, onClose, size = 'md', children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal--${size}`}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label={title}
    >
      {open && (
        <div className="modal__box">
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </div>
          <div className="modal__body">{children}</div>
        </div>
      )}
    </dialog>
  );
}
