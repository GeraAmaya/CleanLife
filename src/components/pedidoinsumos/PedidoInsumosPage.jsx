import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../helpers/firebase';
import styles from './PedidoInsumosPage.module.css';
import logo from '../../../img/logo.png';  // Importa la imagen de la empresa

const productos = ['Detergente', 'Lavandina (sobre)', 'CIF Crema', 'Esponja Cocina', 'Esponja de  Acero' ,'Rejilla','Trapode piso', 'Franelas', 'Lustramueble', 'Desodorante de ambientes (sobre)', 'Bolsas 45 x 60', 'Bolsas 60 x 90',  'Bolsas 90 x 110'];
const objetivos = ['Banco Nación- El Calafate','Banco Nación- Rio Turbio','Banco Nación- Caleta Olivia','Banco Nación- P.Deseado','Banco Nación- Las Heras','Banco Nación- San Julian', 'Banco Nación- 28 Noviembre','Banco Nación - Piedra Buena','Banco Nación - Pico Truncado','Banco Nación - Santa Cruz', 'IAF', 'IERIC', 'Aeropuerto','Pico Truncado', 'El Calafate', 'Triunfo Seguros', 'CityBus'];

function PedidoInsumosPage() {
  const [pedido, setPedido] = useState({ objetivo: '', productos: [] });
  const [productoSeleccionado, setProductoSeleccionado] = useState({ producto: '', cantidad: '' });
  const [puedePedir, setPuedePedir] = useState(true);
  const [diasRestantes, setDiasRestantes] = useState(0);
  const navigate = useNavigate();  // Hook para la navegación

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
    if (pedido.objetivo && pedido.productos.length > 0) {
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
              objetivo: pedido.objetivo
            }, '4xS1o3vGTaNk4_RFL');

            Swal.fire('Enviado', 'Tu pedido ha sido enviado con éxito.', 'success');
            setPedido({ objetivo: '', productos: [] });
          }
        });
      } else {
        Swal.fire('No permitido', `Ya has realizado un pedido en los últimos 45 días. Puedes volver a pedir en ${diasRestantes} días.`, 'error');
      }
    } else {
      Swal.fire('Formulario incompleto', 'Por favor, completa todos los campos antes de enviar.', 'warning');
    }
  };

  const handleLogoClick = () => {
    navigate('/');  // Navegar a la página de inicio
  };

  return (
    <div className={styles.pedidoContainer}>
      <img 
        src={logo} 
        alt="Imagen de la Empresa" 
        className={styles.logo} 
        onClick={handleLogoClick}  // Evento onClick para navegar al inicio
      />
      
      <h1>Pedir Insumos</h1>
      <div className={styles.formGroup}>
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
