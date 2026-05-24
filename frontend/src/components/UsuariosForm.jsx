// src/components/UsuariosForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, UserPlus } from 'lucide-react';
import api from '../services/api';

const UsuariosForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user'
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            const fetchUsuario = async () => {
                try {
                    const response = await api.get(`/users/${id}`);
                    const { name, email, role } = response.data;
                    setFormData({ name, email, password: '', password_confirmation: '', role });
                } catch (err) {
                    setError('Error al cargar usuario');
                    console.log(err);
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchUsuario();
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

        if (!isEditing && formData.password !== formData.password_confirmation) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                email: formData.email || null,
                role: formData.role,
            };
            if (formData.password) {
                payload.password = formData.password;
            }
            if (isEditing) {
                await api.put(`/users/${id}`, payload);
            } else {
                await api.post('/users', payload);
            }
            navigate('/usuarios');
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al guardar usuario';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="text-center py-20">Cargando...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <UserPlus size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
                        <p className="text-xl text-slate-300">{isEditing ? 'Modifica los datos del usuario' : 'Crea una nueva cuenta de acceso'}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link to="/usuarios" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver a Usuarios
                </Link>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r-lg shadow-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">Nombre completo *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">Correo electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">Opcional, solo si el usuario usará correo para recuperar contraseña.</p>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">
                                    Contraseña {isEditing ? '(dejar en blanco para no cambiar)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!isEditing}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">
                                    Confirmar contraseña {isEditing ? '(si se cambia)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required={!isEditing}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">Rol *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                >
                                    <option value="user">Usuario normal</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-700 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={20} />
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
                            </button>
                            <Link
                                to="/usuarios"
                                className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
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

export default UsuariosForm;