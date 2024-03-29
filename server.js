import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { Resend } from 'resend'

// Inicializar Resend con el token de la API
const resend = new Resend(process.env.RESEND_TOKEN)
const PORT = process.env.PORT || 3000
const app = express()

// Función para formatear una fecha en el idioma especificado
const format = (date, locale, options) => {
  // La función Intl.DateTimeFormat() es una función incorporada en JavaScript
  // que se utiliza para formatear fechas en diferentes idiomas.

  // 'locale' es un parámetro que especifica el idioma en el que se formateará la fecha.
  // Si el idioma especificado no está soportado, se usará el inglés por defecto.

  // 'options' es un objeto que puede contener varias propiedades para personalizar
  // el formato de la fecha, como el estilo de la fecha, el estilo de la hora, etc.

  // 'date' es la fecha que se va a formatear.

  // La función format() se utiliza para formatear la fecha en el idioma especificado.
  return new Intl.DateTimeFormat(locale, options).format(date)
}

app.use(express.static('public')) // serve static files from public directory
app.use(express.json())
// Agregar middleware para manejar el cuerpo de las solicitudes POST
app.use(express.urlencoded({ extended: true }))

// Ruta para enviar un correo electrónico
app.post('/api/email', async (req, res) => {
  const {
    nombre,
    apellido,
    segundoApellido,
    telefono,
    empresa,
    email,
    mensaje,
  } = req.body

  // Validación del nombre y apellidos: no más de 50 caracteres
  if (
    nombre.length > 50 ||
    apellido.length > 50 ||
    segundoApellido.length > 50
  ) {
    return res.status(400).json({
      error: 'El nombre y los apellidos no pueden tener más de 50 caracteres',
    })
  }

  // Validación del teléfono: solo dígitos y exactamente 9
  const telefonoRegex = /^\d{9}$/
  if (!telefonoRegex.test(telefono)) {
    return res
      .status(400)
      .json({ error: 'El teléfono debe tener exactamente 9 dígitos' })
  }

  // Validación del correo electrónico: formato básico de correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido' })
  }
  const { data, error } = await resend.emails.send({
    from: 'Polkadev <alvarobarcena@polkadev.es>',
    to: ['alvarobarcena27@gmail.com'],
    subject: 'Mensaje de contacto desde la web de www.polkadev.es',
    html: `
      <h2 style="color: black;">Has recibido un mensaje de contacto desde la web de www.polkadev.es:</h2>
      <p style="font-size: 1.1em; color: black;">${format(new Date(), 'es', { dateStyle: 'long' })}</p>
      <h2 style="color: black;"><strong>Información de contacto:</strong></h2>
      <table style="font-size: 1.2em; color: black;">
        <tr><td>Nombre y apellidos:</td><td>${nombre} ${apellido} ${segundoApellido}</td></tr>
        <tr><td>Teléfono:</td><td>+34${telefono}</td></tr>
        <tr><td>Email:</td><td>${email}</td></tr>
        <tr><td>Empresa:</td><td>${empresa}</td></tr>
      </table>
      <h2 style="color: black;"><strong>Mensaje:</strong></h2>
      <p style="font-size: 1.1em; color: black;">${mensaje}</p>
    `,
  })

  if (error) {
    return res.status(400).json({ error })
  }

  res.status(200).json({ data })
})

// Ruta para realizar un health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

export default app
