import { useState, useEffect } from 'react';
import styles from './StockPage.module.css';
import Swal from 'sweetalert2';
import { getStock, addProduct, updateProduct, deleteProduct } from '../../helpers/firebase';
import editIcon from '../../../img/edit.svg';
import deleteIcon from '../../../img/delete.svg';
import stockIcon from '../../../img/stock.svg'; // Asegúrate de tener este archivo en la ruta adecuada

function StockPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '' });
  const [editProduct, setEditProduct] = useState({ id: '', name: '', quantity: '' });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

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
      setIsModalOpen(false); // Cerrar el modal después de agregar
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

  // Filtrar productos por el término de búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1>Gestión de Stock en Depósito</h1>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar producto"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.editForm}
      />

      {/* Botón para abrir el modal de agregar producto */}
      <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>Agregar Producto</button>

      {/* Modal para agregar producto */}
{isModalOpen && (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <span className={styles.close} onClick={() => setIsModalOpen(false)}>&times;</span> {/* Cerrar modal */}
      <h2>Nuevo Producto</h2>
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
  </div>
)}


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

      <div className={styles.stockTable}>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>
                  <img src={editIcon} alt="Editar" onClick={() => handleEditClick(product)} className={styles.icon} />
                  <img src={deleteIcon} alt="Eliminar" onClick={() => handleDeleteProduct(product.id)} className={styles.icon} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockPage;
