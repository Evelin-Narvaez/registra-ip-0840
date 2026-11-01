
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Dashboard() {
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("registraIpUsuario");

  const usuario = JSON.parse(usuarioGuardado);

  function cerrarSesion() {
    localStorage.removeItem("registraIpUsuario");
    navigate("/");
  }

  return (
    <Layout>
      <section className="dashboard-container">

        <div className="dashboard-card">

          <div className="dashboard-icon">
            ✓
          </div>

          <h1>
            ¡Bienvenida, {usuario.nombre}!
          </h1>

          <p className="dashboard-description">
            Tu registro en REGISTRA-IP se realizó correctamente.
          </p>

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

          <button
            className="btn-cerrar"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>

        </div>

      </section>
    </Layout>
  );
}

export default Dashboard;
