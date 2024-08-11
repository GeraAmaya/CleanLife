import { useState, useEffect } from 'react';
import styles from './StockPage.module.css';
import Swal from 'sweetalert2';
import { getStock, addProduct, updateProduct, deleteProduct } from '../../helpers/firebase';

function StockPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '' });
  const [editProduct, setEditProduct] = useState({ id: '', name: '', quantity: '' });

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    const stockData = await getStock();
    setProducts(stockData);
  };

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.quantity) {
      await addProduct(newProduct);
      fetchStock();
      Swal.fire('Producto agregado', '', 'success');
      setNewProduct({ name: '', quantity: '' });
    }
  };

  const handleUpdateProduct = async () => {
    if (editProduct.id && editProduct.name && editProduct.quantity) {
      await updateProduct(editProduct.id, { name: editProduct.name, quantity: editProduct.quantity });
      fetchStock();
      Swal.fire('Producto actualizado', '', 'success');
      setEditProduct({ id: '', name: '', quantity: '' });
    }
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    fetchStock();
    Swal.fire('Producto eliminado', '', 'success');
  };

  return (
    <div className={styles.container}>
      <h1>Gestión de Stock</h1>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Nombre del Producto"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
        />
        <button onClick={handleAddProduct}>Agregar Producto</button>
      </div>
      <div className={styles.editForm}>
        {editProduct.id && (
          <>
            <input
              type="text"
              placeholder="Nombre del Producto"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={editProduct.quantity}
              onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
            />
            <button onClick={handleUpdateProduct}>Confirmar Edición</button>
          </>
        )}
      </div>
      <div className={styles.stockList}>
        {products.map((product) => (
          <div key={product.id} className={styles.productItem}>
            <span>{product.name}</span>
            <span>{product.quantity}</span>
            <button onClick={() => handleEditClick(product)}>Editar</button>
            <button onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockPage;
