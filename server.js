import express from 'express'
import fs from 'node:fs'
import { Resend } from 'resend'
import { RESEND_TOKEN } from './env/tokens.js'

const resend = new Resend(RESEND_TOKEN)
const PORT = process.env.PORT || 3000
const app = express()

app.use(express.static('public')) // serve static files from public directory
app.use(express.json())
// Agregar middleware para manejar el cuerpo de las solicitudes POST
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  let html = fs.readFileSync('public/index.html', 'utf8')
  res.send(html)
})

app.post('/email', async (req, res) => {
  const { nombre, apellido, segundoApellido, telefono, email, mensaje } =
    req.body
  const { data, error } = await resend.emails.send({
    from: 'PolkaDev <onboarding@resend.dev>',
    to: ['alvarobarcena27@gmail.com'],
    subject: 'Nuevo mensaje de contacto desde la web de Portfolio',
    html: `
      <h2>Nombre y apellidos: ${nombre} ${apellido} ${segundoApellido}</h2>
      <h2><strong>Teléfono: ${telefono}</strong></h2>
      <h2><strong>Email: ${email}</strong></h2>
      <h2><strong>Mensaje: ${mensaje}</strong></h2>
    `,
  })

  if (error) {
    return res.status(400).json({ error })
  }

  res.status(200).json({ data })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
