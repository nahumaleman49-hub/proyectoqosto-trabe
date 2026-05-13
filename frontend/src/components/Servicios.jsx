import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Edit, Trash2, ArrowLeft, Users } from 'lucide-react';
import api from '../services/api';

const Servicios = () => {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const response = await api.get('/servicios');
            setServicios(response.data);
        } catch (err) {
            setError('Error al cargar servicios');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!confirm(`¿Eliminar el servicio "${nombre}"?`)) return;
        try {
            await api.delete(`/servicios/${id}`);
            setSuccess('Servicio eliminado correctamente');
            fetchServicios();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('No se pudo eliminar el servicio');
            setTimeout(() => setError(''), 3000);
            console.log(err);
        }
    };

    if (loading) return <div className="text-center py-20">Cargando servicios...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Briefcase size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Mano de Obra</h1>
                        <p className="text-xl text-slate-300">Servicios especializados y proveedores</p>
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
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Servicios</h2>
                            <p className="text-slate-600 text-lg">Gestiona contratistas de servicios y mano de obra</p>
                        </div>
                        <Link
                            to="/servicios/nuevo"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow"
                        >
                            <Plus size={20} />
                            Añadir nuevo Servicio
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Lista de Servicios</h2>
                    <div className="space-y-6">
                        {servicios.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No hay servicios registrados.</div>
                        ) : (
                            servicios.map(serv => (
                                <div key={serv.ID_servicio} className="border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800">{serv.nombre}</h3>
                                            <p className="text-slate-600 mt-1">Categoría: {serv.categoria_nombre || 'N/A'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link to={`/servicios/${serv.ID_servicio}/editar`} className="text-slate-600 hover:text-slate-800">
                                                <Edit size={20} />
                                            </Link>
                                            <button onClick={() => handleDelete(serv.ID_servicio, serv.nombre)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="font-semibold text-slate-700 mb-2">Proveedores que ofrecen este servicio:</h4>
                                        <div className="grid gap-3">
                                            {serv.proveedores && serv.proveedores.length > 0 ? (
                                                serv.proveedores.map(prov => (
                                                    <div key={prov.ID_mano_obra} className="bg-slate-50 rounded-lg p-3 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium text-slate-800">{prov.nombre}</p>
                                                            <p className="text-sm text-slate-600">Contacto: {prov.nombre_contacto || prov.telefono}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-slate-700">${parseFloat(prov.precio).toFixed(2)}</p>
                                                            <p className="text-xs text-slate-500">por {prov.unidad}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-slate-500 text-sm">No hay proveedores registrados para este servicio.</p>
                                            )}
                                        </div>
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

export default Servicios;