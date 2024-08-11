import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getStock, updateProduct } from '../../helpers/firebase';
import styles from './EnviosPage.module.css';

const objectives = ['Banco', 'Aeropuerto', 'Triunfo Seguros', 'Cruz del Sur', 'IAF', 'IERIC'];

function EnviosPage() {
  const [products, setProducts] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ product: '', quantity: '' });

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    const stockData = await getStock();
    setProducts(stockData);
  };

  const handleAddProduct = () => {
    if (selectedProduct.product && selectedProduct.quantity) {
      setSelectedItems([...selectedItems, { ...selectedProduct, quantity: Number(selectedProduct.quantity) }]);
      setSelectedProduct({ product: '', quantity: '' });
    }
  };

  const handleSendItems = async () => {
    if (selectedItems.length > 0) {
      const result = await Swal.fire({
        title: '¿Estás seguro de enviar estos insumos?',
        text: "No podrás deshacer esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        // Descontar productos del stock
        for (const item of selectedItems) {
          const product = products.find(p => p.name === item.product);
          if (product) {
            const newStock = Number(product.quantity) - item.quantity;
            await updateProduct(product.id, { ...product, quantity: newStock.toString() });
          }
        }

        fetchStock(); // Actualizar stock después de envío

        Swal.fire('Envío registrado', 'Los insumos han sido descontados del stock.', 'success');
        setSelectedItems([]); // Limpiar la lista de insumos seleccionados
      }
    } else {
      Swal.fire('Lista vacía', 'No has seleccionado ningún insumo.', 'info');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Gestión de Envíos</h1>
      <div className={styles.form}>
        <select
          value={selectedObjective}
          onChange={(e) => setSelectedObjective(e.target.value)}
        >
          <option value="">Seleccionar Objetivo</option>
          {objectives.map((objective, index) => (
            <option key={index} value={objective}>
              {objective}
            </option>
          ))}
        </select>
        <select
          value={selectedProduct.product}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, product: e.target.value })}
        >
          <option value="">Seleccionar Producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.name}>
              {product.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          value={selectedProduct.quantity}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: e.target.value })}
        />
        <button onClick={handleAddProduct}>Agregar Producto</button>
        <button onClick={handleSendItems}>Enviar Insumos</button>
      </div>
      <div className={styles.shipmentItems}>
        {selectedItems.map((item, index) => (
          <div key={index} className={styles.shipmentItem}>
            <span>{item.product}</span>
            <span>{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnviosPage;
