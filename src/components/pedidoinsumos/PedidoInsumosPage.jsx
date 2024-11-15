import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../helpers/firebase';
import styles from './PedidoInsumosPage.module.css';
import logo from '../../../img/logo.png';
import deleteIcon from '../../../img/delete.svg'; // Asegúrate de tener un ícono de eliminar

const productos = ['Detergente', 'Lavandina (Sobre)', 'Lavandina Gel', 'Limpia Vidrio (Sobre)', 'Desengrasante (Sobre)', 'Jabón Liquido','Jabón Blanco Barra', 'CIF Crema', 'Lisoform', 'Esponja Cocina', 'Esponja de Acero', 'Liquido para piso (Sobre)', 'Liquido Limp. Aeronautico', 'Rejillas', 'Trapos de piso', 'Franelas', 'Lustramueble', 'Desodorante de ambientes', 'Papel Higienico X UNID.', ' Cervilletas intercaladas', 'Bolsas 45 x 60', 'Bolsas 60 x 90', 'Bolsas 90 x 110', 'Bolsas Cristal 90 x 110',  'Pala plastica', 'Mopin', 'Cera Roja','Cera Roble', 'Cera Natural', 'Guantes Talle G', 'Guantes Talle M',];
const objetivos = ['Banco Nación- El Calafate', 'Banco Nación- Rio Gallegos', 'Banco Nación- Rio Turbio', 'Banco Nación- Caleta Olivia', 'Banco Nación- P.Deseado', 'Banco Nación- Las Heras', 'Banco Nación- San Julian', 'Banco Nación- 28 Noviembre', 'Banco Nación - Piedra Buena', 'Banco Nación - Pico Truncado', 'Banco Nación - Pto Santa Cruz', 'IAF', 'IERIC',  'Aeropuerto', 'Triunfo Seguros', 'CityBus', 'Enargas', 'Cruz Del Sur'];
const objetivos7Dias = ['Banco Nación- Rio Gallegos', 'Triunfo Seguros', 'IAF', 'IERIC', 'Aeropuerto', 'Enargas' ,'Cruz Del Sur']; // Objetivos con pedidos cada 7 días

function PedidoInsumosPage() {
  const [pedido, setPedido] = useState({ objetivo: '', productos: [], nota: '' });
  const [productoSeleccionado, setProductoSeleccionado] = useState({ producto: '', cantidad: '' });
  const [puedePedir, setPuedePedir] = useState(true);
  const [diasRestantes, setDiasRestantes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarUltimoPedido = async () => {
      if (pedido.objetivo) {
        const diasPermitidos = objetivos7Dias.includes(pedido.objetivo) ? 7 : 30;

        const q = query(
          collection(db, 'pedidos'),
          where('objetivo', '==', pedido.objetivo),
          where('fecha', '>=', Timestamp.fromDate(new Date(Date.now() - diasPermitidos * 24 * 60 * 60 * 1000)))
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const ultimoPedido = querySnapshot.docs[0].data();
          const diasPasados = Math.floor((Date.now() - ultimoPedido.fecha.toDate()) / (24 * 60 * 60 * 1000));
          setDiasRestantes(diasPermitidos - diasPasados);
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
    } else {
      Swal.fire('Error', 'Por favor, selecciona un producto y cantidad.', 'error');
    }
  };

  const eliminarProducto = (index) => {
    setPedido(prevState => ({
      ...prevState,
      productos: prevState.productos.filter((_, i) => i !== index)
    }));
  };

  const enviarPedido = async () => {
    if (pedido.objetivo && pedido.productos.length > 0) {
      if (puedePedir) {
        Swal.fire({
          title: '¿Estás seguro de enviar este pedido?, No podras volver a enviarlo',
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
            const emailData = {
              localidad: pedido.objetivo,
              objetivo: pedido.objetivo,
              productos: pedido.productos.map(p => `<li>Producto: ${p.producto}, Cantidad: ${p.cantidad}</li>`).join(''),
              nota: pedido.nota // Añadir la nota al email
            };

            emailjs.send('service_z3hn3ck', 'template_mdgrcag', emailData, '4xS1o3vGTaNk4_RFL');

            Swal.fire('Enviado', 'Tu pedido ha sido enviado con éxito.', 'success');
            setPedido({ objetivo: '', productos: [], nota: '' });
          }
        });
      } else {
        Swal.fire('No permitido', `Ya has realizado un pedido en los últimos ${objetivos7Dias.includes(pedido.objetivo) ? 7 : 30} días. Puedes volver a pedir en ${diasRestantes} días.`, 'error');
      }
    } else {
      Swal.fire('Formulario incompleto', 'Por favor, completa todos los campos antes de enviar.', 'warning');
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className={styles.pedidoContainer}>
      <img 
        src={logo} 
        alt="Imagen de la Empresa" 
        className={styles.logo} 
        onClick={handleLogoClick} 
      />
      
      <h1>Pedir Insumos</h1>
      <p>Tu pedido debe ser para 30 días en Interior y estará sujeto a Stock disponible</p>
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
        <button onClick={agregarProducto} className={styles.agregarButton}>Agregar Producto</button>
      </div>
      <div className={styles.productList}>
        {pedido.productos.length > 0 && (
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {pedido.productos.map((item, index) => (
                <tr key={index}>
                  <td>{item.producto}</td>
                  <td>{item.cantidad}</td>
                  <td>
                    <button 
                      className={styles.deleteButton} 
                      onClick={() => eliminarProducto(index)}
                      aria-label="Eliminar Producto"
                    >
                      <img src={deleteIcon} alt="Eliminar" className={styles.deleteIcon} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Nuevo textarea para la nota */}
      <textarea
        className={styles.textArea}
        placeholder="Añadir nota (opcional)"
        value={pedido.nota}
        onChange={(e) => setPedido({ ...pedido, nota: e.target.value })}
      />
      <button className={styles.enviarButton} onClick={enviarPedido}>Enviar Pedido</button>
    </div>
  );
}

export default PedidoInsumosPage;
