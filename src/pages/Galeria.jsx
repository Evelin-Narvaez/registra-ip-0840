
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { generarCertificado } from "../utils/generarCertificado";
import "./Galeria.css";

const API_URL = "http://localhost:4000";

const CATEGORIAS = [
  "Todas",
  "Diseño",
  "Fotografía",
  "Escritura",
  "Cine",
];

// Normalizar categorías anteriores sin modificar los datos originales.
function normalizarCategoria(categoria) {
  const equivalencias = {
    "Artes visuales": "Diseño",
    "Literatura": "Escritura",
    "Audiovisual": "Cine",
  };

  return equivalencias[categoria] || categoria || "Sin categoría";
}

// Identificar el tipo de archivo.
function obtenerTipoArchivo(nombre = "") {
  const extension = nombre.split(".").pop().toLowerCase();

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {
    return "imagen";
  }

  if (extension === "pdf") return "pdf";

  if (["mp4", "mov", "avi", "webm"].includes(extension)) {
    return "video";
  }

  return "archivo";
}

// Formatear fechas.
function mostrarFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return "Fecha no disponible";
  }

  return fechaValida.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function Galeria() {
  const navigate = useNavigate();

  const [obras, setObras] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("recientes");
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [descargandoFolio, setDescargandoFolio] = useState(null);

  // =========================================
  // CARGAR OBRAS DESDE EL BACKEND
  // =========================================

  useEffect(() => {
    let componenteActivo = true;

    async function cargarObras() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(`${API_URL}/obras`);

        if (!respuesta.ok) {
          throw new Error("No fue posible consultar las obras registradas.");
        }

        const datos = await respuesta.json();

        const listaObras = Array.isArray(datos)
          ? datos
          : Array.isArray(datos.obras)
            ? datos.obras
            : [];

        if (componenteActivo) {
          setObras(listaObras);
        }
      } catch (err) {
        console.error("Error al cargar las obras:", err);

        if (componenteActivo) {
          setError(
            err.message || "Ocurrió un error al consultar las obras."
          );
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarObras();

    return () => {
      componenteActivo = false;
    };
  }, []);

  // =========================================
  // ESTADÍSTICAS DE LA COLECCIÓN
  // =========================================

  // Total de obras registradas en el backend.
  const totalObras = obras.length;

  // Número de categorías diferentes.
  const totalCategorias = new Set(
    obras
      .map((obra) => normalizarCategoria(obra.categoria))
      .filter((item) => item !== "Sin categoría")
  ).size;

  // Cantidad de obras que coinciden con los filtros.
  const totalResultados = useMemo(() => {
    return obras.filter((obra) => {
      const termino = busqueda.trim().toLowerCase();

      const campos = [
        obra.titulo,
        obra.autor,
        obra.folio,
        obra.categoria,
      ];

      const coincideTexto = campos
        .filter(Boolean)
        .some((campo) =>
          String(campo).toLowerCase().includes(termino)
        );

      const coincideCategoria =
        categoria === "Todas" ||
        normalizarCategoria(obra.categoria) === categoria;

      return coincideTexto && coincideCategoria;
    }).length;
  }, [obras, busqueda, categoria]);

  // =========================================
  // BÚSQUEDA, FILTROS Y ORDENAMIENTO
  // =========================================

  const obrasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return [...obras]
      .filter((obra) => {
        const campos = [
          obra.titulo,
          obra.autor,
          obra.folio,
          obra.categoria,
        ];

        const coincideTexto = campos
          .filter(Boolean)
          .some((campo) =>
            String(campo).toLowerCase().includes(termino)
          );

        const coincideCategoria =
          categoria === "Todas" ||
          normalizarCategoria(obra.categoria) === categoria;

        return coincideTexto && coincideCategoria;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fechaRegistro || 0).getTime();
        const fechaB = new Date(b.fechaRegistro || 0).getTime();

        return orden === "recientes"
          ? fechaB - fechaA
          : fechaA - fechaB;
      });
  }, [obras, busqueda, categoria, orden]);

  // =========================================
  // CERRAR MODAL CON ESCAPE
  // =========================================

  useEffect(() => {
    function manejarEscape(evento) {
      if (evento.key === "Escape") {
        setSeleccionada(null);
      }
    }

    window.addEventListener("keydown", manejarEscape);

    return () => {
      window.removeEventListener("keydown", manejarEscape);
    };
  }, []);

  // =========================================
  // ACCIONES
  // =========================================

  function cerrarSesion() {
    localStorage.removeItem("registraIpUsuario");
    navigate("/");
  }

  function limpiarFiltros() {
    setBusqueda("");
    setCategoria("Todas");
    setOrden("recientes");
  }

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

  // =========================================
  // INTERFAZ
  // =========================================

  return (
    <Layout>
      <main className="galeria-container">

        {/* ENCABEZADO */}
        <header className="galeria-header">
          <div className="galeria-header-texto">

            <div className="galeria-migas">
              <span>REGISTRA-IP</span>
              <span>/</span>
              <span>COLECCIÓN</span>
            </div>

            <span className="galeria-etiqueta">
              PORTAFOLIO DIGITAL
            </span>

            <h1>Galería de obras</h1>

            <p>
              Explora, organiza y consulta todas tus creaciones
              registradas en REGISTRA-IP.
            </p>

          </div>

          <div className="galeria-acciones">

            <button
              type="button"
              className="galeria-btn-secundario"
              onClick={() => navigate("/dashboard")}
            >
              <span>←</span> Panel
            </button>

            <button
              type="button"
              className="galeria-btn-salir"
              onClick={cerrarSesion}
            >
              <span>↪</span> Cerrar sesión
            </button>

          </div>
        </header>

        {/* =====================================
            TARJETAS DE ESTADÍSTICAS
        ===================================== */}

        <section className="galeria-estadisticas">

          <article className="galeria-stat">
            <div className="galeria-stat-icon azul">
              ▧
            </div>

            <div>
              <span>Obras registradas</span>

              <strong>
                {totalObras}
              </strong>

              <small>Total de creaciones</small>
            </div>
          </article>

          <article className="galeria-stat">
            <div className="galeria-stat-icon verde">
              ✓
            </div>

            <div>
              <span>Resultados actuales</span>

              <strong>
                {cargando ? "..." : totalResultados}
              </strong>

              <small>Obras que coinciden con los filtros</small>
            </div>
          </article>

          <article className="galeria-stat">
            <div className="galeria-stat-icon naranja">
              ◇
            </div>

            <div>
              <span>Categorías utilizadas</span>

              <strong>
                {totalCategorias}
              </strong>

              <small>Tipos de creación registrados</small>
            </div>
          </article>

        </section>

        {/* =====================================
            PANEL DE BÚSQUEDA Y FILTROS
        ===================================== */}

        <section className="galeria-panel-filtros">

          <div className="galeria-panel-titulo">

            <div>
              <span className="galeria-etiqueta">
                EXPLORAR COLECCIÓN
              </span>

              <h2>Encuentra una obra</h2>

              <p>
                Utiliza la búsqueda y los filtros para localizar tus registros.
              </p>
            </div>

          </div>

          <div className="galeria-filtros-principales">

            {/* BUSCADOR */}
            <label className="galeria-busqueda">

              <span className="galeria-icono-busqueda">
                ⌕
              </span>

              <input
                type="search"
                placeholder="Buscar por título, autor, folio o categoría..."
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                aria-label="Buscar obras"
              />

              {busqueda && (
                <button
                  type="button"
                  className="galeria-limpiar-busqueda"
                  onClick={() => setBusqueda("")}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}

            </label>

            {/* ORDENAR */}
            <div className="galeria-orden">

              <label htmlFor="orden-obras">
                Ordenar por fecha
              </label>

              <select
                id="orden-obras"
                value={orden}
                onChange={(evento) => setOrden(evento.target.value)}
              >
                <option value="recientes">
                  Más recientes
                </option>

                <option value="antiguas">
                  Más antiguas
                </option>
              </select>

            </div>

          </div>

          {/* CATEGORÍAS */}
          <div className="galeria-categorias">

            <span className="galeria-filtro-label">
              Categorías
            </span>

            <div className="galeria-botones-categoria">

              {CATEGORIAS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={categoria === item ? "activo" : ""}
                  onClick={() => setCategoria(item)}
                  aria-pressed={categoria === item}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

        </section>

        {/* =====================================
            RESULTADOS DE LA COLECCIÓN
        ===================================== */}

        <div className="galeria-resultados">

          <div>
            <h2>Mi colección</h2>

            <p>
              {cargando
                ? "Consultando registros..."
                : `${totalResultados} ${
                    totalResultados === 1
                      ? "obra encontrada"
                      : "obras encontradas"
                  }`}
            </p>
          </div>

          {(busqueda || categoria !== "Todas" || orden !== "recientes") && (
            <button
              type="button"
              className="galeria-limpiar-filtros"
              onClick={limpiarFiltros}
            >
              Limpiar filtros ×
            </button>
          )}

        </div>

        {/* =====================================
            ESTADO DE CARGA
        ===================================== */}

        {cargando && (
          <div className="galeria-estado" role="status">

            <div className="galeria-spinner"></div>

            <strong>Cargando tu colección</strong>

            <p>
              Estamos preparando tus obras registradas.
            </p>

          </div>
        )}

        {/* =====================================
            MENSAJE DE ERROR
        ===================================== */}

        {!cargando && error && (
          <div className="galeria-estado galeria-error" role="alert">

            <span className="galeria-estado-icono">!</span>

            <h2>No fue posible cargar la galería</h2>

            <p>{error}</p>

            <button
              type="button"
              className="galeria-btn-principal"
              onClick={() => window.location.reload()}
            >
              Intentar nuevamente
            </button>

          </div>
        )}

        {/* =====================================
            GALERÍA VACÍA
        ===================================== */}

        {!cargando && !error && obras.length === 0 && (
          <div className="galeria-estado">

            <span className="galeria-estado-icono">▧</span>

            <h2>Tu galería está vacía</h2>

            <p>
              Registra una creación para comenzar tu colección.
            </p>

            <button
              type="button"
              className="galeria-btn-principal"
              onClick={() => navigate("/registrar-obra")}
            >
              ＋ Registrar obra
            </button>

          </div>
        )}

        {/* =====================================
            SIN RESULTADOS
        ===================================== */}

        {!cargando && !error &&
          obras.length > 0 &&
          obrasFiltradas.length === 0 && (
            <div className="galeria-estado">

              <span className="galeria-estado-icono">⌕</span>

              <h2>No encontramos coincidencias</h2>

              <p>
                Prueba con otro término o selecciona una categoría diferente.
              </p>

              <button
                type="button"
                className="galeria-btn-principal"
                onClick={limpiarFiltros}
              >
                Limpiar búsqueda
              </button>

            </div>
          )}

        {/* =====================================
            TARJETAS DE OBRAS
        ===================================== */}

        {!cargando && !error && obrasFiltradas.length > 0 && (
          <section
            className="galeria-grid"
            aria-label="Colección de obras"
          >

            {obrasFiltradas.map((obra) => {
              const tipo = obtenerTipoArchivo(obra.archivo);

              const imagen =
                tipo === "imagen" && obra.archivo
                  ? `${API_URL}/uploads/${encodeURIComponent(obra.archivo)}`
                  : null;

              return (
                <article
                  className="galeria-card"
                  key={obra.folio || obra.id}
                >

                  {/* IMAGEN DE LA OBRA */}
                  <button
                    type="button"
                    className="galeria-card-imagen"
                    onClick={() => setSeleccionada(obra)}
                    aria-label={`Ver ${obra.titulo || "obra"}`}
                  >

                    {imagen ? (
                      <img
                        src={imagen}
                        alt={`Vista previa de ${obra.titulo || "la obra"}`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="galeria-archivo">

                        <span>
                          {tipo === "pdf" ? "📄" :
                            tipo === "video" ? "🎬" : "📁"}
                        </span>

                        <small>
                          {tipo === "pdf"
                            ? "Documento PDF"
                            : tipo === "video"
                              ? "Archivo de video"
                              : "Archivo"}
                        </small>

                      </div>
                    )}

                    <span className="galeria-imagen-categoria">
                      {normalizarCategoria(obra.categoria)}
                    </span>

                    <span className="galeria-imagen-overlay">
                      Consultar obra →
                    </span>

                  </button>

                  {/* INFORMACIÓN DE LA OBRA */}
                  <div className="galeria-card-contenido">

                    <div className="galeria-card-cabecera">
                      <span className="galeria-categoria">
                        {normalizarCategoria(obra.categoria)}
                      </span>
                    </div>

                    <h3>
                      {obra.titulo || "Obra sin título"}
                    </h3>

                    <p className="galeria-autor">
                      <span>Autor</span>
                      {obra.autor || "No especificado"}
                    </p>

                    <div className="galeria-card-metadata">

                      <span>
                        <strong>Folio</strong>
                        {obra.folio || "No disponible"}
                      </span>

                      <span>
                        <strong>Registro</strong>
                        {mostrarFecha(obra.fechaRegistro)}
                      </span>

                    </div>

                    {/* ACCIONES */}
                    <div className="galeria-card-acciones">

                      <button
                        type="button"
                        className="galeria-ver-detalle"
                        onClick={() => setSeleccionada(obra)}
                      >
                        Ver detalles
                      </button>

                      <button
                        type="button"
                        className="galeria-btn-certificado"
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
              );
            })}

          </section>
        )}

        {/* PIE DE GALERÍA */}
        <footer className="galeria-footer">
          <strong>REGISTRA-IP</strong>

          <span>
            Sistema de registro y verificación de autoría.
          </span>
        </footer>

      </main>

      {/* =====================================
          MODAL DE DETALLES
      ===================================== */}

      {seleccionada && (
        <div
          className="galeria-modal-fondo"
          onClick={() => setSeleccionada(null)}
        >

          <section
            className="galeria-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-titulo"
            onClick={(evento) => evento.stopPropagation()}
          >

            <button
              type="button"
              className="galeria-modal-cerrar"
              onClick={() => setSeleccionada(null)}
              aria-label="Cerrar detalles"
            >
              ×
            </button>

            <div className="galeria-modal-encabezado">

              <span className="galeria-etiqueta">
                INFORMACIÓN DEL REGISTRO
              </span>

              <span className="galeria-modal-folio">
                {seleccionada.folio}
              </span>

            </div>

            <h2 id="detalle-titulo">
              {seleccionada.titulo || "Obra sin título"}
            </h2>

            {/* VISTA PREVIA */}
            {seleccionada.archivo &&
              obtenerTipoArchivo(seleccionada.archivo) === "imagen" && (
                <div className="galeria-modal-imagen">

                  <img
                    src={`${API_URL}/uploads/${encodeURIComponent(seleccionada.archivo)}`}
                    alt={`Vista previa de ${seleccionada.titulo || "la obra"}`}
                  />

                </div>
              )}

            {/* METADATOS */}
            <div className="galeria-detalle-lista">

              <div>
                <span>Autor</span>
                <strong>
                  {seleccionada.autor || "No especificado"}
                </strong>
              </div>

              <div>
                <span>Categoría</span>
                <strong>
                  {normalizarCategoria(seleccionada.categoria)}
                </strong>
              </div>

              <div>
                <span>Folio de registro</span>
                <strong>
                  {seleccionada.folio || "No disponible"}
                </strong>
              </div>

              <div>
                <span>Fecha de registro</span>
                <strong>
                  {mostrarFecha(seleccionada.fechaRegistro)}
                </strong>
              </div>

              <div className="galeria-detalle-completo">
                <span>Descripción</span>

                <p>
                  {seleccionada.descripcion || "Sin descripción disponible."}
                </p>
              </div>

              <div className="galeria-detalle-completo">
                <span>Archivo original</span>

                <p>
                  {seleccionada.archivoOriginal ||
                    seleccionada.archivo ||
                    "No disponible"}
                </p>
              </div>

            </div>

            {/* ACCIONES DEL MODAL */}
            <div className="galeria-modal-acciones">

              <button
                type="button"
                className="galeria-ver-detalle"
                onClick={() => setSeleccionada(null)}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="galeria-btn-certificado"
                disabled={descargandoFolio === seleccionada.folio}
                onClick={() => descargarCertificado(seleccionada)}
              >
                {descargandoFolio === seleccionada.folio
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

export default Galeria;
