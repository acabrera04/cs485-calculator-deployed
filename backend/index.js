const cors = require('cors')
const express = require('express')
const { handleCalculation } = require('./handleCalculation')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.post('/calculate', (req, res) => {
  const { statusCode, payload } = handleCalculation(req.body?.expression)
  res.status(statusCode).json(payload)
})

app.listen(PORT, () => {
  console.log(`Calculator backend running at http://localhost:${PORT}`)
})
