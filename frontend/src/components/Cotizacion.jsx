// src/components/Cotizaciones.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Eye, Edit, FileDown, ArrowLeft, Calendar, DollarSign, ClipboardList } from 'lucide-react';
import api from '../services/api';

const Cotizaciones = () => {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCotizaciones();
    }, []);

    const fetchCotizaciones = async () => {
        try {
            const response = await api.get('/cotizaciones');
            setCotizaciones(response.data);
        } catch (err) {
            setError('Error al cargar cotizaciones');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('es-MX');
    };

    const getEstadoBadge = (estado) => {
        const estados = { 0: 'Borrador', 1: 'Enviada', 2: 'Aprobada', 3: 'Rechazada' };
        const clases = {
            0: 'bg-slate-100 text-slate-600 border-slate-200',
            1: 'bg-blue-50 text-blue-700 border-blue-200',
            2: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            3: 'bg-red-50 text-red-700 border-red-200'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${clases[estado] || clases[0]}`}>{estados[estado] || 'Desconocido'}</span>;
    };

    if (loading) return <div className="text-center py-20">Cargando cotizaciones...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <FileText size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Cotizaciones</h1>
                        <p className="text-xl text-slate-300">Gestiona tus estimaciones de proyectos</p>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Link to="/home" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-8">
                    <ArrowLeft size={20} className="mr-2" /> Volver al Inicio
                </Link>
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Crear Nueva Cotización</h2>
                            <p className="text-slate-600">Genera una cotización detallada para tu próximo proyecto de construcción</p>
                        </div>
                        <Link to="/cotizaciones/nueva" className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg hover:shadow-lg">
                            <Plus size={20} /> Nueva Cotización
                        </Link>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6">Historial de Cotizaciones</h2>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-4 px-4">ID</th>
                                    <th className="text-left py-4 px-4">Proyecto</th>
                                    <th className="text-left py-4 px-4">Cliente</th>
                                    <th className="text-left py-4 px-4">Fecha</th>
                                    <th className="text-left py-4 px-4">Valor</th>
                                    <th className="text-left py-4 px-4">Estado</th>
                                    <th className="text-center py-4 px-4">Acciones</th>
                                 </tr>
                            </thead>
                            <tbody>
                                {cotizaciones.map(cot => (
                                    <tr key={cot.ID_cotizacion} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-4 px-4 font-medium">#{cot.ID_cotizacion}</td>
                                        <td className="py-4 px-4">{cot.proyecto_nombre}</td>
                                        <td className="py-4 px-4">{cot.cliente_nombre}</td>
                                        <td className="py-4 px-4">{formatDate(cot.fecha)}</td>
                                        <td className="py-4 px-4 font-bold">${parseFloat(cot.total).toFixed(2)}</td>
                                        <td className="py-4 px-4">{getEstadoBadge(cot.estado)}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-center gap-3">
                                                <Link to={`/cotizaciones/${cot.ID_cotizacion}`} className="text-slate-400 hover:text-slate-800" title="Ver">
                                                    <Eye size={20} />
                                                </Link>
                                                <Link to={`/cotizaciones/${cot.ID_cotizacion}/editar`} className="text-slate-400 hover:text-blue-600" title="Editar">
                                                    <Edit size={20} />
                                                </Link>
                                                <button className="text-slate-400 hover:text-red-600" title="PDF (próximamente)">
                                                    <FileDown size={20} />
                                                </button>
                                            </div>
                                        </td>
                                     </tr>
                                ))}
                                {cotizaciones.length === 0 && (
                                    <tr><td colSpan="7" className="text-center py-12 text-slate-400">No hay cotizaciones registradas</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Cotizaciones;