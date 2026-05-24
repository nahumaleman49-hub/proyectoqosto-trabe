// src/components/ModalServicio.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import api from '../services/api';

const ModalServicio = ({ isOpen, onClose, onSave, editingData }) => {
    const [categorias, setCategorias] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedServicio, setSelectedServicio] = useState('');
    const [selectedProveedor, setSelectedProveedor] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (isOpen && !initialized) {
            const fetchCategorias = async () => {
                try {
                    const res = await api.get('/cotizaciones/categorias-servicios');
                    setCategorias(res.data);
                } catch (err) { console.error(err); }
            };
            setInitialized(true);
            fetchCategorias();
        }
        if (!isOpen) setInitialized(false);
    }, [isOpen, initialized]);

    const resetForm = () => {
        setSelectedCategoria('');
        setSelectedServicio('');
        setSelectedProveedor('');
        setCantidad(1);
        setServicios([]);
        setProveedores([]);
    };

    const fetchServicios = async (catId) => {
        try {
            const res = await api.get(`/cotizaciones/servicios-por-categoria/${catId}`);
            setServicios(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProveedores = async (servId) => {
        try {
            const res = await api.get(`/cotizaciones/proveedores-por-servicio/${servId}`);
            setProveedores(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (isOpen && editingData) {
            setSelectedCategoria(editingData.categoria_id || '');
            setSelectedServicio(editingData.servicio_id || '');
            setSelectedProveedor(editingData.mano_obra_id || '');
            setCantidad(editingData.cantidad || 1);
            if (editingData.categoria_id) fetchServicios(editingData.categoria_id);
            if (editingData.servicio_id) fetchProveedores(editingData.servicio_id);
        } else if (isOpen && !editingData) {
            resetForm();
        }
    }, [isOpen, editingData]);

    const handleCategoriaChange = (e) => {
        const catId = e.target.value;
        setSelectedCategoria(catId);
        setSelectedServicio('');
        setSelectedProveedor('');
        setServicios([]);
        setProveedores([]);
        if (catId) fetchServicios(catId);
    };

    const handleServicioChange = (e) => {
        const servId = e.target.value;
        setSelectedServicio(servId);
        setSelectedProveedor('');
        setProveedores([]);
        if (servId) fetchProveedores(servId);
    };

    const handleSave = () => {
        console.log("handle save ejecutandose en modal")
        if (!selectedProveedor || cantidad <= 0) {
            alert('Seleccione proveedor y cantidad válida');
            return;
        }
        const selectedProv = proveedores.find(p => p.id == selectedProveedor);
        if (!selectedProv) return;
        const servicio = servicios.find(s => s.id == selectedServicio);
        const categoria = categorias.find(c => c.id == selectedCategoria);
        const data = {
            mano_obra_id: selectedProveedor,
            servicio_id: selectedServicio,
            cantidad: cantidad,
            precio_unitario: selectedProv.precio,
            servicio_nombre: servicio?.text || 'Servicio',
            proveedor_nombre: selectedProv.text,
            unidad: selectedProv.unidad || '',
            categoria_id: selectedCategoria,
            categoria_nombre: categoria?.text || ''
        };
        onSave(data);
    };

    if (!isOpen) return null;
console.log("ModalMaterial recibió onSave:", typeof onSave);
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{editingData ? 'Editar Servicio' : 'Agregar Servicio'}</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-1">Categoría</label>
                        <select value={selectedCategoria} onChange={handleCategoriaChange} className="w-full border rounded-lg px-3 py-2">
                            <option value="">Seleccione...</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Servicio</label>
                        <select value={selectedServicio} onChange={handleServicioChange} disabled={!selectedCategoria} className="w-full border rounded-lg px-3 py-2">
                            <option value="">Seleccione...</option>
                            {servicios.map(s => <option key={s.id} value={s.id}>{s.text}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Proveedor</label>
                        <select value={selectedProveedor} onChange={(e) => setSelectedProveedor(e.target.value)} disabled={!selectedServicio} className="w-full border rounded-lg px-3 py-2">
                            <option value="">Seleccione...</option>
                            {proveedores.map(p => <option key={p.id} value={p.id}>{p.text} - ${p.precio}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Cantidad</label>
                        <input type="number" step="0.01" min="0" value={cantidad} onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <button type="button" onClick={handleSave} className="w-full bg-slate-700 text-white py-2 rounded-lg mt-2">Guardar</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalServicio;