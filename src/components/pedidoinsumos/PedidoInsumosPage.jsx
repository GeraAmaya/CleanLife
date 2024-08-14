import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../helpers/firebase';
import styles from './PedidoInsumosPage.module.css';

const productos = ['Detergente', 'Lavandina', 'Blem', 'Desodorante de ambientes', 'Bolsas'];
const objetivos = ['Banco Nación-Turbio','Banco Nación- Caleta','Banco Nación- Deseado','Banco Nación- Las Heras','Banco Nación- San Julian', 'Banco Nación- 28 Noviembre', 'IAF', 'IERIC', 'Tarjeta TDF', 'Aeropuerto', 'Triunfo Seguros', 'CityBus'];
const localidades = ['Río Gallegos', 'Puerto Santa Cruz', 'Puerto Deseado', '28 de Noviembre', 'Caleta Olivia', 'Perito Moreno', 'Río Turbio'];

function PedidoInsumosPage() {
  const [pedido, setPedido] = useState({ localidad: '', objetivo: '', productos: [] });
  const [productoSeleccionado, setProductoSeleccionado] = useState({ producto: '', cantidad: '' });
  const [puedePedir, setPuedePedir] = useState(true);
  const [diasRestantes, setDiasRestantes] = useState(0);

  useEffect(() => {
    const verificarUltimoPedido = async () => {
      if (pedido.objetivo) {
        const q = query(
          collection(db, 'pedidos'),
          where('objetivo', '==', pedido.objetivo),
          where('fecha', '>', Timestamp.fromDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)))  // Hace 45 días
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const ultimoPedido = querySnapshot.docs[0].data();
          const diasPasados = Math.floor((Date.now() - ultimoPedido.fecha.toDate()) / (24 * 60 * 60 * 1000));
          setDiasRestantes(45 - diasPasados);
          setPuedePedir(false);
        } else {
          setPuedePedir(true);
        }
      }
    };

    verificarUltimoPedido();
  }, [pedido.objetivo]);

  const agregarProducto = () => {
    if (productoSeleccionado.producto && productoSeleccionado.cantidad) {
      setPedido(prevState => ({
        ...prevState,
        productos: [...prevState.productos, { ...productoSeleccionado, cantidad: Number(productoSeleccionado.cantidad) }]
      }));
      setProductoSeleccionado({ producto: '', cantidad: '' });
    }
  };

  const enviarPedido = async () => {
    if (pedido.localidad && pedido.objetivo && pedido.productos.length > 0) {
      if (puedePedir) {
        Swal.fire({
          title: '¿Estás seguro de enviar este pedido?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, enviar',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            // Guarda el pedido en Firebase con la fecha actual
            await addDoc(collection(db, 'pedidos'), {
              ...pedido,
              fecha: Timestamp.fromDate(new Date())
            });

            // Enviar el correo
            emailjs.send('service_z3hn3ck', 'template_mdgrcag', {
              product_list: pedido.productos.map(p => `${p.producto}: ${p.cantidad}`).join(', '),
              objetivo: pedido.objetivo,
              localidad: pedido.localidad
            }, '4xS1o3vGTaNk4_RFL');

            Swal.fire('Enviado', 'Tu pedido ha sido enviado con éxito.', 'success');
            setPedido({ localidad: '', objetivo: '', productos: [] });
          }
        });
      } else {
        Swal.fire('No permitido', `Ya has realizado un pedido en los últimos 45 días. Puedes volver a pedir en ${diasRestantes} días.`, 'error');
      }
    } else {
      Swal.fire('Formulario incompleto', 'Por favor, completa todos los campos antes de enviar.', 'warning');
    }
  };

  return (
    <div className={styles.pedidoContainer}>
      <h1>Pedir Insumos</h1>
      <div className={styles.formGroup}>
        <select
          value={pedido.localidad}
          onChange={(e) => setPedido({ ...pedido, localidad: e.target.value })}
        >
          <option value="">Seleccionar Localidad</option>
          {localidades.map((localidad, index) => (
            <option key={index} value={localidad}>
              {localidad}
            </option>
          ))}
        </select>
        <select
          value={pedido.objetivo}
          onChange={(e) => setPedido({ ...pedido, objetivo: e.target.value })}
        >
          <option value="">Seleccionar Objetivo</option>
          {objetivos.map((objetivo, index) => (
            <option key={index} value={objetivo}>
              {objetivo}
            </option>
          ))}
        </select>
        <select
          value={productoSeleccionado.producto}
          onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, producto: e.target.value })}
        >
          <option value="">Seleccionar Producto</option>
          {productos.map((producto, index) => (
            <option key={index} value={producto}>
              {producto}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          value={productoSeleccionado.cantidad}
          onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, cantidad: e.target.value })}
        />
        <button onClick={agregarProducto}>Agregar Producto</button>
      </div>
      <div className={styles.productList}>
        {pedido.productos.map((item, index) => (
          <div key={index} className={styles.productItem}>
            <span>{item.producto}</span>
            <span>{item.cantidad}</span>
          </div>
        ))}
      </div>
      <button className={styles.enviarButton} onClick={enviarPedido}>Enviar Pedido</button>
    </div>
  );
}

export default PedidoInsumosPage;
