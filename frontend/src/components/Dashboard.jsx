// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, Briefcase, Truck, Package, HardHat, 
  User, Settings, LogOut, Eye 
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const res = await api.get('/cotizaciones');
        // Tomar las 5 más recientes (asumiendo que vienen ordenadas por ID descendente)
        const recientes = res.data.slice(0, 5);
        setCotizaciones(recientes);
      } catch (error) {
        console.error('Error al cargar cotizaciones', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCotizaciones();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  };

  const getEstadoBadge = (estado) => {
    const estados = ['Borrador', 'Enviada', 'Aprobada', 'Rechazada'];
    const clases = {
      0: 'bg-slate-100 text-slate-700',
      1: 'bg-blue-100 text-blue-700',
      2: 'bg-green-100 text-green-700',
      3: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${clases[estado] || clases[0]}`}>
        {estados[estado] || 'Desconocido'}
      </span>
    );
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Cotizaciones', icon: FileText, path: '/cotizaciones' },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Proyectos', icon: Briefcase, path: '/proyectos' },
    { name: 'Proveedores', icon: Truck, path: '/proveedores' },
    { name: 'Materiales', icon: Package, path: '/materiales' },
    { name: 'Mano de Obra', icon: HardHat, path: '/servicios' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">QOSTO</h1>
          <p className="text-sm text-slate-400">Panel de Usuario</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition ${
                location.pathname === item.path ? 'bg-slate-700/50' : 'hover:bg-slate-700/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5" />
            <span className="text-sm">{user.name || 'Usuario'}</span>
          </div>
          <Link
            to="/perfil"
            className="flex items-center gap-3 text-sm text-slate-300 hover:text-white mb-3 transition"
          >
            <Settings className="w-4 h-4" />
            Mi Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">
            Bienvenido, {user.name || 'Usuario'}
          </h1>

          {/* Cotizaciones recientes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📋 Cotizaciones recientes</h2>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Cargando cotizaciones...</div>
            ) : cotizaciones.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No hay cotizaciones registradas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Proyecto</th>
                      <th className="text-left py-3 px-2">Cliente</th>
                      <th className="text-left py-3 px-2">Fecha</th>
                      <th className="text-left py-3 px-2">Total</th>
                      <th className="text-left py-3 px-2">Estado</th>
                      <th className="text-left py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotizaciones.map((cot) => (
                      <tr key={cot.ID_cotizacion} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2">{cot.ID_cotizacion}</td>
                        <td className="py-3 px-2">{cot.proyecto_nombre || 'N/A'}</td>
                        <td className="py-3 px-2">{cot.cliente_nombre || 'N/A'}</td>
                        <td className="py-3 px-2">{formatDate(cot.fecha)}</td>
                        <td className="py-3 px-2">${parseFloat(cot.total).toFixed(2)}</td>
                        <td className="py-3 px-2">{getEstadoBadge(cot.estado)}</td>
                        <td className="py-3 px-2">
                          <Link to={`/cotizaciones/${cot.ID_cotizacion}`} className="text-slate-600 hover:text-slate-800">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;