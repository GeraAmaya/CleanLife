import React, { useState, useEffect } from 'react';
import styles from './ReportsPage.module.css';
import { getShipments } from '../../helpers/firebase';

function ReportsPage() {
  const [objectives, setObjectives] = useState(['Banco', 'Aeropuerto', 'Triunfo Seguros', 'Cruz del Sur', 'IAF', 'IERIC']);
  const [selectedObjective, setSelectedObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const allShipments = await getShipments();
      const filteredShipments = allShipments.filter(shipment => {
        const shipmentDate = new Date(String(shipment.date).replace(/(\w+) (\d+) (\d+) (\d+:\d+:\d+) GMT([+-]\d+) (\w+)/, (match, day, date, month, time, year, offset) => {
          return `${year}-${month}-${date}T${time}${offset}:00`;
        }));
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // Agregar un día a la fecha final
        return (
          shipment.objective === selectedObjective &&
          shipmentDate >= start &&
          shipmentDate < end // Notar que uso `<` en lugar de `<=`
        );
      });
      setReportData(filteredShipments);
      setReportGenerated(true);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (selectedObjective && startDate && endDate) {
      setReportData([]); // Resetear el estado reportData
      setReportGenerated(false); // Resetear el estado reportGenerated
      await fetchReportData();
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
        {loading ? (
          <p>Cargando...</p>
        ) : (
          reportGenerated && reportData.length > 0 ? (
            reportData.map((shipment, index) => (
              <div key={index} className={styles.reportItem}>
                <h3>{shipment.objective}</h3>
                <p>Fecha: {new Date(String(shipment.date)).toLocaleDateString()}</p>
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
          )
        )}
      </div>
    </div>
  );
}

export default ReportsPage;