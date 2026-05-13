// src/components/ModalMaterial.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import api from '../services/api';

const ModalMaterial = ({ isOpen, onClose, onSave, editingData }) => {
    const [categorias, setCategorias] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [selectedProveedor, setSelectedProveedor] = useState('');
    const [cantidad, setCantidad] = useState(1);
    //const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Cargar categorías al abrir (solo una vez)
    useEffect(() => {
        if (isOpen && !initialized) {
            const fetchCategorias = async () => {
                try {
                    const res = await api.get('/cotizaciones/categorias-materiales');
                    setCategorias(res.data);
                } catch (err) { console.error(err); }
            };
            fetchCategorias();
            setInitialized(true);
        }
        if (!isOpen) setInitialized(false);
    }, [isOpen, initialized]);

    const resetForm = () => {
        setSelectedCategoria('');
        setSelectedMaterial('');
        setSelectedProveedor('');
        setCantidad(1);
        setMateriales([]);
        setProveedores([]);
    };

    const fetchMateriales = async (catId) => {
        try {
            const res = await api.get(`/cotizaciones/materiales-por-categoria/${catId}`);
            setMateriales(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchProveedores = async (matId) => {
        try {
            const res = await api.get(`/cotizaciones/proveedores-por-material/${matId}`);
            setProveedores(res.data);
        } catch (err) { console.error(err); }
    };

    // Precargar datos de edición sin causar cascada
    useEffect(() => {
        if (isOpen && editingData) {
            setSelectedCategoria(editingData.categoria_id || '');
            setSelectedMaterial(editingData.material_id || '');
            setSelectedProveedor(editingData.abastecimiento_id || '');
            setCantidad(editingData.cantidad || 1);
            if (editingData.categoria_id) fetchMateriales(editingData.categoria_id);
            if (editingData.material_id) fetchProveedores(editingData.material_id);
        } else if (isOpen && !editingData) {
            resetForm();
        }
    }, [isOpen, editingData]);

    const handleCategoriaChange = (e) => {
        const catId = e.target.value;
        setSelectedCategoria(catId);
        setSelectedMaterial('');
        setSelectedProveedor('');
        setMateriales([]);
        setProveedores([]);
        if (catId) fetchMateriales(catId);
    };

    const handleMaterialChange = (e) => {
        const matId = e.target.value;
        setSelectedMaterial(matId);
        setSelectedProveedor('');
        setProveedores([]);
        if (matId) fetchProveedores(matId);
    };

    const handleSave = () => {
        if (!selectedProveedor || cantidad <= 0) {
            alert('Seleccione proveedor y cantidad válida');
            return;
        }
        const selectedProv = proveedores.find(p => p.ID_prod == selectedProveedor);
        if (!selectedProv) return;
        const material = materiales.find(m => m.id == selectedMaterial);
        const categoria = categorias.find(c => c.id == selectedCategoria);
        const data = {
            abastecimiento_id: selectedProveedor,
            material_id: selectedMaterial,
            proveedor_id: selectedProv.id,
            cantidad: cantidad,
            precio_unitario: selectedProv.precio,
            material_nombre: material?.text || 'Material',
            proveedor_nombre: selectedProv.text,
            unidad: material?.medidas || '',
            categoria_id: selectedCategoria,
            categoria_nombre: categoria?.text || ''
        };
        onSave(data);  // 👈 debe llamar a la función del padre
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{editingData ? 'Editar Material' : 'Agregar Material'}</h3>
                    <button onClick={onClose}><X size={24} />
                    </button>
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
                        <label className="block font-semibold mb-1">Material</label>
                        <select value={selectedMaterial} onChange={handleMaterialChange} disabled={!selectedCategoria} className="w-full border rounded-lg px-3 py-2">
                            <option value="">Seleccione...</option>
                            {materiales.map(m => <option key={m.id} value={m.id}>{m.text} ({m.medidas})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Proveedor</label>
                        <select value={selectedProveedor} onChange={(e) => setSelectedProveedor(e.target.value)} disabled={!selectedMaterial} className="w-full border rounded-lg px-3 py-2">
                            <option value="">Seleccione...</option>
                            {proveedores.map(p => <option key={p.ID_prod} value={p.ID_prod}>{p.text} - ${p.precio}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Cantidad</label>
                        <input type="number" step="0.01" min="0" value={cantidad} onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)} className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    {/* // Reemplaza el botón actual con este código */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("👉 Botón Guardar clickeado");
                            if (!onSave) {
                                console.error("❌ onSave no está definida");
                                return;
                            }
                            if (!selectedProveedor || cantidad <= 0) {
                                alert('Seleccione proveedor y cantidad válida');
                                return;
                            }
                            console.log("✅ Validación pasada, llamando a onSave...");
                            handleSave(); // o copia directamente la lógica de handleSave aquí para evitar errores de función
                        }}
                        className="w-full bg-slate-700 text-white py-2 rounded-lg mt-2">
                            Guardar
                        </button>
                    
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalMaterial;