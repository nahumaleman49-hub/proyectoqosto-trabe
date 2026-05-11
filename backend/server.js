require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/clienteRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/proyectos', proyectoRoutes);

// Manejador de errores global (opcional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});