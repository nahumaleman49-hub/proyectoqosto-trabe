import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Plus, Edit, Trash2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const Proyectos = () => {
    const [proyectos, setProyectos] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProyectos();
    }, [search]);

    const fetchProyectos = async () => {
        try {
            const params = search ? { search } : {};
            const response = await api.get('/proyectos', { params });
            setProyectos(response.data);
        } catch (err) {
            setError('Error al cargar proyectos');
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar el proyecto "${nombre}"?`)) return;
        try {
            await api.delete(`/proyectos/${id}`);
            setSuccess('Proyecto eliminado correctamente');
            fetchProyectos();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('No se pudo eliminar el proyecto');
            setTimeout(() => setError(''), 3000);
            console.log(err)
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX');
    };

    if (loading) return <div className="text-center py-20">Cargando proyectos...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header igual que en clientes */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Briefcase size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Proyectos</h1>
                        <p className="text-xl text-slate-300">Administra tus proyectos</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Link to="/home" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver al Inicio
                </Link>

                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded-r-lg shadow-sm">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r-lg shadow-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Agregar Nuevo Proyecto</h2>
                            <p className="text-slate-600 text-lg">Registra un nuevo proyecto en tu base de datos</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre del cliente..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                    />
                                </div>
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            <Link
                                to="/proyectos/nuevo"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <Plus size={20} />
                                Nuevo Proyecto
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Lista de Proyectos</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-4 px-4">ID</th>
                                    <th className="text-left py-4 px-4">Nombre</th>
                                    <th className="text-left py-4 px-4">Cliente</th>
                                    <th className="text-left py-4 px-4">Estado</th>
                                    <th className="text-left py-4 px-4">Fecha Inicio</th>
                                    <th className="text-left py-4 px-4">Fecha Fin</th>
                                    <th className="text-left py-4 px-4">Presupuesto</th>
                                    <th className="text-left py-4 px-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proyectos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-slate-500">
                                            No hay proyectos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    proyectos.map((proy) => (
                                        <tr key={proy.ID_proyecto} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4 px-4 font-mono text-sm">{proy.ID_proyecto}</td>
                                            <td className="py-4 px-4 font-semibold">{proy.nombre}</td>
                                            <td className="py-4 px-4">{proy.cliente_nombre || 'N/A'}</td>
                                            <td className="py-4 px-4">
                                                {proy.estado ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm flex items-center gap-1 w-fit">
                                                        <CheckCircle size={14} /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm flex items-center gap-1 w-fit">
                                                        <XCircle size={14} /> Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">{formatDate(proy.fecha_ini)}</td>
                                            <td className="py-4 px-4">{formatDate(proy.fecha_fin)}</td>
                                            <td className="py-4 px-4">${Number(proy.presupuesto).toFixed(2)}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        to={`/proyectos/${proy.ID_proyecto}/editar`}
                                                        className="text-slate-600 hover:text-slate-800 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={20} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(proy.ID_proyecto, proy.nombre)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Proyectos;