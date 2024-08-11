import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';

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
  await updateDoc(productDoc, updatedProduct);
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

// Agregar envío
export const addShipment = async (shipment) => {
  await addDoc(shipmentsCollection, {
    ...shipment,
    date: new Date().toISOString(), // Guardar la fecha en formato ISO
  });
  
  for (const item of shipment.items) {
    const stockItemDoc = doc(db, 'stock', item.id);
    const stockItem = (await getDoc(stockItemDoc)).data();
    if (stockItem) {
      const newQuantity = stockItem.quantity - item.quantity;
      await updateDoc(stockItemDoc, { quantity: newQuantity });
    }
  }
};
