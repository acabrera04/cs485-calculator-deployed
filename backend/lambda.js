const { handleCalculation } = require('./handleCalculation')

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    }
  }

  if (event.requestContext?.http?.method && event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  let body = event.body

  if (typeof body === 'string' && body.length > 0) {
    try {
      body = JSON.parse(body)
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      }
    }
  }

  const { statusCode, payload } = handleCalculation(body?.expression)

  return {
    statusCode,
    headers,
    body: JSON.stringify(payload),
  }
}
