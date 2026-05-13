// src/components/CotizacionDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Phone, Mail, Package, Briefcase, Edit, FileDown } from 'lucide-react';
import api from '../services/api';

const CotizacionDetalle = () => {
    const { id } = useParams();
    const [cotizacion, setCotizacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const res = await api.get(`/cotizaciones/${id}`);
                setCotizacion(res.data);
            } catch (err) {
                setError('Error al cargar la cotización');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetalle();
    }, [id]);

    if (loading) {
        return <div className="text-center py-20">Cargando cotización...</div>;
    }

    if (error || !cotizacion) {
        return <div className="text-center py-20 text-red-500">{error || 'Cotización no encontrada'}</div>;
    }

    // Calcular subtotales
    const totalMateriales = (cotizacion.materiales || []).reduce((sum, m) => sum + (m.cantidad * m.precio_unitario), 0);
    const totalServicios = (cotizacion.servicios || []).reduce((sum, s) => sum + (s.cantidad * s.precio_unitario), 0);

    // Map de estados
    const estadosMap = {
        0: { label: 'Borrador', clase: 'bg-slate-100 text-slate-600 border-slate-200' },
        1: { label: 'Enviada', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
        2: { label: 'Aprobada', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        3: { label: 'Rechazada', clase: 'bg-red-50 text-red-700 border-red-200' }
    };
    const estadoActual = estadosMap[cotizacion.estado] || estadosMap[0];

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('es-MX');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Cabecera */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <FileText size={48} className="mx-auto mb-2" />
                        <h1 className="text-3xl font-bold">Cotización #{cotizacion.ID_cotizacion}</h1>
                        <p className="text-slate-300">Detalle completo de la estimación</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Link to="/cotizaciones" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-6">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver a Cotizaciones
                </Link>

                {/* Tarjeta principal */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    {/* Barra de estado superior */}
                    <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${estadoActual.clase}`}>
                                {estadoActual.label}
                            </span>
                            <span className="text-slate-500 text-sm flex items-center gap-1">
                                <Calendar size={14} />
                                {formatDate(cotizacion.fecha)}
                            </span>
                        </div>
                        <div className="text-slate-400 font-mono text-sm tracking-widest uppercase">
                            Folio: {String(cotizacion.ID_cotizacion).padStart(5, '0')}
                        </div>
                    </div>

                    {/* Información del Proyecto */}
                    <div className="p-8 border-b bg-white">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-l-4 border-slate-700 pl-3">
                            Información General
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Proyecto</p>
                                    <p className="text-lg font-semibold text-slate-800">{cotizacion.proyecto_nombre}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Ubicación / Fechas</p>
                                    <p className="text-slate-600">Fechas no especificadas</p>
                                </div>
                            </div>
                            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Cliente</p>
                                    <p className="text-lg font-semibold text-slate-800">{cotizacion.cliente_nombre}</p>
                                </div>
                                <div className="flex flex-col text-sm text-slate-600 gap-1">
                                    {cotizacion.telefono && (
                                        <span className="flex items-center gap-2"><Phone size={12} /> {cotizacion.telefono}</span>
                                    )}
                                    {cotizacion.email && (
                                        <span className="flex items-center gap-2"><Mail size={12} /> {cotizacion.email}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Materiales */}
                    {cotizacion.materiales && cotizacion.materiales.length > 0 && (
                        <div className="p-8 border-b">
                            <h3 className="text-md font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Package size={20} className="text-blue-500" /> Desglose de Materiales
                            </h3>
                            <div className="overflow-x-auto rounded-lg border border-slate-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                        <tr>
                                            <th className="text-left py-3 px-4">Descripción</th>
                                            <th className="text-left py-3 px-4">Proveedor</th>
                                            <th className="text-center py-3 px-4">Cant.</th>
                                            <th className="text-right py-3 px-4">P. Unitario</th>
                                            <th className="text-right py-3 px-4">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {cotizacion.materiales.map((mat, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 font-medium">
                                                    {mat.material_nombre}
                                                    <span className="text-slate-400 font-normal ml-1">({mat.medidas})</span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500 text-xs">{mat.proveedor_nombre}</td>
                                                <td className="py-3 px-4 text-center">{parseFloat(mat.cantidad).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right text-slate-500">${parseFloat(mat.precio_unitario).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-700">
                                                    ${(mat.cantidad * mat.precio_unitario).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tabla de Servicios */}
                    {cotizacion.servicios && cotizacion.servicios.length > 0 && (
                        <div className="p-8 border-b">
                            <h3 className="text-md font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-amber-500" /> Mano de Obra y Servicios
                            </h3>
                            <div className="overflow-x-auto rounded-lg border border-slate-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                        <tr>
                                            <th className="text-left py-3 px-4">Servicio / Unidad</th>
                                            <th className="text-left py-3 px-4">Proveedor</th>
                                            <th className="text-center py-3 px-4">Cant.</th>
                                            <th className="text-right py-3 px-4">P. Unitario</th>
                                            <th className="text-right py-3 px-4">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {cotizacion.servicios.map((serv, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 font-medium">
                                                    {serv.servicio_nombre}
                                                    <span className="block text-[10px] text-slate-400 uppercase tracking-tighter">{serv.unidad}</span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-500 text-xs">{serv.proveedor_nombre}</td>
                                                <td className="py-3 px-4 text-center">{parseFloat(serv.cantidad).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right text-slate-500">${parseFloat(serv.precio_unitario).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-700">
                                                    ${(serv.cantidad * serv.precio_unitario).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Resumen económico final */}
                    {/* Resumen económico con desglose */}
                    <div className="p-8 bg-slate-900 text-slate-300">
                        <div className="max-w-sm ml-auto space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal Materiales:</span>
                                <span className="text-white">${totalMateriales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Subtotal Servicios:</span>
                                <span className="text-white">${totalServicios.toFixed(2)}</span>
                            </div>
                            {(cotizacion.costo_equipo > 0) && (
                                <div className="flex justify-between text-sm">
                                    <span>Costo de Equipo:</span>
                                    <span className="text-white">${cotizacion.costo_equipo.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                                <span>Subtotal General:</span>
                                <span className="text-white font-medium">
                                    ${(totalMateriales + totalServicios + (cotizacion.costo_equipo || 0)).toFixed(2)}
                                </span>
                            </div>
                            {cotizacion.gastos_generales > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Gastos Generales ({cotizacion.gastos_generales}%):</span>
                                    <span className="text-white">
                                        ${(((totalMateriales + totalServicios + (cotizacion.costo_equipo || 0)) * cotizacion.gastos_generales / 100)).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            {cotizacion.margen_ganancia > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Margen de Ganancia ({cotizacion.margen_ganancia}%):</span>
                                    <span className="text-white">
                                        ${(( (totalMateriales + totalServicios + (cotizacion.costo_equipo || 0)) * (1 + cotizacion.gastos_generales / 100) ) * cotizacion.margen_ganancia / 100).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
                                <span className="text-lg font-bold text-white">TOTAL FINAL</span>
                                <span className="text-3xl font-black text-emerald-400">
                                    ${parseFloat(cotizacion.total).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones finales */}
                <div className="mt-8 flex justify-end gap-4">
                    <Link
                        to={`/cotizaciones/${cotizacion.ID_cotizacion}/editar`}
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold shadow-sm"
                    >
                        <Edit size={16} />
                        Editar Cotización
                    </Link>
                    <button
                        onClick={() => alert('Funcionalidad de PDF próximamente')}
                        className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-xl hover:bg-slate-900 transition-all font-semibold shadow-md"
                    >
                        <FileDown size={16} />
                        Generar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CotizacionDetalle;