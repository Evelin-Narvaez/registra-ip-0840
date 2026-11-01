import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipo, setTipo] = useState("");
  const [errores, setErrores] = useState([]);

  function manejarRegistro(e) {
    e.preventDefault();

    const nuevosErrores = [];

    if (!nombre.trim()) {
      nuevosErrores.push("El nombre es obligatorio.");
    }

    if (!correo.trim()) {
      nuevosErrores.push("El correo electrónico es obligatorio.");
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
      nuevosErrores.push("Ingresa un correo electrónico válido.");
    }

    if (!tipo) {
      nuevosErrores.push("Selecciona tu tipo de creador.");
    }

    setErrores(nuevosErrores);

    if (nuevosErrores.length > 0) {
      return;
    }

    const usuario = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      tipo: tipo
    };

    localStorage.setItem(
      "registraIpUsuario",
      JSON.stringify(usuario)
    );

    navigate("/dashboard");
  }

  return (
    <Layout>
      <section className="registro-container">

        <div className="registro-card">

          <div className="registro-heading">
            <h1>Crear cuenta</h1>
            <p>
              Regístrate como creador de contenido
            </p>
          </div>

          <form onSubmit={manejarRegistro} noValidate>

            <div className="form-group">
              <label htmlFor="nombre">
                Nombre completo
              </label>

              <input
                id="nombre"
                type="text"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo">
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo">
                Tipo de creador
              </label>

              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">
                  Selecciona tu tipo de creador
                </option>

                <option value="Diseñador">Diseñador</option>
                <option value="Fotógrafo">Fotógrafo</option>
                <option value="Escritor">Escritor</option>
                <option value="Cineasta">Cineasta</option>
              </select>
            </div>

            <div aria-live="polite" className="errores">
              {errores.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>

            <button type="submit" className="btn-registro">
              Registrarme
            </button>

          </form>

          <p className="registro-nota">
            REGISTRA-IP · Tu autoría importa
          </p>

        </div>

      </section>
    </Layout>
  );
}

export default Registro;