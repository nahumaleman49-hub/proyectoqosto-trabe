import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Clientes from './components/Clientes';
import ClientesForm from './components/ClientesForm';
import Proyectos from './components/Proyectos';
import ProyectosForm from './components/ProyectosForm';
import Proveedores from './components/Proveedores';
import ProveedoresForm from './components/ProveedoresForm';
import Materiales from './components/Materiales';
import MaterialesForm from './components/MaterialesForm';
import Servicios from './components/Servicios';
import ServiciosForm from './components/ServiciosForm';
import Cotizaciones from './components/Cotizacion';
import CotizacionForm from './components/CotizacionForm';
import CotizacionDetalle from './components/CotizacionDetalle';

// Componentes temporales para otras páginas
const Perfil = () => <div className="p-8 text-white">Perfil - En construcción</div>;


// Ruta protegida
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* modulo de login */}
                <Route path="/login" element={<Login />} />
                {/* modulo de clientes */}
                <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
                <Route path="/clientes/nuevo" element={<PrivateRoute><ClientesForm /></PrivateRoute>} />
                <Route path="/clientes/:id/editar" element={<PrivateRoute><ClientesForm /></PrivateRoute>} />
                {/* modulo de proyectos */}
                <Route path="/proyectos" element={<PrivateRoute><Proyectos /></PrivateRoute>} />
                <Route path="/proyectos/nuevo" element={<PrivateRoute><ProyectosForm /></PrivateRoute>} />
                <Route path="/proyectos/:id/editar" element={<PrivateRoute><ProyectosForm /></PrivateRoute>} />
                {/* modulo de proveedores */}
                <Route path="/proveedores" element={<PrivateRoute><Proveedores /></PrivateRoute>} />
                <Route path="/proveedores/nuevo" element={<PrivateRoute><ProveedoresForm /></PrivateRoute>} />
                <Route path="/proveedores/:id/editar" element={<PrivateRoute><ProveedoresForm /></PrivateRoute>} />
                {/* modulo de materiales */}
                <Route path="/materiales" element={<PrivateRoute><Materiales /></PrivateRoute>} />
                <Route path="/materiales/nuevo" element={<PrivateRoute><MaterialesForm /></PrivateRoute>} />
                <Route path="/materiales/:id/editar" element={<PrivateRoute><MaterialesForm /></PrivateRoute>} />
                {/* modulo de servicios */}
                <Route path="/servicios" element={<PrivateRoute><Servicios /></PrivateRoute>} />
                <Route path="/servicios/nuevo" element={<PrivateRoute><ServiciosForm /></PrivateRoute>} />
                <Route path="/servicios/:id/editar" element={<PrivateRoute><ServiciosForm /></PrivateRoute>} />

                <Route path="/cotizaciones" element={<PrivateRoute><Cotizaciones /></PrivateRoute>} />
                <Route path="/cotizaciones/nueva" element={<PrivateRoute><CotizacionForm /></PrivateRoute>} />
                <Route path="/cotizaciones/:id/editar" element={<PrivateRoute><CotizacionForm /></PrivateRoute>} />
                <Route path="/cotizaciones/:id" element={<PrivateRoute><CotizacionDetalle /></PrivateRoute>} /> // si lo creas

                <Route path="/home" element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                } />
                <Route path="/perfil" element={
                    <PrivateRoute>
                        <Perfil />
                    </PrivateRoute>
                } />
                <Route path="/cotizaciones" element={
                    <PrivateRoute>
                        <CotizacionForm />
                    </PrivateRoute>
                } />
                <Route path="/proveedores" element={
                    <PrivateRoute>
                        <Proveedores />
                    </PrivateRoute>
                } />
                <Route path="/materiales" element={
                    <PrivateRoute>
                        <Materiales />
                    </PrivateRoute>
                } />
                <Route path="/servicios" element={
                    <PrivateRoute>
                        <Servicios />
                    </PrivateRoute>
                } />
                <Route path="/clientes" element={
                    <PrivateRoute>
                        <Clientes />
                    </PrivateRoute>
                } />
                <Route path="/proyectos" element={
                    <PrivateRoute>
                        <Proyectos />
                    </PrivateRoute>
                } />
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;