import { useState } from 'react';
import { login } from '../services/api';
import logo from '/images/logo.jpeg'; // Ajusta la ruta si no usas ?url, puedes importar así: import logo from '/images/logo.jpeg'

const Login = () => {
    const [formData, setFormData] = useState({ name: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { token, user } = await login(formData.name, formData.password);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = '/home';
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al iniciar sesión';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src={logo} alt="Trabe Ingeniería" className="w-auto h-40 mx-auto mb-6" />
                    <h1 className="text-5xl font-bold text-white mb-2">QOSTO</h1>
                    <p className="text-slate-300 text-lg">Gestión de Proyectos de Construcción</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoFocus
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Nombre de usuario"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Contraseña"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 rounded-lg hover:shadow-lg transition-shadow font-semibold text-lg disabled:opacity-50"
                        >
                            {loading ? 'Iniciando...' : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-sm mt-6">
                    © 2026 Trabe Ingeniería - Todos los derechos reservados
                </p>
            </div>
        </div>
    );
};

export default Login;