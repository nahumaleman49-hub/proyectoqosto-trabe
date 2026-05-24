// src/components/CotizacionForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../services/api';
import ModalMaterial from './ModalMaterial';
import ModalServicio from './ModalServicio';

const CotizacionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState('');

    // Datos del proyecto y cliente
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [telefonoCliente, setTelefonoCliente] = useState('');
    const [emailCliente, setEmailCliente] = useState('');
    const [clientesList, setClientesList] = useState([]);
    const [estado, setEstado] = useState(0); // 0 = Borrador por defecto

    // Materiales y servicios (items)
    const [materialesItems, setMaterialesItems] = useState([]);
    const [serviciosItems, setServiciosItems] = useState([]);

    // Costos adicionales
    const [costoEquipo, setCostoEquipo] = useState(0);
    const [gastosGenerales, setGastosGenerales] = useState(10);
    const [margenGanancia, setMargenGanancia] = useState(15);

    // Modales
    const [modalMaterialOpen, setModalMaterialOpen] = useState(false);
    const [modalServicioOpen, setModalServicioOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null); // { index, item }
    const [editingServicio, setEditingServicio] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

    // Cargar clientes y datos de cotización si es edición
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const res = await api.get('/cotizaciones/clientes');
                setClientesList(res.data);
            } catch (err) {
                console.error('Error cargando clientes', err);
            }
        };
        fetchClientes();

        if (isEditing) {
            const fetchCotizacion = async () => {
                try {
                    const res = await api.get(`/cotizaciones/${id}`);
                    const data = res.data;
                    if (data.estado !== undefined) {
                        setEstado(data.estado);}
                    setNombreProyecto(data.proyecto_nombre);
                    setClienteId(data.cliente_id);
                    setTelefonoCliente(data.telefono || '');
                    setEmailCliente(data.email || '');
                    setCostoEquipo(data.costo_equipo || 0);
                    setGastosGenerales(data.gastos_generales || 10);
                    setMargenGanancia(data.margen_ganancia || 15);
                    // Materiales existentes
                    if (data.materiales && data.materiales.length) {
                        const mats = data.materiales.map(m => ({
                            id_temp: m.ID_det_ab,
                            abastecimiento_id: m.fk_id_abastecimiento,
                            material_id: m.fk_id_material,
                            proveedor_id: m.fk_id_proveedor,
                            cantidad: m.cantidad,
                            precio_unitario: m.precio_unitario,
                            material_nombre: m.material_nombre,
                            proveedor_nombre: m.proveedor_nombre,
                            unidad: m.medidas
                        }));
                        setMaterialesItems(mats);
                    }
                    // Servicios existentes
                    if (data.servicios && data.servicios.length) {
                        const servs = data.servicios.map(s => ({
                            id_temp: s.ID_DetalleCotiza,
                            mano_obra_id: s.fk_id_mano_obra,
                            cantidad: s.cantidad,
                            precio_unitario: s.precio_unitario,
                            servicio_nombre: s.servicio_nombre,
                            proveedor_nombre: s.proveedor_nombre,
                            unidad: s.unidad
                        }));
                        setServiciosItems(servs);
                    }
                } catch (err) {
                    setError('Error al cargar cotización');
                    console.log(err);
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchCotizacion();
        } else {
            setFetchLoading(false);
        }
    }, [id, isEditing]);

    // Actualizar teléfono/email al cambiar cliente
    useEffect(() => {
        if (clienteId) {
            const cliente = clientesList.find(c => c.ID_cliente == clienteId);
            if (cliente) {
                setTelefonoCliente(cliente.telefono || '');
                setEmailCliente(cliente.email || '');
            }
        } else {
            setTelefonoCliente('');
            setEmailCliente('');
        }
    }, [clienteId, clientesList]);
    

    const agregarMaterial = (data) => {
    console.log("agregarMaterial ejecutándose con:", data);
    setMaterialesItems(prev => {
        const nuevo = [...prev, { id_temp: Date.now(), ...data }];
        console.log("Nuevo estado materialesItems:", nuevo);
        return nuevo;
    });
};

const actualizarMaterial = (index, data) => {
    console.log("actualizarMaterial ejecutándose, índice:", index, "data:", data);
    setMaterialesItems(prev => {
        const nuevo = prev.map((item, i) => i === index ? { ...item, ...data } : item);
        console.log("Estado actualizado:", nuevo);
        return nuevo;
    });
};

//     const handleMaterialSave = useCallback((data) => {
//     console.log("handleMaterialSave recibió:", data);
//     if (modalMode === 'edit' && editingMaterial !== null) {
//         actualizarMaterial(editingMaterial.idx, data);
//     } else {
//         agregarMaterial(data);
//     }
//     setModalMaterialOpen(false);
//     setEditingMaterial(null);
// }, [modalMode, editingMaterial, actualizarMaterial, agregarMaterial]);

    const eliminarMaterial = (index) => {
        if (window.confirm('¿Eliminar este material?')) {
            const nuevos = [...materialesItems];
            nuevos.splice(index, 1);
            setMaterialesItems(nuevos);
        }
    };

    // Funciones para manejar servicios
    const agregarServicio = (data) => {
        setServiciosItems([...serviciosItems, { id_temp: Date.now(), ...data }]);
    };
    const actualizarServicio = (index, data) => {
        const nuevos = [...serviciosItems];
        nuevos[index] = { ...nuevos[index], ...data };
        setServiciosItems(nuevos);
    };
    const eliminarServicio = (index) => {
        if (window.confirm('¿Eliminar este servicio?')) {
            const nuevos = [...serviciosItems];
            nuevos.splice(index, 1);
            setServiciosItems(nuevos);
        }
    };

    // Cálculo de totales
    const calcularTotales = () => {
        let totalMateriales = 0;
        materialesItems.forEach(m => totalMateriales += (m.cantidad || 0) * (m.precio_unitario || 0));
        let totalServicios = 0;
        serviciosItems.forEach(s => totalServicios += (s.cantidad || 0) * (s.precio_unitario || 0));
        const subtotalBase = totalMateriales + totalServicios + (costoEquipo || 0);
        const gastos = subtotalBase * (gastosGenerales / 100);
        const conGastos = subtotalBase + gastos;
        const margen = conGastos * (margenGanancia / 100);
        const total = conGastos + margen;
        return { totalMateriales, totalServicios, subtotalBase, gastos, margen, total };
    };

    const totals = calcularTotales();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Limpiamos y aseguramos que los IDs sean enteros y no vayan vacíos
    const materiales_json = materialesItems
        .filter(m => m.abastecimiento_id) // Ignoramos si por error hay alguno vacío
        .map(m => ({
            abastecimiento_id: parseInt(m.abastecimiento_id, 10), // Forzamos a que sea Número Entero
            cantidad: parseFloat(m.cantidad) || 0                 // Forzamos a que sea Decimal/Número
        }));

    const servicios_json = serviciosItems
        .filter(s => s.mano_obra_id) // Ignoramos si por error hay alguno vacío
        .map(s => ({
            mano_obra_id: parseInt(s.mano_obra_id, 10),
            cantidad: parseFloat(s.cantidad) || 0,
            precio_unitario: parseFloat(s.precio_unitario) || 0
        }));

    // 2. Construimos el payload de forma segura
    const payload = {
        nombre_proyecto: nombreProyecto,
        cliente_id: parseInt(clienteId, 10), // Aseguramos que sea entero para la BD
        costo_equipo: parseFloat(costoEquipo) || 0,
        gastos_generales: parseFloat(gastosGenerales) || 0,
        margen_ganancia: parseFloat(margenGanancia) || 0,
        estado: parseInt(estado, 10), 
        materiales_json: JSON.stringify(materiales_json),
        servicios_json: JSON.stringify(servicios_json)
    };

    console.log("✈️ Payload exacto enviado al backend:", payload);

    try {
        if (isEditing) {
            await api.put(`/cotizaciones/${id}`, payload);
        } else {
            await api.post('/cotizaciones', payload);
        }
        navigate('/cotizaciones');
    } catch (err) {
        console.error("❌ Error devuelto por el servidor:", err.response?.data);
        setError(err.response?.data?.message || 'Error al guardar cotización');
    } finally {
        setLoading(false);
    }
};

    if (fetchLoading) return <div className="text-center py-20">Cargando...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <Link to="/cotizaciones" className="inline-flex items-center text-white hover:text-slate-200 mb-4">
                        <ArrowLeft size={20} className="mr-2" /> Volver
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">📄</span>
                        <div>
                            <h1 className="text-4xl font-bold">{isEditing ? 'Editar Cotización' : 'Nueva Cotización'}</h1>
                            <p className="text-slate-300">Selecciona cliente, materiales y servicios</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>}

                    {/* Datos del proyecto */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Proyecto y Cliente</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-semibold mb-2">Nombre del Proyecto *</label>
                                <input type="text" value={nombreProyecto} onChange={(e) => setNombreProyecto(e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">Cliente *</label>
                                <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required className="w-full border rounded-lg px-4 py-2">
                                    <option value="">Seleccione cliente</option>
                                    {clientesList.map(c => <option key={c.ID_cliente} value={c.ID_cliente}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">Teléfono</label>
                                <input type="text" value={telefonoCliente} readOnly className="w-full border rounded-lg bg-gray-100 px-4 py-2" />
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">Correo electrónico</label>
                                <input type="email" value={emailCliente} readOnly className="w-full border rounded-lg bg-gray-100 px-4 py-2" />
                            </div>
                        </div>
                        {/* Estado de la Cotización */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                            <h2 className="text-2xl font-bold mb-4">Estado de la Cotización</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-semibold mb-2">Estado *</label>
                                    <select 
                                        value={estado} 
                                        onChange={(e) => setEstado(parseInt(e.target.value))}
                                        className="w-full border rounded-lg px-4 py-2"
                                        required
                                    >
                                        <option value="0">📄 Borrador</option>
                                        <option value="1">📨 Enviada</option>
                                        <option value="2">✅ Aprobada</option>
                                        <option value="3">❌ Rechazada</option>
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Selecciona el estado actual de esta cotización
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Materiales */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Materiales</h2>
                            <button type="button" onClick={() => { setModalMode('add'); setEditingMaterial(null); setModalMaterialOpen(true); }} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                <Plus size={16} /> Agregar material
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100">
                                    <tr><th className="text-left py-2 px-3">Material</th><th className="text-left py-2 px-3">Proveedor</th><th className="text-center py-2 px-3">Cantidad</th><th className="text-right py-2 px-3">P. Unit.</th><th className="text-right py-2 px-3">Subtotal</th><th className="text-center py-2 px-3">Acciones</th></tr>
                                </thead>
                                <tbody>
                                    {materialesItems.length === 0 ? <tr><td colSpan="6" className="text-center py-4 text-slate-400">No hay materiales agregados</td></tr> :
                                        materialesItems.map((item, idx) => (
                                            <tr key={item.id_temp} className="border-b">
                                                <td className="py-2 px-3">{item.material_nombre} ({item.unidad})</td>
                                                <td className="py-2 px-3">{item.proveedor_nombre}</td>
                                                <td className="py-2 px-3 text-center">{item.cantidad}</td>
                                                <td className="py-2 px-3 text-right">${item.precio_unitario.toFixed(2)}</td>
                                                <td className="py-2 px-3 text-right font-semibold">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <button type="button" onClick={() => { setModalMode('edit'); setEditingMaterial({ idx, item }); setModalMaterialOpen(true); }} className="text-blue-600 mr-2"><Edit size={18} /></button>
                                                    <button type="button" onClick={() => eliminarMaterial(idx)} className="text-red-600"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Servicios */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Servicios (Mano de obra)</h2>
                            <button type="button" onClick={() => { setModalMode('add'); setEditingServicio(null); setModalServicioOpen(true); }} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                <Plus size={16} /> Agregar servicio
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100">
                                    <tr><th className="text-left py-2 px-3">Servicio</th><th className="text-left py-2 px-3">Proveedor</th><th className="text-center py-2 px-3">Cantidad</th><th className="text-right py-2 px-3">P. Unit.</th><th className="text-right py-2 px-3">Subtotal</th><th className="text-center py-2 px-3">Acciones</th></tr>
                                </thead>
                                <tbody>
                                    {serviciosItems.length === 0 ? <tr><td colSpan="6" className="text-center py-4 text-slate-400">No hay servicios agregados</td></tr> :
                                        serviciosItems.map((item, idx) => (
                                            <tr key={item.id_temp} className="border-b">
                                                <td className="py-2 px-3">{item.servicio_nombre} ({item.unidad})</td>
                                                <td className="py-2 px-3">{item.proveedor_nombre}</td>
                                                <td className="py-2 px-3 text-center">{item.cantidad}</td>
                                                <td className="py-2 px-3 text-right">${item.precio_unitario.toFixed(2)}</td>
                                                <td className="py-2 px-3 text-right font-semibold">${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <button type="button" onClick={() => { setModalMode('edit'); setEditingServicio({ idx, item }); setModalServicioOpen(true); }} className="text-blue-600 mr-2"><Edit size={18} /></button>
                                                    <button type="button" onClick={() => eliminarServicio(idx)} className="text-red-600"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Costos adicionales */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Costos Adicionales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="block font-semibold mb-2">Costo de Equipo ($)</label><input type="number" step="0.01" value={costoEquipo} onChange={(e) => setCostoEquipo(parseFloat(e.target.value) || 0)} className="w-full border rounded-lg px-4 py-2" /></div>
                            <div><label className="block font-semibold mb-2">Gastos Generales (%)</label><input type="number" step="0.1" value={gastosGenerales} onChange={(e) => setGastosGenerales(parseFloat(e.target.value) || 0)} className="w-full border rounded-lg px-4 py-2" /></div>
                            <div><label className="block font-semibold mb-2">Margen de Ganancia (%)</label><input type="number" step="0.1" value={margenGanancia} onChange={(e) => setMargenGanancia(parseFloat(e.target.value) || 0)} className="w-full border rounded-lg px-4 py-2" /></div>
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Resumen</h2>
                        <div className="space-y-2 text-lg">
                            <div className="flex justify-between"><span>Subtotal Materiales:</span><span>${totals.totalMateriales.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Subtotal Servicios:</span><span>${totals.totalServicios.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Subtotal General:</span><span>${totals.subtotalBase.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>+ Gastos Generales ({gastosGenerales}%):</span><span>${totals.gastos.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>+ Margen de Ganancia ({margenGanancia}%):</span><span>${totals.margen.toFixed(2)}</span></div>
                            <div className="flex justify-between text-2xl font-bold pt-2 border-t"><span>Total Cotización:</span><span>${totals.total.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link to="/cotizaciones" className="border border-slate-300 px-6 py-2 rounded-lg">Cancelar</Link>
                        <button type="submit" disabled={loading} className="bg-slate-800 text-white px-6 py-2 rounded-lg disabled:opacity-50">{loading ? 'Guardando...' : (isEditing ? 'Actualizar Cotización' : 'Guardar Cotización')}</button>
                    </div>
                </form>
            </div>

            {/* Modales */}
            <ModalMaterial
                isOpen={modalMaterialOpen}
                onClose={() => setModalMaterialOpen(false)}
                onSave={(data) => {
                    console.log("🚀 Inicio onSave en padre");
                    console.log("modalMode:", modalMode);
                    console.log("editingMaterial:", editingMaterial);
                    console.log("data recibida:", data);
                    
                    if (modalMode === 'edit' && editingMaterial !== null) {
                        console.log("✏️ Editando material en índice", editingMaterial.idx);
                        actualizarMaterial(editingMaterial.idx, data);
                    } else {
                        console.log("➕ Agregando nuevo material");
                        agregarMaterial(data);
                    }                
                    console.log("🔄 Estado actualizado (debería cerrar modal)");
                    setTimeout(() => {
                        setModalMaterialOpen(false);
                        setEditingMaterial(null);
                    }, 50);
                    console.log("🏁 Fin onSave");
                }}
                editingData={modalMode === 'edit' ? editingMaterial?.item : null}
            />
            <ModalServicio 
                isOpen={modalServicioOpen} 
                onClose={() => setModalServicioOpen(false)} 
                onSave={(data) => {
                    console.log("onSave recibido en CotizacionForm", data); 
                    if (modalMode === 'edit' && editingServicio){
                        actualizarServicio(editingServicio.idx, data); 
                    }else {
                        agregarServicio(data);
                    }
                            console.log("Estado actualizado, cerrando modal...");

                    setTimeout(() => {
                        setModalMaterialOpen(false);
                        setEditingMaterial(null);
                    }, 10);
                }} 
                editingData={editingServicio?.item || null} />
        </div>
    );
};

export default CotizacionForm;