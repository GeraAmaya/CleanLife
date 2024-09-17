import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getStock, addShipment, updateProduct } from '../../helpers/firebase';
import styles from './EnviosPage.module.css';

const objectives = ['Banco Nación- El Calafate','Banco Nación- Rio Gallegos','Banco Nación- Rio Turbio','Banco Nación- Caleta Olivia','Banco Nación- P.Deseado','Banco Nación- Las Heras','Banco Nación- San Julian', 'Banco Nación- 28 Noviembre','Banco Nación - Piedra Buena','Banco Nación - Pico Truncado','Banco Nación - Pto Santa Cruz', 'IAF', 'IERIC', 'Aeropuerto', 'Triunfo Seguros', 'CityBus', 'Enargas','Cruz Del Sur'];

function EnviosPage() {
  const [products, setProducts] = useState([]);
  const [newShipment, setNewShipment] = useState({ objective: '', items: [] });
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
      const product = products.find(p => p.name === selectedProduct.product);
      setNewShipment(prevState => ({
        ...prevState,
        items: [...prevState.items, { id: product.id, product: product.name, quantity: Number(selectedProduct.quantity) }]
      }));
      setSelectedProduct({ product: '', quantity: '' });
    }
  };

  const handleAddShipment = async () => {
    if (newShipment.objective && newShipment.items.length > 0) {
      let isStockAvailable = true;

      for (const item of newShipment.items) {
        const product = products.find(p => p.name === item.product);
        if (product.quantity < item.quantity) {
          isStockAvailable = false;
          Swal.fire({
            icon: 'error',
            title: 'Sin Stock',
            text: `No hay suficiente stock de ${product.name}. Solo quedan ${product.quantity} unidades.`,
          });
          break;
        }
      }

      if (isStockAvailable) {
        const result = await Swal.fire({
          title: '¿Estás seguro de enviar estos insumos?',
          text: "No podrás deshacer esta acción.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, enviar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          for (const item of newShipment.items) {
            const product = products.find(p => p.name === item.product);
            if (product) {
              const newStock = Number(product.quantity) - item.quantity;
              await updateProduct(product.id, { ...product, quantity: newStock });
            }
          }

          await addShipment(newShipment);

          await fetchStock();
          setNewShipment({ objective: '', items: [] });
          setSelectedProduct({ product: '', quantity: '' });

          Swal.fire('Envío registrado', 'Los insumos han sido descontados del stock.', 'success');
        }
      }
    } else {
      Swal.fire('Formulario incompleto', 'Debes seleccionar un objetivo y agregar al menos un producto.', 'warning');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Gestión de Envíos</h1>
      <div className={styles.form}>
        <select
          value={newShipment.objective}
          onChange={(e) => setNewShipment({ ...newShipment, objective: e.target.value })}
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
        <button onClick={handleAddShipment}>Registrar Envío</button>
      </div>
      <div className={styles.shipmentItems}>
        {newShipment.items.map((item, index) => (
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
