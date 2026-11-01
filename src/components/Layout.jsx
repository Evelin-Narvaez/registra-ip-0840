
function Layout({ children }) {
  return (
    <div className="app-container">

      <header className="header">
        <div className="header-logo">
          REGISTRA-IP
        </div>

        <span>
          Registro y verificación de autoría
        </span>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        REGISTRA-IP © 2026 | Sistema de registro
        y verificación de autoría.
      </footer>

    </div>
  );
}

export default Layout;
