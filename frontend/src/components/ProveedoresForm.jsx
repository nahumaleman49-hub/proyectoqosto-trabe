import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Truck, Link as LinkIcon, Trash2, Package, Wrench } from 'lucide-react';
import api from '../services/api';

const ProveedoresForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [formData, setFormData] = useState({
        nombre: '',
        nombre_contacto: '',
        telefono: '',
        correo_e: '',
        direccion: '',
        tipo: ''
    });
    const [materialesDisponibles, setMaterialesDisponibles] = useState([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [materialesVinculados, setMaterialesVinculados] = useState([]);
    const [serviciosVinculados, setServiciosVinculados] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ fk_id_material: '', precio: '' });
    const [newServicio, setNewServicio] = useState({ fk_id_servicio: '', unidad: '', precio: '' });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [matRes, servRes] = await Promise.all([
                    api.get('/proveedores/materiales'),
                    api.get('/proveedores/servicios')
                ]);
                setMaterialesDisponibles(matRes.data);
                setServiciosDisponibles(servRes.data);
            } catch (err) {
                setError('Error al cargar catálogos');
                console.log(err);
            }
        };
        fetchCatalogos();

        if (isEditing) {
            const fetchProveedor = async () => {
                try {
                    const response = await api.get(`/proveedores/${id}`);
                    const { nombre, nombre_contacto, telefono, correo_e, direccion, tipo, materiales, servicios } = response.data;
                    setFormData({ nombre, nombre_contacto, telefono, correo_e, direccion, tipo });
                    setMaterialesVinculados(materiales || []);
                    setServiciosVinculados(servicios || []);
                } catch (err) {
                    setError('Error al cargar proveedor');
                    console.log(err);
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchProveedor();
        } else {
            setFetchLoading(false);
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditing) {
                await api.put(`/proveedores/${id}`, formData);
            } else {
                await api.post('/proveedores', formData);
            }
            navigate('/proveedores');
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al guardar proveedor';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Vinculación de material
    const handleVincularMaterial = async (e) => {
        e.preventDefault();
        if (!newMaterial.fk_id_material || !newMaterial.precio) {
            alert('Selecciona un material y precio');
            return;
        }
        try {
            await api.post('/proveedores/vincular-material', {
                fk_id_proveedor: id,
                fk_id_material: newMaterial.fk_id_material,
                precio: newMaterial.precio
            });
            // Recargar datos del proveedor para actualizar la lista
            const response = await api.get(`/proveedores/${id}`);
            setMaterialesVinculados(response.data.materiales || []);
            setNewMaterial({ fk_id_material: '', precio: '' });
            setSuccess('Material vinculado/actualizado');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al vincular material');
            console.log(err);
        }
    };

    const handleDesvincularMaterial = async (materialId) => {
        if (!confirm('¿Desvincular este material?')) return;
        try {
            await api.delete(`/proveedores/desvincular-material/${id}/${materialId}`);
            const response = await api.get(`/proveedores/${id}`);
            setMaterialesVinculados(response.data.materiales || []);
            setSuccess('Material desvinculado');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al desvincular');
            console.log(err);
        }
    };

    // Vinculación de servicio
    const handleVincularServicio = async (e) => {
        e.preventDefault();
        if (!newServicio.fk_id_servicio || !newServicio.unidad || !newServicio.precio) {
            alert('Completa todos los campos del servicio');
            return;
        }
        try {
            await api.post('/proveedores/vincular-servicio', {
                fk_id_proveedor: id,
                fk_id_servicio: newServicio.fk_id_servicio,
                unidad: newServicio.unidad,
                precio: newServicio.precio
            });
            const response = await api.get(`/proveedores/${id}`);
            setServiciosVinculados(response.data.servicios || []);
            setNewServicio({ fk_id_servicio: '', unidad: '', precio: '' });
            setSuccess('Servicio vinculado/actualizado');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al vincular servicio');
            console.log(err);
        }
    };

    const handleDesvincularServicio = async (servicioId) => {
        if (!confirm('¿Desvincular este servicio?')) return;
        try {
            await api.delete(`/proveedores/desvincular-servicio/${id}/${servicioId}`);
            const response = await api.get(`/proveedores/${id}`);
            setServiciosVinculados(response.data.servicios || []);
            setSuccess('Servicio desvinculado');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al desvincular');
            console.log(err);
        }
    };

    if (fetchLoading) return <div className="text-center py-20">Cargando datos...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Truck size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h1>
                        <p className="text-xl text-slate-300">{isEditing ? formData.nombre : 'Registra un nuevo proveedor'}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {success && <div className="mb-4 bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded">{success}</div>}
                {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

                <Link to="/proveedores" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver a Proveedores
                </Link>

                {/* Formulario principal */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2">Nombre de la Empresa *</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required maxLength="50" className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2">Tipo *</label>
                                    <select name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="Materiales">Materiales</option>
                                        <option value="Servicios">Servicios (Mano de obra)</option>
                                        <option value="Ambos">Ambos</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2">Nombre de Contacto *</label>
                                    <input type="text" name="nombre_contacto" value={formData.nombre_contacto} onChange={handleChange} required maxLength="50" className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2">Teléfono *</label>
                                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2">Correo Electrónico *</label>
                                    <input type="email" name="correo_e" value={formData.correo_e} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">Dirección *</label>
                                <textarea name="direccion" rows="2" value={formData.direccion} onChange={handleChange} required maxLength="80" className="w-full px-4 py-3 border border-slate-300 rounded-lg"></textarea>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg hover:shadow-lg disabled:opacity-50">
                                <Save size={20} />
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Información' : 'Guardar Proveedor')}
                            </button>
                        </div>
                    </form>
                </div>

                {isEditing && (
                    <>
                        {/* Sección de Materiales (si aplica) */}
                        {(formData.tipo === 'Materiales' || formData.tipo === 'Ambos') && (
                            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 mb-8">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                    <Package size={24} className="mr-3 text-indigo-500" />
                                    Gestión de Materiales
                                </h3>

                                {/* Formulario para vincular material */}
                                <form onSubmit={handleVincularMaterial} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                                    <input type="hidden" name="fk_id_proveedor" value={id} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Material</label>
                                            <select
                                                value={newMaterial.fk_id_material}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, fk_id_material: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                required
                                            >
                                                <option value="">Seleccione...</option>
                                                {materialesDisponibles.map(mat => (
                                                    <option key={mat.ID_Material} value={mat.ID_Material}>{mat.nombre} ({mat.codigo})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Precio ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newMaterial.precio}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, precio: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <button type="submit" className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                                                <LinkIcon size={16} /> Vincular / Actualizar
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                {/* Tabla de materiales vinculados */}
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100 text-slate-600 text-sm uppercase">
                                            <tr>
                                                <th className="py-3 px-4">Código</th>
                                                <th className="py-3 px-4">Material</th>
                                                <th className="py-3 px-4">Medida</th>
                                                <th className="py-3 px-4 text-right">Precio</th>
                                                <th className="py-3 px-4 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {materialesVinculados.length === 0 ? (
                                                <tr><td colSpan="5" className="py-8 text-center text-slate-500">Sin materiales vinculados.</td></tr>
                                            ) : (
                                                materialesVinculados.map(mat => (
                                                    <tr key={mat.ID_prod} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-3 px-4 text-slate-500">{mat.codigo}</td>
                                                        <td className="py-3 px-4 font-semibold">{mat.nombre}</td>
                                                        <td className="py-3 px-4 text-slate-600">{mat.medidas}</td>
                                                        <td className="py-3 px-4 text-emerald-600 font-bold text-right">${parseFloat(mat.precio).toFixed(2)}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button onClick={() => handleDesvincularMaterial(mat.ID_Material)} className="text-red-500 hover:text-red-700 p-2" title="Desvincular">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Sección de Servicios (si aplica) */}
                        {(formData.tipo === 'Servicios' || formData.tipo === 'Ambos') && (
                            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                                    <Wrench size={24} className="mr-3 text-amber-500" />
                                    Gestión de Mano de Obra
                                </h3>

                                <form onSubmit={handleVincularServicio} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                                    <input type="hidden" name="fk_id_proveedor" value={id} />
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Servicio</label>
                                            <select
                                                value={newServicio.fk_id_servicio}
                                                onChange={(e) => setNewServicio({ ...newServicio, fk_id_servicio: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                required
                                            >
                                                <option value="">Seleccione...</option>
                                                {serviciosDisponibles.map(serv => (
                                                    <option key={serv.ID_servicio} value={serv.ID_servicio}>{serv.nombre} ({serv.categoria || 'Sin categoría'})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Unidad</label>
                                            <input
                                                type="text"
                                                value={newServicio.unidad}
                                                onChange={(e) => setNewServicio({ ...newServicio, unidad: e.target.value })}
                                                placeholder="Ej. Hora, M2"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Precio ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newServicio.precio}
                                                onChange={(e) => setNewServicio({ ...newServicio, precio: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <button type="submit" className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                                                <LinkIcon size={16} /> Vincular / Actualizar
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100 text-slate-600 text-sm uppercase">
                                            <tr>
                                                <th className="py-3 px-4">Servicio</th>
                                                <th className="py-3 px-4">Categoría</th>
                                                <th className="py-3 px-4 text-right">Precio</th>
                                                <th className="py-3 px-4 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {serviciosVinculados.length === 0 ? (
                                                <tr><td colSpan="4" className="py-8 text-center text-slate-500">Sin servicios vinculados.</td></tr>
                                            ) : (
                                                serviciosVinculados.map(serv => (
                                                    <tr key={serv.ID_mano_obra} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-3 px-4 font-semibold">{serv.nombre}</td>
                                                        <td className="py-3 px-4 text-slate-500">{serv.categoria || 'N/A'}</td>
                                                        <td className="py-3 px-4 text-emerald-600 font-bold text-right">${parseFloat(serv.precio).toFixed(2)} / {serv.unidad}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button onClick={() => handleDesvincularServicio(serv.ID_servicio)} className="text-red-500 hover:text-red-700 p-2">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProveedoresForm;