
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import RegistrarObra from "./pages/RegistrarObra";
import RutaProtegida from "./components/RutaProtegida";
import Galeria from "./pages/Galeria";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Registro />}
        />

        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />

        <Route
          path="/registrar-obra"
          element={
            <RutaProtegida>
              <RegistrarObra />
            </RutaProtegida>
          }
        />

          <Route
            path="/galeria"
            element={
              <RutaProtegida>
                <Galeria />
              </RutaProtegida>
            }
          />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

