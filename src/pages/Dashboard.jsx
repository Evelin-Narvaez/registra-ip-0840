
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { generarCertificado } from "../utils/generarCertificado";
import "./Dashboard.css";

const API_URL = "http://localhost:4000";

function Dashboard() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [descargandoFolio, setDescargandoFolio] = useState(null);

  // Recuperar usuario y cargar obras desde el backend.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("registraIpUsuario");
      setUsuario(guardado ? JSON.parse(guardado) : null);
    } catch (err) {
      console.error("Error al recuperar el usuario:", err);
      setUsuario(null);
    }

    async function cargarObras() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(`${API_URL}/obras`);

        if (!respuesta.ok) {
          throw new Error("No fue posible consultar las obras.");
        }

        const datos = await respuesta.json();

        setObras(
          Array.isArray(datos)
            ? datos
            : Array.isArray(datos.obras)
              ? datos.obras
              : []
        );
      } catch (err) {
        console.error(err);
        setError(err.message || "Ocurrió un error al cargar las obras.");
      } finally {
        setCargando(false);
      }
    }

    cargarObras();
  }, []);

  // Ordenar las obras de la más reciente a la más antigua.
  const obrasOrdenadas = useMemo(() => {
    return [...obras].sort((a, b) => {
      const fechaA = new Date(a.fechaRegistro || 0).getTime();
      const fechaB = new Date(b.fechaRegistro || 0).getTime();
      return fechaB - fechaA;
    });
  }, [obras]);

  // Obtener las categorías existentes.
  const categorias = useMemo(() => {
    const unicas = [
      ...new Set(obras.map((obra) => obra.categoria).filter(Boolean))
    ];

    return ["Todas", ...unicas.sort((a, b) => a.localeCompare(b, "es"))];
  }, [obras]);

  // Buscar por título, folio, autor o categoría.
  const obrasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return obrasOrdenadas.filter((obra) => {
      const campos = [
        obra.titulo,
        obra.folio,
        obra.autor,
        obra.categoria
      ];

      const coincideBusqueda = campos
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(termino));

      const coincideCategoria =
        categoria === "Todas" || obra.categoria === categoria;

      return coincideBusqueda && coincideCategoria;
    });
  }, [obrasOrdenadas, busqueda, categoria]);

  const totalCategorias = new Set(
    obras.map((obra) => obra.categoria).filter(Boolean)
  ).size;

  // Formatear fechas.
  function formatearFecha(fecha) {
    if (!fecha) return "Fecha no disponible";

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return "Fecha no disponible";
    }

    return valor.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  // Generar certificado PDF.
  async function descargarCertificado(obra) {
    if (!obra?.folio) {
      alert("No se encontró el folio de esta obra.");
      return;
    }

    try {
      setDescargandoFolio(obra.folio);
      await generarCertificado(obra);
    } catch (err) {
      console.error("Error al generar el certificado:", err);
      alert("No fue posible generar el certificado.");
    } finally {
      setDescargandoFolio(null);
    }
  }

  function cerrarSesion() {
    localStorage.removeItem("registraIpUsuario");
    navigate("/");
  }

  function limpiarFiltros() {
    setBusqueda("");
    setCategoria("Todas");
  }

  // Cerrar modal con Escape.
  useEffect(() => {
    function manejarEscape(evento) {
      if (evento.key === "Escape") {
        setObraSeleccionada(null);
      }
    }

    window.addEventListener("keydown", manejarEscape);

    return () => {
      window.removeEventListener("keydown", manejarEscape);
    };
  }, []);

  const inicial = (usuario?.nombre || "C").charAt(0).toUpperCase();

  return (
    <Layout>
      <section className="dashboard-container">

        {/* BARRA LATERAL DEL PERFIL */}
        <aside className="dashboard-profile">

          <div className="profile-top">
            <div className="profile-avatar">{inicial}</div>

            <span className="profile-status">
              <span className="status-dot"></span>
              Cuenta activa
            </span>
          </div>

          <div className="profile-introduction">
            <span className="profile-welcome">Bienvenida a tu espacio</span>
            <h1>{usuario?.nombre || "Creador"}</h1>
            <p>
              Administra tus registros y mantén tus creaciones protegidas.
            </p>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-section-title">MI CUENTA</div>

          <div className="profile-data">
            <span className="profile-data-icon">♙</span>
            <div>
              <span>Nombre completo</span>
              <strong>{usuario?.nombre || "No disponible"}</strong>
            </div>
          </div>

          <div className="profile-data">
            <span className="profile-data-icon">✉</span>
            <div>
              <span>Correo electrónico</span>
              <strong>{usuario?.correo || "No disponible"}</strong>
            </div>
          </div>

          <div className="profile-data">
            <span className="profile-data-icon">✎</span>
            <div>
              <span>Tipo de creador</span>
              <strong>{usuario?.tipo || "No disponible"}</strong>
            </div>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-navigation">
            <button
              type="button"
              className="dashboard-btn dashboard-btn-primary"
              onClick={() => navigate("/registrar-obra")}
            >
              <span>＋</span>
              Registrar nueva obra
            </button>

            <button
              type="button"
              className="dashboard-btn dashboard-btn-secondary"
              onClick={() => navigate("/galeria")}
            >
              <span>▦</span>
              Ver galería completa
            </button>

            <button
              type="button"
              className="dashboard-btn dashboard-btn-logout"
              onClick={cerrarSesion}
            >
              <span>↪</span>
              Cerrar sesión
            </button>
          </div>

          <div className="profile-note">
            <span>✦</span>
            <p>
              REGISTRA-IP
              <small>Tu creatividad, tu autoría.</small>
            </p>
          </div>

        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="dashboard-main">

          {/* ENCABEZADO */}
          <header className="dashboard-heading">
            <div>
              <span className="dashboard-eyebrow">
                REGISTRA-IP / ESPACIO PERSONAL
              </span>

              <h2>Panel de control</h2>

              <p>
                Bienvenida. Aquí puedes administrar tus creaciones y
                consultar tus certificados de registro.
              </p>
            </div>

            <button
              type="button"
              className="heading-register-btn"
              onClick={() => navigate("/registrar-obra")}
            >
              <span>＋</span> Nueva obra
            </button>
          </header>

          {/* TARJETAS DE ESTADÍSTICAS */}
          <section className="dashboard-stats">

            <article className="stat-card stat-blue">
              <div className="stat-icon">▧</div>
              <div className="stat-information">
                <span>Obras registradas</span>
                <strong>{cargando ? "—" : obras.length}</strong>
                <small>Total de creaciones</small>
              </div>
            </article>

            <article className="stat-card stat-green">
              <div className="stat-icon">✓</div>
              <div className="stat-information">
                <span>Certificados disponibles</span>
                <strong>{cargando ? "—" : obras.length}</strong>
                <small>Una descarga por obra</small>
              </div>
            </article>

            <article className="stat-card stat-orange">
              <div className="stat-icon">◇</div>
              <div className="stat-information">
                <span>Categorías utilizadas</span>
                <strong>{cargando ? "—" : totalCategorias}</strong>
                <small>Tipos de creación</small>
              </div>
            </article>

          </section>

          {/* PORTAFOLIO */}
          <section className="recent-works">

            <div className="recent-header">
              <div>
                <span className="dashboard-eyebrow">
                  TU COLECCIÓN PERSONAL
                </span>

                <h2>Mi portafolio</h2>

                <p>
                  Consulta, busca y administra todas tus obras registradas.
                </p>
              </div>

              <button
                type="button"
                className="view-all-btn"
                onClick={() => navigate("/galeria")}
              >
                Explorar galería <span>→</span>
              </button>
            </div>

            {/* BÚSQUEDA Y FILTROS */}
            <div className="portfolio-filters">

              <label className="portfolio-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Buscar por título, folio, autor o categoría..."
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  aria-label="Buscar obras"
                />
              </label>

              <label className="portfolio-category">
                <span className="filter-label">Categoría</span>
                <select
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                  aria-label="Filtrar por categoría"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "Todas" ? "Todas las categorías" : cat}
                    </option>
                  ))}
                </select>
              </label>

            </div>

            <div className="portfolio-results">
              <span>
                {cargando
                  ? "Consultando colección..."
                  : `${obrasFiltradas.length} ${
                      obrasFiltradas.length === 1 ? "obra encontrada" : "obras encontradas"
                    }`}
              </span>

              {(busqueda || categoria !== "Todas") && (
                <button type="button" onClick={limpiarFiltros}>
                  Limpiar filtros ×
                </button>
              )}
            </div>

            {/* CARGANDO */}
            {cargando && (
              <div className="dashboard-message" role="status">
                <span className="loading-spinner"></span>
                <strong>Cargando tu colección</strong>
                <p>Estamos preparando tus obras registradas.</p>
              </div>
            )}

            {/* ERROR */}
            {!cargando && error && (
              <div className="dashboard-error" role="alert">
                <span>!</span>
                <h3>No pudimos cargar tus obras</h3>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            {/* SIN OBRAS */}
            {!cargando && !error && obras.length === 0 && (
              <div className="dashboard-empty">
                <span className="empty-icon">▧</span>
                <h3>Tu portafolio está vacío</h3>
                <p>
                  Registra tu primera creación para comenzar a construir
                  tu colección personal.
                </p>
                <button
                  type="button"
                  className="dashboard-btn dashboard-btn-primary"
                  onClick={() => navigate("/registrar-obra")}
                >
                  ＋ Registrar mi primera obra
                </button>
              </div>
            )}

            {/* SIN RESULTADOS */}
            {!cargando && !error && obras.length > 0 && obrasFiltradas.length === 0 && (
              <div className="dashboard-empty">
                <span className="empty-icon">⌕</span>
                <h3>No encontramos coincidencias</h3>
                <p>
                  Intenta cambiar las palabras de búsqueda o la categoría.
                </p>
                <button
                  type="button"
                  className="dashboard-btn dashboard-btn-secondary"
                  onClick={limpiarFiltros}
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}

            {/* TARJETAS DE OBRAS */}
            {!cargando && !error && obrasFiltradas.length > 0 && (
              <div className="recent-grid">

                {obrasFiltradas.map((obra) => (
                  <article
                    className="recent-card"
                    key={obra.folio || obra.id}
                  >

                    <div className="recent-image">
                      {obra.archivo ? (
                        <img
                          src={`${API_URL}/uploads/${encodeURIComponent(obra.archivo)}`}
                          alt={`Imagen de ${obra.titulo || "la obra"}`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="recent-image-placeholder">
                          <span>▧</span>
                          <small>Sin imagen disponible</small>
                        </div>
                      )}

                      <span className="image-category">
                        {obra.categoria || "Sin categoría"}
                      </span>
                    </div>

                    <div className="recent-content">

                      <span className="category-badge">
                        {obra.categoria || "Sin categoría"}
                      </span>

                      <h3>{obra.titulo || "Obra sin título"}</h3>

                      <p className="recent-author">
                        {obra.autor || usuario?.nombre || "Autor no disponible"}
                      </p>

                      <p className="recent-folio">
                        Folio <strong>{obra.folio || "No disponible"}</strong>
                      </p>

                      <p className="recent-date">
                        <span>▢</span>
                        {formatearFecha(obra.fechaRegistro)}
                      </p>

                      <div className="recent-actions">
                        <button
                          type="button"
                          className="recent-detail-btn"
                          onClick={() => setObraSeleccionada(obra)}
                        >
                          Ver detalles
                        </button>

                        <button
                          type="button"
                          className="recent-certificate-btn"
                          disabled={descargandoFolio === obra.folio}
                          onClick={() => descargarCertificado(obra)}
                        >
                          {descargandoFolio === obra.folio
                            ? "Generando PDF..."
                            : "↓ Descargar certificado"}
                        </button>
                      </div>

                    </div>
                  </article>
                ))}

              </div>
            )}

          </section>

          {/* PIE DEL PANEL */}
          <footer className="dashboard-footer">
            <strong>REGISTRA-IP</strong>
            <span>Sistema de registro y verificación de autoría.</span>
          </footer>

        </main>
      </section>

      {/* MODAL DE DETALLES */}
      {obraSeleccionada && (
        <div
          className="detail-overlay"
          onClick={() => setObraSeleccionada(null)}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(evento) => evento.stopPropagation()}
          >

            <button
              type="button"
              className="detail-close"
              onClick={() => setObraSeleccionada(null)}
              aria-label="Cerrar detalles"
            >
              ×
            </button>

            <div className="detail-modal-heading">
              <span className="dashboard-eyebrow">
                INFORMACIÓN DEL REGISTRO
              </span>
              <span className="detail-folio">
                {obraSeleccionada.folio}
              </span>
            </div>

            <h2 id="detail-title">
              {obraSeleccionada.titulo || "Obra sin título"}
            </h2>

            {obraSeleccionada.archivo && (
              <div className="detail-image-container">
                <img
                  className="detail-image"
                  src={`${API_URL}/uploads/${encodeURIComponent(obraSeleccionada.archivo)}`}
                  alt={`Vista previa de ${obraSeleccionada.titulo || "la obra"}`}
                />
              </div>
            )}

            <div className="detail-information">

              <div>
                <span>Autor</span>
                <strong>
                  {obraSeleccionada.autor || usuario?.nombre || "No disponible"}
                </strong>
              </div>

              <div>
                <span>Categoría</span>
                <strong>
                  {obraSeleccionada.categoria || "Sin categoría"}
                </strong>
              </div>

              <div>
                <span>Fecha de registro</span>
                <strong>{formatearFecha(obraSeleccionada.fechaRegistro)}</strong>
              </div>

              <div>
                <span>Folio de registro</span>
                <strong>{obraSeleccionada.folio || "No disponible"}</strong>
              </div>

              <div className="detail-description">
                <span>Descripción de la obra</span>
                <p>
                  {obraSeleccionada.descripcion || "Sin descripción disponible."}
                </p>
              </div>

              {obraSeleccionada.archivoOriginal && (
                <div className="detail-description">
                  <span>Archivo original</span>
                  <p>{obraSeleccionada.archivoOriginal}</p>
                </div>
              )}

            </div>

            <div className="detail-modal-actions">
              <button
                type="button"
                className="recent-detail-btn"
                onClick={() => setObraSeleccionada(null)}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="recent-certificate-btn"
                disabled={descargandoFolio === obraSeleccionada.folio}
                onClick={() => descargarCertificado(obraSeleccionada)}
              >
                {descargandoFolio === obraSeleccionada.folio
                  ? "Generando PDF..."
                  : "↓ Descargar certificado PDF"}
              </button>
            </div>

          </section>
        </div>
      )}

    </Layout>
  );
}

export default Dashboard;
