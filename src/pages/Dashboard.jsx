
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { generarCertificado } from "../utils/generarCertificado";

const API_URL = "http://localhost:4000";

function Dashboard() {
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("registraIpUsuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarObras() {
      try {
        const respuesta = await fetch(`${API_URL}/obras`);

        if (!respuesta.ok) {
          throw new Error("No se pudieron consultar las obras.");
        }

        const datos = await respuesta.json();
        setObras(Array.isArray(datos) ? datos : datos.obras || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    cargarObras();
  }, []);

  function cerrarSesion() {
    localStorage.removeItem("registraIpUsuario");
    navigate("/");
  }

  async function descargarCertificado(obra) {
    try {
      await generarCertificado(obra);
    } catch (err) {
      alert("No fue posible generar el certificado.");
      console.error(err);
    }
  }

  return (
    <Layout>
      <section className="dashboard-container">
        <div className="dashboard-card">
          <div className="dashboard-icon">✓</div>

          <h1>
            ¡Bienvenida, {usuario?.nombre || "creador"}!
          </h1>

          <p className="dashboard-description">
            Tu registro en REGISTRA-IP se realizó correctamente.
          </p>

          {usuario && (
            <div className="usuario-info">
              <div>
                <span>Nombre completo</span>
                <strong>{usuario.nombre}</strong>
              </div>

              <div>
                <span>Correo electrónico</span>
                <strong>{usuario.correo}</strong>
              </div>

              <div>
                <span>Tipo de creador</span>
                <strong>{usuario.tipo}</strong>
              </div>
            </div>
          )}

          <button
            className="btn-registrar-obra"
            onClick={() => navigate("/registrar-obra")}
          >
            Registrar nueva obra
          </button>

          <button className="btn-cerrar" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>

        <div className="dashboard-card">
          <h2>Mis obras registradas</h2>

          {cargando && <p>Cargando obras...</p>}

          {error && <p>{error}</p>}

          {!cargando && !error && obras.length === 0 && (
            <p>Aún no tienes obras registradas.</p>
          )}

          {obras.map((obra) => (
            <div className="usuario-info" key={obra.folio}>
              <div>
                <span>Título de la obra</span>
                <strong>{obra.titulo}</strong>
              </div>

              <div>
                <span>Folio</span>
                <strong>{obra.folio}</strong>
              </div>

              <div>
                <span>Fecha de registro</span>
                <strong>
                  {obra.fechaRegistro
                    ? new Date(obra.fechaRegistro).toLocaleDateString("es-MX")
                    : "No disponible"}
                </strong>
              </div>

              <button
                className="btn-registrar-obra"
                onClick={() => descargarCertificado(obra)}
              >
                Descargar certificado
              </button>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Dashboard;

