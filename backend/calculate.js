function precedence(operator) {
  if (operator === '+' || operator === '-') {
    return 1
  }
  if (operator === '*' || operator === '/' || operator === '%') {
    return 2
  }
  return 0
}

function applyOperator(left, right, operator) {
  if (operator === '+') {
    return left + right
  }
  if (operator === '-') {
    return left - right
  }
  if (operator === '*') {
    return left * right
  }
  if (operator === '/') {
    if (right === 0) {
      throw new Error('Division by zero')
    }
    return left / right
  }
  if (operator === '%') {
    if (right === 0) {
      throw new Error('Modulo by zero')
    }
    return left % right
  }
  throw new Error('Invalid operator')
}

function tokenize(expression) {
  const sanitized = expression.replace(/\s+/g, '').replace(/x/g, '*').replace(/÷/g, '/')
  if (!sanitized) {
    throw new Error('Expression is empty')
  }

  const tokens = []
  let i = 0
  let expectNumber = true

  while (i < sanitized.length) {
    const char = sanitized[i]

    if ((char === '+' || char === '-') && expectNumber) {
      let sign = 1
      while (sanitized[i] === '+' || sanitized[i] === '-') {
        if (sanitized[i] === '-') {
          sign *= -1
        }
        i += 1
      }

      let number = ''
      let dotCount = 0
      while (i < sanitized.length && /[0-9.]/.test(sanitized[i])) {
        if (sanitized[i] === '.') {
          dotCount += 1
          if (dotCount > 1) {
            throw new Error('Invalid number format')
          }
        }
        number += sanitized[i]
        i += 1
      }

      if (!number || number === '.') {
        throw new Error('Invalid number format')
      }

      tokens.push(String(sign * Number(number)))
      expectNumber = false
      continue
    }

    if (/[0-9.]/.test(char)) {
      let number = ''
      let dotCount = 0

      while (i < sanitized.length && /[0-9.]/.test(sanitized[i])) {
        if (sanitized[i] === '.') {
          dotCount += 1
          if (dotCount > 1) {
            throw new Error('Invalid number format')
          }
        }
        number += sanitized[i]
        i += 1
      }

      if (number === '.') {
        throw new Error('Invalid number format')
      }

      tokens.push(number)
      expectNumber = false
      continue
    }

    if (/[+\-*/%]/.test(char)) {
      if (expectNumber) {
        throw new Error('Operator in invalid position')
      }
      tokens.push(char)
      expectNumber = true
      i += 1
      continue
    }

    throw new Error('Invalid character')
  }

  if (expectNumber) {
    throw new Error('Expression cannot end with operator')
  }

  return tokens
}

function evaluateTokens(tokens) {
  const values = []
  const operators = []

  const collapseTop = () => {
    if (values.length < 2 || operators.length === 0) {
      throw new Error('Malformed expression')
    }

    const right = values.pop()
    const left = values.pop()
    const operator = operators.pop()
    values.push(applyOperator(left, right, operator))
  }

  for (const token of tokens) {
    if (/^[+\-]?[0-9]*\.?[0-9]+$/.test(token)) {
      values.push(Number(token))
      continue
    }

    while (
      operators.length > 0 &&
      precedence(operators[operators.length - 1]) >= precedence(token)
    ) {
      collapseTop()
    }

    operators.push(token)
  }

  while (operators.length > 0) {
    collapseTop()
  }

  if (values.length !== 1 || !Number.isFinite(values[0])) {
    throw new Error('Evaluation failed')
  }

  return values[0]
}

function formatResult(result) {
  const normalized = Number(result.toPrecision(12))
  return normalized.toString()
}

function calculate(expression) {
  const tokens = tokenize(String(expression ?? ''))
  const result = evaluateTokens(tokens)
  return formatResult(result)
}

module.exports = {
  calculate,
}
