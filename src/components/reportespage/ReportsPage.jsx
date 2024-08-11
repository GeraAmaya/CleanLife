import React, { useState } from 'react';
import styles from './ReportsPage.module.css';
import { getShipments } from '../../helpers/firebase';

function ReportsPage() {
  const [objectives, setObjectives] = useState(['Banco', 'Aeropuerto', 'Triunfo Seguros', 'Cruz del Sur', 'IAF', 'IERIC']);
  const [selectedObjective, setSelectedObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  const fetchReportData = async () => {
    try {
      const allShipments = await getShipments();
      console.log('All Shipments:', allShipments);
      
      const filteredShipments = allShipments.filter(shipment => {
        // Verificar si la fecha existe y es válida
        if (!shipment.date || isNaN(new Date(shipment.date).getTime())) {
          console.warn('Envío sin fecha o con fecha inválida:', shipment);
          return false;
        }

        const shipmentDate = new Date(shipment.date);

        // Comparar las fechas
        return (
          shipment.objective === selectedObjective &&
          shipmentDate >= new Date(startDate) &&
          shipmentDate <= new Date(endDate)
        );
      });

      console.log('Filtered Shipments:', filteredShipments);
      setReportData(filteredShipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const handleGenerateReport = () => {
    if (selectedObjective && startDate && endDate) {
      fetchReportData();
    } else {
      alert('Por favor, seleccione un objetivo y un rango de fechas.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Generar Reportes</h1>
      <div className={styles.form}>
        <select value={selectedObjective} onChange={(e) => setSelectedObjective(e.target.value)}>
          <option value="">Seleccionar Objetivo</option>
          {objectives.map((objective, index) => (
            <option key={index} value={objective}>
              {objective}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleGenerateReport}>Generar Reporte</button>
      </div>
      <div className={styles.report}>
        {reportData.length > 0 ? (
          reportData.map((shipment, index) => (
            <div key={index} className={styles.reportItem}>
              <h3>{shipment.objective}</h3>
              <p>Fecha: {shipment.date}</p>
              {shipment.items.map((item, i) => (
                <div key={i} className={styles.item}>
                  <span>Producto: {item.product}</span>
                  <span>Cantidad: {item.quantity}</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No hay datos para mostrar</p>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
