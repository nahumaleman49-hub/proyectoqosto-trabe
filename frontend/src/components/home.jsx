import { FileText, Package, Box, Users, Briefcase, ArrowRight, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/images/logo.jpeg';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Limpiar almacenamiento local
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirigir al login
        navigate('/login');
        // Opcional: recargar la página para asegurar limpieza de estado
        // window.location.href = '/login';
    };


    const cards = [
        { to: '/cotizaciones', icon: FileText, title: 'Cotizaciones', desc: 'Obtén estimados de proyectos', gradient: 'from-slate-700 to-slate-800' },
        { to: '/proveedores', icon: Package, title: 'Proveedores', desc: 'Encuentra socios confiables', gradient: 'from-slate-600 to-slate-700' },
        { to: '/materiales', icon: Box, title: 'Materiales', desc: 'Explora productos de calidad', gradient: 'from-slate-700 to-slate-800' },
        { to: '/mano-de-obra', icon: Users, title: 'Mano de Obra', desc: 'Contrata trabajadores calificados', gradient: 'from-slate-600 to-slate-700' },
        { to: '/clientes', icon: Users, title: 'Clientes', desc: 'Administra tus clientes', gradient: 'from-slate-600 to-slate-700' },
        { to: '/proyectos', icon: Briefcase, title: 'Proyectos', desc: 'Administra tus proyectos', gradient: 'from-slate-700 to-slate-800' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Barra superior con logo Trabe a la izquierda y botones a la derecha */}
                <div className="flex justify-between items-center mb-8">
                    {/* Bloque de texto "TRABE INGENIERÍA INDUSTRIAL QUÍMICA CARACTERÍSTICAS" (puede ser logo) */}
                    <div className="text-left">
                        <p className="text-white text-sm font-mono tracking-wider leading-tight">
                            TRABE<br />
                            INGENIERÍA<br />
                            INDUSTRIAL<br />
                            QUÍMICA<br />
                            CARACTERÍSTICAS
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            to="/perfil"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all"
                        >
                            <User size={18} />
                            <span>Mi Perfil</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all"
                        >
                            <LogOut size={18} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>

                {/* Área de marca principal */}
                <div className="text-center my-12">
                    <img src={logo} alt="Trabe Ingeniería" className="w-auto h-32 mx-auto mb-4" />
                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-2">QOSTO</h1>
                    <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
                        Tu puerta de acceso a la excelencia en construcción, diseño y arquitectura
                    </p>
                </div>

                {/* Grid de tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.to}
                                to={card.to}
                                className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${card.gradient}`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{card.title}</h2>
                                    <p className="text-slate-500 mb-4">{card.desc}</p>
                                    <div className="flex items-center text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                                        <span>Explorar</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {/* Espacio extra para asegurar scroll si es necesario */}
                <div className="h-4" />
            </div>
        </div>
    );
};

export default Home;