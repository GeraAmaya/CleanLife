import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../helpers/firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa la librería para las tablas
import LOGO from '../../../img/logo.png'; // Asegúrate de que la ruta es correcta
import download from '../../../img/download.svg'
import styles from './BuscarPedidosPage.module.css';

const objetivos = ['Banco Nación- El Calafate', 'Banco Nación- Rio Gallegos', 'Banco Nación- Rio Turbio', 'Banco Nación- Caleta Olivia', 'Banco Nación- P.Deseado', 'Banco Nación- Las Heras', 'Banco Nación- San Julian', 'Banco Nación- 28 Noviembre', 'Banco Nación - Piedra Buena', 'Banco Nación - Pico Truncado', 'Banco Nación - Santa Cruz', 'IAF', 'IERIC', 'Aeropuerto', 'Pico Truncado', 'El Calafate', 'Triunfo Seguros', 'Cruz Del Sur','CityBus', 'Enargas'];

const BuscarPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtroObjetivo, setFiltroObjetivo] = useState('');

  useEffect(() => {
    const obtenerPedidos = async () => {
      if (filtroObjetivo) {
        const q = query(collection(db, 'pedidos'), where('objetivo', '==', filtroObjetivo));
        const querySnapshot = await getDocs(q);
        const pedidosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPedidos(pedidosList);
      }
    };

    obtenerPedidos();
  }, [filtroObjetivo]);

  const handleDownload = (pedido) => {
    const doc = new jsPDF();
  
    // Añadir el logo
    const logoWidth = 50;
    const logoHeight = 25;
    doc.addImage(LOGO, 'PNG', 10, 10, logoWidth, logoHeight);
  
    // Título
    doc.setFontSize(16);
    doc.text(`Pedido para: ${pedido.objetivo}`, 10, logoHeight + 20);
  
    // Campo de Fecha vacío (manual para completar)
    doc.setFontSize(12);
    doc.text('Fecha: ___/___/____', 10, logoHeight + 30);
  
    // Datos del pedido en tabla
    const tableData = pedido.productos.map(producto => [producto.producto, producto.cantidad > 0 ? producto.cantidad : 0]);
    doc.autoTable({
      startY: logoHeight + 40,
      head: [['Producto', 'Cantidad']],
      body: tableData,
      theme: 'grid', // Opcional: 'striped', 'grid', 'plain'
      margin: { horizontal: 10 }
    });
  
    // Añadir el apartado para firma
    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text('Firma Operario:', 10, finalY + 50);
  
    // Guardar el PDF
    doc.save(`Pedido_${pedido.objetivo}_${pedido.id}.pdf`);
  };
  

  return (
    <div className={styles.buscarPedidosContainer}>
      <h1>Buscar Pedidos</h1>
      <div className={styles.filtroContainer}>
        <select
          value={filtroObjetivo}
          onChange={(e) => setFiltroObjetivo(e.target.value)}
        >
          <option value="">Seleccionar Objetivo</option>
          {objetivos.map((objetivo, index) => (
            <option key={index} value={objetivo}>
              {objetivo}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.pedidosList}>
        {pedidos.length > 0 ? (
          <table className={styles.pedidosTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Objetivo</th>
                <th>Productos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{new Date(pedido.fecha.toDate()).toLocaleDateString()}</td>
                  <td>{pedido.objetivo}</td>
                  <td>
                    <ul>
                      {pedido.productos.map((producto, index) => (
                        <li key={index}>{producto.producto}:{producto.cantidad}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <button onClick={() => handleDownload(pedido)}> <img className={styles.icons} src={download} alt="descargar" /> </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No se encontraron pedidos.</p>
        )}
      </div>
    </div>
  );
}

export default BuscarPedidosPage;
