import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, UserCircle } from 'lucide-react';
import api from '../services/api';

const ClientesForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            const fetchCliente = async () => {
                try {
                    const response = await api.get(`/clientes/${id}`);
                    const { nombre, telefono, email, direccion } = response.data;
                    setFormData({ nombre, telefono, email, direccion });
                } catch (err) {
                    console.error(err);
                    setErrors({ general: 'Error al cargar cliente' });
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchCliente();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            if (isEditing) {
                await api.put(`/clientes/${id}`, formData);
            } else {
                await api.post('/clientes', formData);
            }
            navigate('/clientes');
        } catch (err) {
            if (err.response && err.response.status === 409) {
                const msg = err.response.data.message;
                if (msg.includes('nombre')) setErrors({ nombre: msg });
                else if (msg.includes('teléfono')) setErrors({ telefono: msg });
                else if (msg.includes('email')) setErrors({ email: msg });
                else setErrors({ general: msg });
            } else {
                setErrors({ general: 'Error al guardar el cliente' });
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="text-center py-20">Cargando datos...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <UserCircle size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>
                        <p className="text-xl text-slate-300">{isEditing ? 'Actualiza la información del cliente' : 'Registra un nuevo cliente'}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link to="/clientes" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver a Clientes
                </Link>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    {errors.general && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            {errors.general}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Nombre del Cliente *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.nombre ? 'border-red-500' : 'border-slate-300'}`}
                                placeholder="Ej: Juan García o Corporación ABC"
                                required
                                maxLength="50"
                            />
                            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Teléfono *</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.telefono ? 'border-red-500' : 'border-slate-300'}`}
                                placeholder="5551234567"
                                required
                            />
                            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                                placeholder="ejemplo@correo.com"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Dirección *</label>
                            <textarea
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                placeholder="Ej: Av. Reforma 123, Ciudad de México"
                                required
                                maxLength="80"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                            >
                                <Save size={20} />
                                {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar Cliente' : 'Guardar Cliente')}
                            </button>
                            <Link
                                to="/clientes"
                                className="inline-block px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClientesForm;