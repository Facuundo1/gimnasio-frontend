import { Link } from 'react-router-dom';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth">
      <section className="auth__hero">
        <span className="brand">IRON PEAK</span>
        <div>
          <h2 className="auth__headline">
            <span>Cada</span>
            <em>Rep</em>
            <span>Cuenta.</span>
          </h2>
          <p className="auth__lead">
            Gestioná tus entrenamientos, reservá clases y alcanzá tus metas con nuestra plataforma integral de fitness.
          </p>
        </div>
        <dl className="auth__metrics">
          <div className="auth__metric"><strong>12K+</strong><span>Miembros</span></div>
          <div className="auth__metric"><strong>48</strong><span>Clases/sem</span></div>
          <div className="auth__metric"><strong>98%</strong><span>Satisfacción</span></div>
        </dl>
      </section>

      <main className="auth__panel">
        <div className="auth__form">
          <Link to="/login" className="brand auth__mobile-brand">IRON PEAK</Link>
          <div>
            <h1 className="auth__title">{title}</h1>
            {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
