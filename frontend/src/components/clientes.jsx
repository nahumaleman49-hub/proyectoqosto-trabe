import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Trash2, Search, UserPlus, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchClientes();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFiltered(clientes);
        } else {
            const term = searchTerm.toLowerCase();
            setFiltered(clientes.filter(c =>
                c.nombre.toLowerCase().includes(term) ||
                c.telefono.includes(term)
            ));
        }
    }, [searchTerm, clientes]);

    const fetchClientes = async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data);
            setFiltered(response.data);
        } catch (err) {
            setError('Error al cargar clientes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar cliente "${nombre}" y sus datos asociados?`)) return;
        try {
            await api.delete(`/clientes/${id}`);
            setSuccessMsg('Cliente eliminado correctamente');
            fetchClientes();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('No se pudo eliminar el cliente');
            setTimeout(() => setError('Error al eliminar el cliente'), 3000);
            console.log(err);
        }
    };

    if (loading) {
        return <div className="text-center py-20">Cargando clientes...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header similar al blade */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <User size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Clientes</h1>
                        <p className="text-xl text-slate-300">Administra tu cartera y consulta sus proyectos</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Link to="/home" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver al Inicio
                </Link>

                {successMsg && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded-r-lg shadow-sm">
                        {successMsg}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r-lg shadow-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o teléfono..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/clientes/nuevo"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl hover:bg-slate-900 transition-all shadow-md"
                    >
                        <UserPlus size={20} />
                        Nuevo Cliente
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <Search size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">No se encontraron clientes registrados.</p>
                        </div>
                    ) : (
                        filtered.map(cliente => (
                            <div key={cliente.ID_cliente} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                            <User size={24} />
                                        </div>
                                        <span className="text-xs font-mono text-slate-400">Cliente: {cliente.ID_cliente}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{cliente.nombre}</h3>
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center text-slate-600 text-sm">
                                            <Phone size={16} className="mr-3 text-slate-400" />
                                            {cliente.telefono}
                                        </div>
                                        <div className="flex items-start text-slate-600 text-sm">
                                            <Mail size={16} className="mr-3 mt-0.5 text-slate-400" />
                                            <span className="line-clamp-2">{cliente.email}</span>
                                        </div>
                                        <div className="flex items-start text-slate-600 text-sm">
                                            <MapPin size={16} className="mr-3 mt-0.5 text-slate-400" />
                                            <span className="line-clamp-2">{cliente.direccion}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Proyectos</h4>
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                                                {cliente.proyectos_count || 0}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 italic">Ver proyectos en detalles</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 px-6 py-4 flex gap-2">
                                    <Link
                                        to={`/clientes/${cliente.ID_cliente}/editar`}
                                        className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-center text-sm font-bold hover:bg-slate-100 transition-colors"
                                    >
                                        Gestionar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(cliente.ID_cliente, cliente.nombre)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
    );
};

export default Clientes;