import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Briefcase } from 'lucide-react';
import api from '../services/api';

const ProyectosForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        fk_id_cliente: '',
        estado: '1',
        fecha_ini: '',
        fecha_fin: '',
        presupuesto: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await api.get('/proyectos/clientes');
                setClientes(response.data);
            } catch (err) {
                setError('Error al cargar clientes');
                console.log(err);
            }
        };
        fetchClientes();

        if (isEditing) {
            const fetchProyecto = async () => {
                try {
                    const response = await api.get(`/proyectos/${id}`);
                    const { nombre, fk_id_cliente, estado, fecha_ini, fecha_fin, presupuesto } = response.data;
                    setFormData({
                        nombre,
                        fk_id_cliente: fk_id_cliente.toString(),
                        estado: estado.toString(),
                        fecha_ini: fecha_ini ? fecha_ini.split('T')[0] : '',
                        fecha_fin: fecha_fin ? fecha_fin.split('T')[0] : '',
                        presupuesto: presupuesto.toString()
                    });
                } catch (err) {
                    setError('Error al cargar proyecto');
                    console.log(err);
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchProyecto();
        } else {
            setFetchLoading(false);
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //handle modificado
   const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.fecha_fin && formData.fecha_fin < formData.fecha_ini) {
        setError('La fecha de fin no puede ser anterior a la fecha de inicio');
        return;
    }

    setLoading(true);

    try {
        if (isEditing) {
            await api.put(`/proyectos/${id}`, formData);
        } else {
            await api.post('/proyectos', formData);
        }
        navigate('/proyectos');
    } catch (err) {
        const msg = err.response?.data?.message || 'Error al guardar proyecto';
        setError(msg);
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
                        <Briefcase size={64} className="mx-auto mb-4" />
                        <h1 className="text-5xl font-bold mb-2">{isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h1>
                        <p className="text-xl text-slate-300">
                            {isEditing ? 'Actualiza la información del proyecto' : 'Registra un nuevo proyecto'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link to="/proyectos" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-8">
                    <ArrowLeft size={20} className="mr-2" />
                    Volver a Proyectos
                </Link>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Nombre del Proyecto *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                required
                                maxLength="50"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Cliente *</label>
                            <select
                                name="fk_id_cliente"
                                value={formData.fk_id_cliente}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                                required
                            >
                                <option value="">Seleccione un cliente</option>
                                {clientes.map((cli) => (
                                    <option key={cli.ID_cliente} value={cli.ID_cliente}>
                                        {cli.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Estado *</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                required
                            >
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Fecha de Inicio *</label>
                            <input
                                type="date"
                                name="fecha_ini"
                                value={formData.fecha_ini}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Fecha de Fin</label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formData.fecha_fin}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                min={formData.fecha_ini}

                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">Presupuesto *</label>
                            <input
                                type="number"
                                step="0.01"
                                name="presupuesto"
                                value={formData.presupuesto}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                                required
                                min="0"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-8 py-3 rounded-lg hover:shadow-lg disabled:opacity-50"
                            >
                                <Save size={20} />
                                {loading ? (isEditing ? 'Actualizando...' : 'Guardando...') : (isEditing ? 'Actualizar Proyecto' : 'Guardar Proyecto')}
                            </button>
                            <Link
                                to="/proyectos"
                                className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
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

export default ProyectosForm;