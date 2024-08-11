import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import styles from './ReportsPage.module.css';
import { getShipments } from '../../helpers/firebase';

// Importar la imagen desde la carpeta 'public'
import companyLogo from '../../../img/logo.png';

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

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Añadir la imagen de la empresa
    const img = new Image();
    img.src = companyLogo;
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 50, 20); // Ajusta la posición y el tamaño según sea necesario

      // Añadir el texto debajo de la imagen
      doc.setFontSize(18);
      doc.text('Reporte de Envíos', 14, 40); // Ajustar la posición del texto para que quede debajo de la imagen

      // Preparar los datos de la tabla
      const tableData = reportData.map(shipment => ({
        Objective: shipment.objective,
        Date: new Date(String(shipment.date)).toLocaleDateString(),
        Items: shipment.items.map(item => `Producto: ${item.product}, Cantidad: ${item.quantity}`).join('; ')
      }));

      // Añadir la tabla
      doc.autoTable({
        head: [['Objective', 'Date', 'Items']],
        body: tableData.map(data => [data.Objective, data.Date, data.Items]),
        startY: 50, // Ajustar la posición para que no solaparse con el texto
      });

      doc.save('report.pdf');
    };
  };

  const handleDeleteReport = () => {
    setReportData([]);
    setReportGenerated(false);
    Swal.fire({
      icon: 'success',
      title: 'Reporte eliminado',
      text: 'El reporte ha sido eliminado exitosamente.',
      confirmButtonText: 'Aceptar',
    });
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
        {reportGenerated && (
          <>
            <button onClick={downloadPDF}>Descargar PDF</button>
            <button onClick={handleDeleteReport}>Eliminar Reporte</button>
          </>
        )}
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
