const cors = require('cors')
const express = require('express')
const { calculate } = require('./calculate')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.post('/calculate', (req, res) => {
  try {
    const result = calculate(req.body?.expression)
    res.json({ result })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Invalid expression' })
  }
})

app.listen(PORT, () => {
  console.log(`Calculator backend running at http://localhost:${PORT}`)
})
