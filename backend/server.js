require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/clienteRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const materialRoutes = require('./routes/materialRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);

// Manejador de errores global (opcional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});