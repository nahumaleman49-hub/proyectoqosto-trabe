import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Search, Plus, Edit, Trash2, ArrowLeft, Package, Layers, X } from 'lucide-react';
import api from '../services/api';
import { isAdmin } from '../utils/auth';

const Materiales = () => {
    const [materiales, setMateriales] = useState([]);
    const [buscar, setBuscar] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMateriales();
    }, [buscar]);

    const fetchMateriales = async () => {
        try {
            const params = buscar ? { buscar } : {};
            const response = await api.get('/materiales', { params });
            setMateriales(response.data);
        } catch (err) {
            setError('Error al cargar materiales');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const [esAdmin, setEsAdmin] = useState(false);
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setEsAdmin(user.role === 'admin');
    }, []);

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar el material "${nombre}"?`)) return;
        try {
            await api.delete(`/materiales/${id}`);
            setSuccess('Material eliminado correctamente');
            fetchMateriales();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('No se pudo eliminar el material');
            setTimeout(() => setError(''), 3000);
            console.log(err);
        }
    };

    const backRoute = isAdmin() ? '/home' : '/dashboard';

    if (loading) return <div className="text-center py-20">Cargando materiales...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Box size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Materiales</h1>
                        <p className="text-xl text-slate-300">Listado general de materiales de construcción</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Link to={backRoute} className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver {isAdmin() ? 'al Inicio' : 'al Dashboard'}
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
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Materiales</h2>
                            <p className="text-slate-600 text-lg">Administra tus materiales y sus clasificaciones</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="relative flex items-center">
                                <Search size={20} className="absolute left-3 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Ingrese material o código"
                                    value={buscar}
                                    onChange={(e) => setBuscar(e.target.value)}
                                    className="w-full pl-10 pr-24 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                />
                                {buscar && (
                                    <button
                                        onClick={() => setBuscar('')}
                                        className="absolute right-2 text-red-500 hover:text-red-700"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            <Link
                                to="/categorias"
                                className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-50 transition-all"
                            >
                                <Layers size={20} />
                                <span className="hidden sm:inline">Categorías</span>
                            </Link>

                            <Link
                                to="/materiales/nuevo"
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3 rounded-lg hover:shadow-lg"
                            >
                                <Plus size={20} />
                                Nuevo Material
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Lista de Materiales</h2>
                    {buscar && (
                        <p className="text-slate-600 mb-4">
                            Mostrando resultados para: <span className="font-semibold text-slate-800">"{buscar}"</span>
                        </p>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-4 px-4">Código</th>
                                    <th className="text-left py-4 px-4">Nombre</th>
                                    <th className="text-left py-4 px-4">Unidad</th>
                                    <th className="text-left py-4 px-4">Categoría</th>
                                    <th className="text-left py-4 px-4">Precios por Proveedor</th>
                                    <th className="text-left py-4 px-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materiales.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-500">
                                            {buscar ? `No se encontraron materiales que coincidan con "${buscar}".` : 'No hay materiales registrados.'}
                                        </td>
                                    </tr>
                                ) : (
                                    materiales.map(mat => (
                                        <tr key={mat.ID_Material} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4 px-4 font-mono text-sm text-slate-600">{mat.codigo}</td>
                                            <td className="py-4 px-4 font-semibold text-slate-800">{mat.nombre}</td>
                                            <td className="py-4 px-4 text-slate-600">{mat.medidas}</td>
                                            <td className="py-4 px-4 text-slate-600">{mat.categoria_nombre || 'Sin Categoría'}</td>
                                            <td className="py-4 px-4 text-slate-600">
                                                {/* Los precios no se muestran en el listado principal porque la respuesta no trae abastecimientos. En la vista de detalle/edición se verán */}
                                                <span className="text-sm text-slate-400 italic">Ver en edición</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/materiales/${mat.ID_Material}/editar`} className="text-slate-600 hover:text-slate-800" title="Editar">
                                                        <Edit size={20} />
                                                    </Link>
                                                    {esAdmin && (
                                                        <button onClick={() => handleDelete(mat.ID_Material, mat.nombre)} className="text-red-500 hover:text-red-700" title="Eliminar">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    )}
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

export default Materiales;