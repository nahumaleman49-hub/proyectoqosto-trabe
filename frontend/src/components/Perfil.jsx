// src/components/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, UserCircle } from 'lucide-react';
import api from '../services/api';
import { getUser, isAdmin } from '../utils/auth';

const Perfil = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                const { name, email } = response.data;
                setFormData(prev => ({ ...prev, name, email: email || '' }));
            } catch (err) {
                setError('Error al cargar perfil');
                console.log(err);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validar que nueva contraseña y confirmación coincidan
        if (formData.new_password !== formData.new_password_confirmation) {
            setError('Las nuevas contraseñas no coinciden');
            setLoading(false);
            return;
        }

        // Construir payload (solo enviar contraseña si se completó)
        const payload = {
            name: formData.name,
            email: formData.email || null,
        };
        if (formData.current_password || formData.new_password) {
            if (!formData.current_password) {
                setError('La contraseña actual es requerida para cambiar la contraseña');
                setLoading(false);
                return;
            }
            payload.current_password = formData.current_password;
            payload.new_password = formData.new_password;
        }

        try {
            await api.put('/users/profile', payload);
            setSuccess('Perfil actualizado correctamente');
            // Actualizar el nombre en localStorage si cambió
            const currentUser = getUser();
            currentUser.name = formData.name;
            localStorage.setItem('user', JSON.stringify(currentUser));
            // Limpiar campos de contraseña
            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            }));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al actualizar perfil';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const backRoute = isAdmin() ? '/home' : '/dashboard';

    if (fetchLoading) return <div className="text-center py-20">Cargando perfil...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <UserCircle size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Mi Perfil</h1>
                        <p className="text-xl text-slate-300">Administra tu información personal</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link to={backRoute} className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver al {isAdmin() ? 'Inicio' : 'Dashboard'}
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

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-2">Nombre de usuario</label>
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
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <h3 className="text-lg font-semibold text-slate-800 mb-3">Cambiar contraseña</h3>

                                <div className="mb-4">
                                    <label className="block text-slate-700 font-semibold mb-2">Contraseña actual *</label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-slate-700 font-semibold mb-2">Nueva contraseña</label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-semibold mb-2">Confirmar nueva contraseña</label>
                                    <input
                                        type="password"
                                        name="new_password_confirmation"
                                        value={formData.new_password_confirmation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                            >
                                <Save size={20} className="inline mr-2" />
                                {loading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Perfil;