import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, MapPin, Plus, Edit, Trash2, ArrowLeft, Building, Mail, Phone } from 'lucide-react';
import api from '../services/api';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProveedores();
    }, []);

    useEffect(() => {
        filterCards();
    }, [searchTerm, locationFilter, proveedores]);

    const fetchProveedores = async () => {
        try {
            const response = await api.get('/proveedores');
            setProveedores(response.data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar proveedores');
        } finally {
            setLoading(false);
        }
    };

    const filterCards = () => {
        const search = searchTerm.toLowerCase();
        const location = locationFilter.toLowerCase();
        const filteredList = proveedores.filter(p =>
            (p.nombre.toLowerCase().includes(search) ||
             p.nombre_contacto.toLowerCase().includes(search) ||
             p.correo_e.toLowerCase().includes(search)) &&
            (p.direccion.toLowerCase().includes(location))
        );
        setFiltered(filteredList);
    };

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar el proveedor "${nombre}"?`)) return;
        try {
            await api.delete(`/proveedores/${id}`);
            setSuccess('Proveedor eliminado correctamente');
            fetchProveedores();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('No se pudo eliminar el proveedor');
            setTimeout(() => setError(''), 3000);
            console.log(err);
        }
    };

    if (loading) return <div className="text-center py-20">Cargando proveedores...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Package size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Proveedores</h1>
                        <p className="text-xl text-slate-300">Visualiza a tus socios comerciales</p>
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

                {/* Barra de herramientas */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar proveedor</label>
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Nombre, contacto o correo..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full lg:w-72">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Filtrar por Ubicación</label>
                            <div className="relative">
                                <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Ciudad, calle o zona..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="lg:pt-7">
                            <Link
                                to="/proveedores/nuevo"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all w-full justify-center"
                            >
                                <Plus size={20} />
                                Nuevo Proveedor
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Listado en tarjetas */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Building size={24} className="text-slate-500" />
                        Proveedores Registrados ({filtered.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <Package size={32} className="text-slate-400" />
                                </div>
                                <p className="text-slate-500 font-medium">No hay proveedores que coincidan con la búsqueda.</p>
                            </div>
                        ) : (
                            filtered.map(prov => (
                                <div key={prov.ID_proveedor} className="border border-slate-200 rounded-2xl p-6 hover:border-slate-400 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                            <Building size={24} />
                                        </div>
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                            {prov.tipo}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-1">{prov.nombre}</h3>
                                    <p className="text-slate-500 text-sm mb-4">{prov.nombre_contacto}</p>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-slate-600 text-sm">
                                            <Mail size={16} className="mr-3 text-slate-400" />
                                            <span className="truncate">{prov.correo_e}</span>
                                        </div>
                                        <div className="flex items-center text-slate-600 text-sm">
                                            <Phone size={16} className="mr-3 text-slate-400" />
                                            <span>{prov.telefono}</span>
                                        </div>
                                        <div className="flex items-start text-slate-600 text-sm">
                                            <MapPin size={16} className="mr-3 mt-0.5 text-slate-400" />
                                            <span className="line-clamp-2">{prov.direccion}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <Link
                                            to={`/proveedores/${prov.ID_proveedor}/editar`}
                                            className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition-colors text-center text-sm font-medium"
                                        >
                                            Gestionar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(prov.ID_proveedor, prov.nombre)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Proveedores;