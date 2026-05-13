import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Briefcase, Plus, Trash2, Users } from 'lucide-react';
import api from '../services/api';

const ServiciosForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [formData, setFormData] = useState({
        nombre: '',
        fk_id_categoria: ''
    });
    const [categorias, setCategorias] = useState([]);
    const [proveedoresDisponibles, setProveedoresDisponibles] = useState([]);
    const [proveedoresVinculados, setProveedoresVinculados] = useState([]);
    const [newProveedor, setNewProveedor] = useState({ fk_id_proveedor: '', unidad: '', precio: '' });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [cats, provs] = await Promise.all([
                    api.get('/servicios/categorias'),
                    api.get('/servicios/proveedores')
                ]);
                setCategorias(cats.data);
                setProveedoresDisponibles(provs.data);
            } catch (err) {
                setError('Error al cargar catálogos');
                console.log(err);
            }
        };
        fetchCatalogos();

        if (isEditing) {
            const fetchServicio = async () => {
                try {
                    const response = await api.get(`/servicios/${id}`);
                    const { nombre, fk_id_categoria, proveedores } = response.data;
                    setFormData({ nombre, fk_id_categoria: fk_id_categoria?.toString() || '' });
                    setProveedoresVinculados(proveedores || []);
                } catch (err) {
                    setError('Error al cargar servicio');
                    console.log(err);
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchServicio();
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
                await api.put(`/servicios/${id}`, formData);
            } else {
                await api.post('/servicios', formData);
            }
            navigate('/servicios');
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al guardar servicio';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVincularProveedor = async (e) => {
        e.preventDefault();
        if (!newProveedor.fk_id_proveedor || !newProveedor.unidad || !newProveedor.precio) {
            alert('Seleccione un proveedor, unidad y precio');
            return;
        }
        try {
            await api.post('/servicios/vincular-proveedor', {
                fk_id_servicio: id,
                fk_id_proveedor: newProveedor.fk_id_proveedor,
                unidad: newProveedor.unidad,
                precio: newProveedor.precio
            });
            const response = await api.get(`/servicios/${id}`);
            setProveedoresVinculados(response.data.proveedores || []);
            setNewProveedor({ fk_id_proveedor: '', unidad: '', precio: '' });
            setSuccess('Proveedor vinculado/actualizado');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al vincular proveedor');
            console.log(err);
        }
    };

    const handleDesvincularProveedor = async (proveedorId) => {
        if (!confirm('¿Desvincular este proveedor del servicio?')) return;
        try {
            await api.delete(`/servicios/desvincular-proveedor/${id}/${proveedorId}`);
            const response = await api.get(`/servicios/${id}`);
            setProveedoresVinculados(response.data.proveedores || []);
            setSuccess('Proveedor desvinculado');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al desvincular');
            console.log(err);
        }
    };

    if (fetchLoading) return <div className="text-center py-20">Cargando datos...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Briefcase size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">{isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}</h1>
                        <p className="text-xl text-slate-300">{isEditing ? 'Actualiza la información y asigna mano de obra' : 'Registra un nuevo servicio base'}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link to="/servicios" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-6">
                    <ArrowLeft size={20} className="mr-2" /> Volver a Servicios
                </Link>

                {success && <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-lg mb-6">{success}</div>}
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6">{error}</div>}

                {/* Formulario base */}
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-4">
                        <Briefcase size={20} className="mr-2 text-indigo-500" /> Información Base
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-700 font-bold mb-2">Nombre del Servicio *</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required maxLength="50" className="w-full px-4 py-3 border border-slate-300 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-2">Categoría *</label>
                                <select name="fk_id_categoria" value={formData.fk_id_categoria} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 rounded-xl">
                                    <option value="">Seleccione una categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.ID_Categoria} value={cat.ID_Categoria}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button type="submit" disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl hover:bg-slate-900 disabled:opacity-50">
                                <Save size={20} /> {loading ? 'Guardando...' : (isEditing ? 'Actualizar Información Base' : 'Guardar Servicio')}
                            </button>
                            <Link to="/servicios" className="flex-1 inline-flex justify-center px-8 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50">
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>

                {isEditing && (
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-4">
                            <Users size={24} className="mr-3 text-emerald-500" />
                            Mano de Obra y Precios
                        </h3>

                        <form onSubmit={handleVincularProveedor} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Proveedor / Contratista *</label>
                                    <select
                                        value={newProveedor.fk_id_proveedor}
                                        onChange={(e) => setNewProveedor({ ...newProveedor, fk_id_proveedor: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        required
                                    >
                                        <option value="" disabled>Seleccione...</option>
                                        {proveedoresDisponibles.map(prov => (
                                            <option key={prov.ID_proveedor} value={prov.ID_proveedor}>{prov.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Unidad de Medida *</label>
                                    <input
                                        type="text"
                                        value={newProveedor.unidad}
                                        onChange={(e) => setNewProveedor({ ...newProveedor, unidad: e.target.value })}
                                        placeholder="Ej: hora, m2, día"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Precio ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newProveedor.precio}
                                        onChange={(e) => setNewProveedor({ ...newProveedor, precio: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1">
                                        <Plus size={16} /> Añadir
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800 text-white text-sm uppercase">
                                    <tr>
                                        <th className="py-3 px-4">Proveedor / Contratista</th>
                                        <th className="py-3 px-4">Unidad</th>
                                        <th className="py-3 px-4 text-right">Precio</th>
                                        <th className="py-3 px-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {proveedoresVinculados.length === 0 ? (
                                        <tr><td colSpan="4" className="py-8 text-center text-slate-500">Aún no has registrado quién realiza este servicio.</td></tr>
                                    ) : (
                                        proveedoresVinculados.map(prov => (
                                            <tr key={prov.ID_mano_obra} className="hover:bg-slate-50">
                                                <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                                                    <Users size={16} className="text-slate-400" /> {prov.nombre}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 font-medium">{prov.unidad}</td>
                                                <td className="py-3 px-4 text-emerald-600 font-bold text-right">${parseFloat(prov.precio).toFixed(2)}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <button onClick={() => handleDesvincularProveedor(prov.ID_proveedor)} className="text-red-500 hover:text-red-700 p-1" title="Desvincular">
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
            </div>
        </div>
    );
};

export default ServiciosForm;