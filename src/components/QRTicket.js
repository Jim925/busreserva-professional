import React from 'react';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const QRTicket = ({ ticketData }) => {
  const ticketRef = React.useRef();

  const downloadPDF = async () => {
    const element = ticketRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`ticket-${ticketData.id}.pdf`);
  };

  const qrValue = JSON.stringify({
    id: ticketData.id,
    passenger: ticketData.passenger,
    route: `${ticketData.origen} - ${ticketData.destino}`,
    date: ticketData.fecha,
    seat: ticketData.asiento
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      ref={ticketRef}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '20px',
        maxWidth: '400px',
        margin: '20px auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>🚌 BusReserva</h2>
        <p style={{ opacity: 0.8, margin: 0 }}>Boleto Digital</p>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '15px', color: '#333' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <strong>Pasajero:</strong><br />
            {ticketData.passenger}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Asiento:</strong><br />
            {ticketData.asiento}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <strong>Origen:</strong><br />
            {ticketData.origen}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Destino:</strong><br />
            {ticketData.destino}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <strong>Fecha:</strong><br />
            {ticketData.fecha}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Hora:</strong><br />
            {ticketData.hora}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <QRCode value={qrValue} size={120} />
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', opacity: 0.6 }}>
          ID: {ticketData.id}
        </div>
      </div>

      <button 
        onClick={downloadPDF}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '10px',
          cursor: 'pointer',
          width: '100%',
          marginTop: '15px'
        }}
      >
        📄 Descargar PDF
      </button>
    </motion.div>
  );
};

export default QRTicket;