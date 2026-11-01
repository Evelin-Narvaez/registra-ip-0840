
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./RegistrarObra.css";

const API_URL = "http://localhost:4000";

const pasos = [
  "Archivo",
  "Información",
  "Vista previa",
  "Confirmación"
];

function RegistrarObra() {
  const navigate = useNavigate();

  const usuario = JSON.parse(
    localStorage.getItem("registraIpUsuario") || "{}"
  );

  const [paso, setPaso] = useState(1);
  const [archivo, setArchivo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [folio, setFolio] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const pasoArchivoValido = archivo !== null;

  const pasoInformacionValido =
    titulo.trim().length >= 5 && categoria !== "";

  function siguientePaso() {
    setError("");

    if (paso === 1 && !pasoArchivoValido) {
      setError("Debes seleccionar un archivo para continuar.");
      return;
    }

    if (paso === 2 && !pasoInformacionValido) {
      setError(
        "Escribe un título de al menos 5 caracteres y selecciona una categoría."
      );
      return;
    }

    setPaso((actual) => Math.min(actual + 1, 4));
  }

  function pasoAnterior() {
    setError("");
    setPaso((actual) => Math.max(actual - 1, 1));
  }

  async function confirmarRegistro() {
    if (guardando) return;

    setGuardando(true);
    setError("");

    try {
      const obrasResponse = await fetch(`${API_URL}/obras`);

      if (!obrasResponse.ok) {
        throw new Error("No se pudieron consultar los folios existentes.");
      }

      const obras = await obrasResponse.json();

      const prefijo = "OBRA-0840-";

      const numeros = obras
        .map((obra) => {
          if (!obra.folio?.startsWith(prefijo)) return 0;

          return Number(obra.folio.slice(prefijo.length)) || 0;
        });

      const siguienteNumero = Math.max(0, ...numeros) + 1;

      const nuevoFolio =
        prefijo + String(siguienteNumero).padStart(3, "0");

      const datos = new FormData();

      datos.append("archivo", archivo);
      datos.append("folio", nuevoFolio);
      datos.append("titulo", titulo.trim());
      datos.append("categoria", categoria);
      datos.append("descripcion", descripcion.trim());
      datos.append("autor", usuario.nombre || "Autor no especificado");

      const response = await fetch(`${API_URL}/obras`, {
        method: "POST",
        body: datos
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo registrar la obra."
        );
      }

      setFolio(resultado.obra.folio);
      setPaso(4);
    } catch (err) {
      setError(
        err.message ||
        "No fue posible conectar con el servidor."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Layout>
      <section className="wizard-container">
        <div className="wizard-card">

          <div className="wizard-header">
            <h1>Registro de obra</h1>
            <p>
              Completa los siguientes pasos para registrar tu obra
              en REGISTRA-IP.
            </p>
          </div>

          <div className="wizard-progress">
            <div className="wizard-progress-track">
              <div
                className="wizard-progress-fill"
                style={{ width: `${(paso / 4) * 100}%` }}
              />
            </div>

            <div className="wizard-steps">
              {pasos.map((nombre, index) => {
                const numero = index + 1;

                return (
                  <div
                    key={nombre}
                    className={`wizard-step ${
                      paso >= numero ? "active" : ""
                    }`}
                  >
                    <span>{numero}</span>
                    <small>{nombre}</small>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="wizard-error" role="alert">
              {error}
            </div>
          )}

          {paso === 1 && (
            <div className="wizard-content">
              <h2>1. Carga tu archivo</h2>
              <p>
                Selecciona el archivo digital que deseas registrar.
                Tamaño máximo: 20 MB.
              </p>

              <label className="file-upload">
                <span>Seleccionar archivo</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    setArchivo(e.target.files[0] || null);
                    setError("");
                  }}
                />
              </label>

              {archivo && (
                <div className="selected-file">
                  <strong>Archivo seleccionado:</strong>
                  <span>{archivo.name}</span>
                  <small>
                    {(archivo.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </div>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="wizard-content">
              <h2>2. Información de la obra</h2>

              <label>
                Título de la obra *
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Escribe el título de tu obra"
                  maxLength={120}
                />
              </label>

              <label>
                Categoría *
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Literatura">Literatura</option>
                  <option value="Música">Música</option>
                  <option value="Artes visuales">Artes visuales</option>
                  <option value="Fotografía">Fotografía</option>
                  <option value="Software">Software</option>
                  <option value="Audiovisual">Audiovisual</option>
                  <option value="Otra">Otra</option>
                </select>
              </label>

              <label>
                Descripción de la obra
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe brevemente tu obra"
                  rows="4"
                  maxLength={1000}
                />
              </label>

              <small className="field-help">
                Los campos marcados con * son obligatorios.
              </small>
            </div>
          )}

          {paso === 3 && (
            <div className="wizard-content">
              <h2>3. Vista previa</h2>
              <p>Revisa que la información sea correcta.</p>

              <div className="preview-data">
                <div>
                  <span>Archivo</span>
                  <strong>{archivo?.name}</strong>
                </div>

                <div>
                  <span>Título</span>
                  <strong>{titulo}</strong>
                </div>

                <div>
                  <span>Categoría</span>
                  <strong>{categoria}</strong>
                </div>

                <div>
                  <span>Descripción</span>
                  <strong>
                    {descripcion || "Sin descripción"}
                  </strong>
                </div>

                <div>
                  <span>Autor</span>
                  <strong>{usuario.nombre || "No especificado"}</strong>
                </div>
              </div>
            </div>
          )}

          {paso === 4 && (
            <div className="wizard-content confirmation">
              <div className="confirmation-icon">✓</div>
              <h2>¡Obra registrada correctamente!</h2>
              <p>
                Tu obra se ha guardado en REGISTRA-IP.
              </p>

              <div className="folio-box">
                <span>Folio de registro</span>
                <strong>{folio}</strong>
              </div>

              <p className="confirmation-note">
                Conserva este folio como comprobante de tu registro.
              </p>
            </div>
          )}

          {paso < 4 && (
            <div className="wizard-actions">
              {paso > 1 && (
                <button
                  type="button"
                  className="wizard-btn wizard-back"
                  onClick={pasoAnterior}
                  disabled={guardando}
                >
                  Anterior
                </button>
              )}

              {paso < 3 ? (
                <button
                  type="button"
                  className="wizard-btn wizard-next"
                  onClick={siguientePaso}
                  disabled={
                    (paso === 1 && !pasoArchivoValido) ||
                    (paso === 2 && !pasoInformacionValido)
                  }
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  className="wizard-btn wizard-next"
                  onClick={confirmarRegistro}
                  disabled={guardando}
                >
                  {guardando ? "Registrando..." : "Confirmar registro"}
                </button>
              )}
            </div>
          )}

          {paso === 4 && (
            <div className="wizard-actions">
              <button
                type="button"
                className="wizard-btn wizard-next"
                onClick={() => navigate("/dashboard")}
              >
                Volver al panel
              </button>
            </div>
          )}

        </div>
      </section>
    </Layout>
  );
}

export default RegistrarObra;
