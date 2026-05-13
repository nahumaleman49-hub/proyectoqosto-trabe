const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        // Validar campos
        if (!name || !password) {
            return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos' });
        }

        // Buscar usuario por nombre
        const user = await User.findByName(name);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña (con el hash de laravel que tambien es compatible con bcrypt)
        const isValid = await User.verifyPassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const token = generateToken(user);

        // Responder con token y datos del usuario (sin password)
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
// const getMe = async (req, res) => {
//     try {
//         // El usuario ya lo tenemos en req.user (desde middleware de autenticación)
//         const user = await User.findById(req.user.id);
//         if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
//         res.json({
//             id: user.id,
//             name: user.name,
//             email: user.email
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error en el servidor' });
//     }
// };

module.exports = { login };