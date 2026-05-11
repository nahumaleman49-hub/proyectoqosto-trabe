import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Clientes from './components/Clientes';
import ClientesForm from './components/ClientesForm';
import Proyectos from './components/Proyectos';
import ProyectosForm from './components/ProyectosForm';

// Componentes temporales para otras páginas
const Perfil = () => <div className="p-8 text-white">Perfil - En construcción</div>;
const Cotizaciones = () => <div className="p-8 text-white">Cotizaciones - En construcción</div>;
const Proveedores = () => <div className="p-8 text-white">Proveedores - En construcción</div>;
const Materiales = () => <div className="p-8 text-white">Materiales - En construcción</div>;
const ManoDeObra = () => <div className="p-8 text-white">Mano de Obra - En construcción</div>;

// Ruta protegida
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
                <Route path="/clientes/nuevo" element={<PrivateRoute><ClientesForm /></PrivateRoute>} />
                <Route path="/clientes/:id/editar" element={<PrivateRoute><ClientesForm /></PrivateRoute>} />
                <Route path="/proyectos" element={<PrivateRoute><Proyectos /></PrivateRoute>} />
                <Route path="/proyectos/nuevo" element={<PrivateRoute><ProyectosForm /></PrivateRoute>} />
                <Route path="/proyectos/:id/editar" element={<PrivateRoute><ProyectosForm /></PrivateRoute>} />
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
                        <Cotizaciones />
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
                <Route path="/mano-de-obra" element={
                    <PrivateRoute>
                        <ManoDeObra />
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