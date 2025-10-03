import React from 'react';
import { motion } from 'framer-motion';
import UnsplashImage from '../components/UnsplashImage';

const Soporte = () => {
  const contactos = [
    { tipo: 'Teléfono', valor: '+51 1 234 5678' },
    { tipo: 'Email', valor: 'soporte@busreserva.pe' },
    { tipo: 'WhatsApp', valor: '+51 987 654 321' },
    { tipo: 'Chat', valor: 'Disponible 24/7' }
  ];

  const faqs = [
    {
      pregunta: '¿Cómo cancelar mi reserva?',
      respuesta: 'Puede cancelar hasta 2 horas antes de la salida sin coste adicional.'
    },
    {
      pregunta: '¿Qué documentos necesito?',
      respuesta: 'DNI o pasaporte válido. Para menores, autorización parental.'
    },
    {
      pregunta: '¿Puedo cambiar mi billete?',
      respuesta: 'Sí, puede modificar fecha y hora hasta 1 hora antes de la salida.'
    },
    {
      pregunta: '¿Hay WiFi en los autobuses?',
      respuesta: 'Todos nuestros autobuses cuentan con WiFi gratuito.'
    }
  ];

  return (
    <section className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 className="title-1" style={{ marginBottom: '16px' }}>
            Soporte
          </h1>
          <p className="body" style={{ marginBottom: '40px' }}>
            Estamos aquí para ayudarte
          </p>
          
          <UnsplashImage 
            query="customer support team office"
            width={600}
            height={300}
            style={{ margin: '0 auto', display: 'block' }}
          />
        </motion.div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px' }}>
            <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Contacto</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              {contactos.map((contacto, index) => (
                <div
                  key={index}
                  style={{
                    background: '#1d1d1f',
                    borderRadius: '18px',
                    padding: '24px',
                    textAlign: 'center'
                  }}
                >
                  <div className="headline" style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                    {contacto.tipo}
                  </div>
                  <div className="body" style={{ color: '#0071e3' }}>
                    {contacto.valor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '60px' }}>
            <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Preguntas frecuentes</h2>
            <div style={{ display: 'grid', gap: '32px' }}>
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="headline" style={{ margin: '0 0 12px 0' }}>
                    {faq.pregunta}
                  </h3>
                  <p className="body" style={{ margin: 0 }}>
                    {faq.respuesta}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: '#1d1d1f',
            borderRadius: '18px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <h3 className="headline" style={{ margin: '0 0 16px 0', color: '#f5f5f7' }}>
              ¿Necesita más ayuda?
            </h3>
            <p className="body" style={{ margin: '0 0 32px 0', color: '#a1a1a6' }}>
              Nuestro equipo está disponible 24/7
            </p>
            <button className="btn">
              Enviar consulta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Soporte;