const { calculate } = require('./calculate')

function handleCalculation(expression) {
  try {
    return {
      statusCode: 200,
      payload: { result: calculate(expression) },
    }
  } catch (error) {
    return {
      statusCode: 400,
      payload: { error: error.message || 'Invalid expression' },
    }
  }
}

module.exports = {
  handleCalculation,
}
