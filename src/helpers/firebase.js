import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  getDoc, 
  orderBy, 
  limit 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJ9jotr0LduSdsanTqcLdItKFpBcbEy6Q",
  authDomain: "appinsumos-4ff76.firebaseapp.com",
  projectId: "appinsumos-4ff76",
  storageBucket: "appinsumos-4ff76.appspot.com",
  messagingSenderId: "683215402142",
  appId: "1:683215402142:web:c67675bc7419ad63a6778f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stockCollection = collection(db, 'stock');
const shipmentsCollection = collection(db, 'shipments');

// Obtener stock
export const getStock = async () => {
  const stockSnapshot = await getDocs(stockCollection);
  const stockList = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return stockList;
};

// Agregar producto
export const addProduct = async (product) => {
  await addDoc(stockCollection, product);
};

// Actualizar producto
export const updateProduct = async (id, updatedProduct) => {
  const productDoc = doc(db, 'stock', id);
  const product = (await getDoc(productDoc)).data();
  if (product) {
    await updateDoc(productDoc, updatedProduct);
  } else {
    console.error(`El producto con id ${id} no existe en el stock`);
  }
};

// Eliminar producto
export const deleteProduct = async (id) => {
  const productDoc = doc(db, 'stock', id);
  await deleteDoc(productDoc);
};

// Obtener envíos
export const getShipments = async () => {
  const shipmentsSnapshot = await getDocs(shipmentsCollection);
  const shipmentsList = shipmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date ? new Date(doc.data().date) : null, // Asegurar que el campo date esté presente
  }));
  return shipmentsList;
};

// Agregar envío y actualizar stock
export const addShipment = async (shipment) => {
  try {
    const shipmentRef = await addDoc(shipmentsCollection, {
      ...shipment,
      date: new Date().toISOString(),
    });

    console.log("Envío agregado con ID:", shipmentRef.id);

    // Actualizar stock
    for (const item of shipment.items) {
      const stockItemDoc = doc(db, 'stock', item.id);
      const stockItem = (await getDoc(stockItemDoc)).data();
      if (stockItem) {
        if (stockItem.quantity >= item.quantity) {
          const newQuantity = stockItem.quantity - item.quantity;
          await updateDoc(stockItemDoc, { quantity: newQuantity });
        } else {
          console.error(`No hay suficiente stock para el producto ${item.product}`);
        }
      } else {
        console.error(`El producto ${item.product} no existe en el stock`);
      }
    }

  } catch (error) {
    console.error("Error al agregar el envío:", error);
    throw error;
  }
};


// Obtener la fecha del último envío para una ubicación específica
export const getLastShipmentDate = async (location) => {
  const q = query(
    collection(db, 'shipments'),
    where('location', '==', location),
    orderBy('date', 'desc'),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data().date.toDate(); // Asegurar que la fecha se maneje correctamente
  }
  return null;
};

// Agregar un nuevo envío con manejo automático de ID
export const addNewShipment = async (shipment) => {
  await addDoc(collection(db, 'shipments'), {
    ...shipment,
    date: new Date(), // Guardar la fecha como un objeto Date
  });
};

export { db };
