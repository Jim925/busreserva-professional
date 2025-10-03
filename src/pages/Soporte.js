import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Soporte = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showForm, setShowForm] = useState(false);

  const contactos = [
    { tipo: 'Teléfono', valor: '+51 1 234 5678', icon: '📞' },
    { tipo: 'Email', valor: 'soporte@busreserva.pe', icon: '✉️' },
    { tipo: 'WhatsApp', valor: '+51 987 654 321', icon: '📱' },
    { tipo: 'Chat en vivo', valor: 'Disponible 24/7', icon: '💬' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Consulta enviada exitosamente. Te responderemos pronto.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const faqs = [
    {
      pregunta: '¿Cómo cancelar mi reserva?',
      respuesta: 'Puede cancelar hasta 2 horas antes de la salida sin coste adicional. Las cancelaciones se procesan automáticamente y el reembolso se realiza en 24-48 horas.'
    },
    {
      pregunta: '¿Qué documentos necesito para viajar?',
      respuesta: 'DNI o pasaporte válido y vigente. Para menores de edad, se requiere autorización notarial de los padres y copia del DNI del menor.'
    },
    {
      pregunta: '¿Puedo cambiar mi billete?',
      respuesta: 'Sí, puede modificar fecha, hora y asiento hasta 1 hora antes de la salida. Los cambios tienen un costo de S/10 por modificación.'
    },
    {
      pregunta: '¿Qué servicios incluyen los autobuses?',
      respuesta: 'Todos nuestros autobuses incluyen: WiFi gratuito, aire acondicionado, asientos reclinables, baño, entretenimiento a bordo y servicio de refrigerios.'
    },
    {
      pregunta: '¿Qué equipaje puedo llevar?',
      respuesta: 'Permitimos hasta 23kg en bodega sin costo adicional y equipaje de mano de hasta 8kg. Equipaje adicional tiene costo de S/15 por cada 10kg extra.'
    },
    {
      pregunta: '¿Cómo puedo rastrear mi autobús?',
      respuesta: 'Puede rastrear su autobús en tiempo real a través de nuestra app móvil o página web usando su número de reserva.'
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
          <p className="body" style={{ marginBottom: '40px', color: '#a1a1a6' }}>
            Estamos aquí para ayudarte las 24 horas del día
          </p>
          
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '18px',
            padding: '60px 40px',
            margin: '0 auto 40px auto',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎆</div>
            <h3 className="title-2" style={{ color: '#fff', marginBottom: '12px' }}>Centro de Atención al Cliente</h3>
            <p className="body" style={{ color: 'rgba(255,255,255,0.8)' }}>Equipo especializado en resolver todas tus consultas</p>
          </div>
        </motion.div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px' }}>
            <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Contacto</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {contactos.map((contacto, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: '#1d1d1f',
                    borderRadius: '18px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid #424245',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{contacto.icon}</div>
                  <div className="headline" style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                    {contacto.tipo}
                  </div>
                  <div className="body" style={{ color: '#0071e3', fontWeight: '600' }}>
                    {contacto.valor}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '60px' }}>
            <h2 className="title-2" style={{ marginBottom: '32px', textAlign: 'center' }}>Preguntas frecuentes</h2>
            <div style={{ display: 'grid', gap: '24px' }}>
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: '#1d1d1f',
                    borderRadius: '18px',
                    padding: '32px',
                    border: '1px solid #424245'
                  }}
                >
                  <h3 className="headline" style={{ margin: '0 0 16px 0', color: '#f5f5f7' }}>
                    {faq.pregunta}
                  </h3>
                  <p className="body" style={{ margin: 0, color: '#a1a1a6', lineHeight: '1.6' }}>
                    {faq.respuesta}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{
            background: '#1d1d1f',
            borderRadius: '18px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #424245'
          }}>
            <h3 className="headline" style={{ margin: '0 0 16px 0', color: '#f5f5f7' }}>
              ¿Necesita más ayuda?
            </h3>
            <p className="body" style={{ margin: '0 0 32px 0', color: '#a1a1a6' }}>
              Nuestro equipo especializado está disponible 24/7 para resolver cualquier consulta
            </p>
            <button 
              className="btn"
              onClick={() => setShowForm(!showForm)}
              style={{ marginBottom: showForm ? '32px' : '0' }}
            >
              {showForm ? 'Ocultar formulario' : 'Enviar consulta'}
            </button>
            
            {showForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleSubmit}
                style={{ textAlign: 'left', display: 'grid', gap: '20px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #424245',
                      background: '#2c2c2e',
                      color: '#f5f5f7',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Asunto"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #424245',
                    background: '#2c2c2e',
                    color: '#f5f5f7',
                    fontSize: '16px'
                  }}
                />
                <textarea
                  name="message"
                  placeholder="Describe tu consulta..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #424245',
                    background: '#2c2c2e',
                    color: '#f5f5f7',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
                <button type="submit" className="btn" style={{ justifySelf: 'start' }}>
                  Enviar consulta
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Soporte;