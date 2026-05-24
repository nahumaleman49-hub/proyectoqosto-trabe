// src/components/Usuarios.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Edit, Trash2, ArrowLeft, User, Mail, Shield } from 'lucide-react';
import api from '../services/api';
import { isAdmin, getUser } from '../utils/auth';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const currentUser = getUser();

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await api.get('/users');
            setUsuarios(response.data);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (id === currentUser.id) {
            alert('No puedes eliminar tu propio usuario');
            return;
        }
        if (!confirm(`¿Eliminar usuario "${name}"?`)) return;
        try {
            await api.delete(`/users/${id}`);
            setSuccess('Usuario eliminado correctamente');
            fetchUsuarios();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('No se pudo eliminar el usuario');
            console.log(err);
        }
    };

    if (loading) return <div className="text-center py-20">Cargando usuarios...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="relative h-64 overflow-hidden bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <Users size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">Gestión de Usuarios</h1>
                        <p className="text-xl text-slate-300">Administra las cuentas del sistema</p>
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
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">Usuarios Registrados</h2>
                            <p className="text-slate-600">Lista de todos los usuarios del sistema</p>
                        </div>
                        <Link to="/usuarios/nuevo" className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition flex items-center gap-2">
                            <Plus size={20} />
                            Nuevo Usuario
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-2">ID</th>
                                    <th className="text-left py-3 px-2">Nombre</th>
                                    <th className="text-left py-3 px-2">Email</th>
                                    <th className="text-left py-3 px-2">Rol</th>
                                    <th className="text-left py-3 px-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.length === 0 ? (
                                    <tr><td colSpan="5" className="py-8 text-center text-slate-500">No hay usuarios registrados.</td></tr>
                                ) : (
                                    usuarios.map(usuario => (
                                        <tr key={usuario.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-2">{usuario.id}</td>
                                            <td className="py-3 px-2 font-medium">{usuario.name}</td>
                                            <td className="py-3 px-2">{usuario.email || '-'}</td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${usuario.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {usuario.role === 'admin' ? 'Administrador' : 'Usuario'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/usuarios/${usuario.id}/editar`} className="text-slate-600 hover:text-slate-800">
                                                        <Edit size={20} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(usuario.id, usuario.name)}
                                                        className={`${usuario.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                                                        disabled={usuario.id === currentUser.id}
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;