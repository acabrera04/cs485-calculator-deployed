import { useEffect, useState } from 'react'
import './App.css'

const CALCULATE_API_URL =
  import.meta.env.VITE_CALCULATE_API_URL ?? 'http://localhost:3001/calculate'

const BUTTONS = [
  'Clear',
  'bksp',
  '%',
  '÷',
  '7',
  '8',
  '9',
  'x',
  '4',
  '5',
  '6',
  '-',
  '1',
  '2',
  '3',
  '+',
  '+/-',
  '0',
  '.',
  '=',
]

function isOperator(char) {
  return ['+', '-', 'x', '÷', '%'].includes(char)
}

function toggleSign(expression) {
  if (expression.length === 0) {
    return '-'
  }

  const trimmed = expression.trim()
  const match = trimmed.match(/(.*?)([-+]?\d*\.?\d+)$/)

  if (!match) {
    const lastChar = trimmed.at(-1)
    if (lastChar && isOperator(lastChar)) {
      return `${trimmed}-`
    }
    return trimmed
  }

  const prefix = match[1]
  const number = match[2]
  if (number.startsWith('-')) {
    return `${prefix}${number.slice(1)}`
  }

  return `${prefix}-${number}`
}

function buttonKind(button) {
  if (button === '=') {
    return 'equals'
  }
  if (button === 'Clear' || button === 'bksp' || button === '+/-') {
    return 'action'
  }
  if (isOperator(button)) {
    return 'operator'
  }
  return 'number'
}

function mapKeyToButton(key) {
  if (/^[0-9]$/.test(key)) {
    return key
  }

  if (key === '.') {
    return '.'
  }

  if (key === '+' || key === '-' || key === '%') {
    return key
  }

  if (key === '*') {
    return 'x'
  }

  if (key === '/') {
    return '÷'
  }

  if (key === 'Enter' || key === '=') {
    return '='
  }

  if (key === 'Backspace') {
    return 'bksp'
  }

  if (key === 'Escape' || key === 'Delete') {
    return 'Clear'
  }

  return null
}

function App() {
  const [expression, setExpression] = useState('0')
  const [isCalculating, setIsCalculating] = useState(false)

  const appendValue = (value) => {
    setExpression((prev) => {
      const current = prev === '0' ? '' : prev
      const lastChar = current.at(-1)

      if (value === '.' && /(?:^|[+\-x÷%])[^+\-x÷%]*\./.test(current.split(/(?=[+\-x÷%])/).at(-1) || '')) {
        return current || '0'
      }

      if (isOperator(value)) {
        if (!current) {
          return value === '-' ? '-' : '0'
        }
        if (lastChar && isOperator(lastChar)) {
          return `${current.slice(0, -1)}${value}`
        }
      }

      return `${current}${value}`
    })
  }

  const handleButtonPress = async (button) => {
    if (isCalculating && button !== 'Clear') {
      return
    }

    if (button === 'Clear') {
      setExpression('0')
      return
    }

    if (button === 'bksp') {
      setExpression((prev) => {
        if (prev.length <= 1) {
          return '0'
        }
        return prev.slice(0, -1)
      })
      return
    }

    if (button === '+/-') {
      setExpression((prev) => {
        const next = toggleSign(prev === '0' ? '' : prev)
        return next || '0'
      })
      return
    }

    if (button === '=') {
      setIsCalculating(true)
      try {
        const normalizedExpression = expression.replace(/x/g, '*').replace(/÷/g, '/')
        const response = await fetch(CALCULATE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression: normalizedExpression }),
        })
        const data = await response.json()
        if (!response.ok) {
          setExpression(data.error || 'Error')
          return
        }
        setExpression(data.result)
      } catch {
        setExpression('Server Error')
      } finally {
        setIsCalculating(false)
      }
      return
    }

    appendValue(button)
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      const mappedButton = mapKeyToButton(event.key)
      if (!mappedButton) {
        return
      }

      if (
        event.key === 'Backspace' ||
        event.key === 'Enter' ||
        event.key === '=' ||
        event.key === 'Delete'
      ) {
        event.preventDefault()
      }

      void handleButtonPress(mappedButton)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleButtonPress])

  return (
    <main className="app-shell">
      <section className="calculator" aria-label="Calculator">
        <div className="display" aria-live="polite">
          {isCalculating ? 'Calculating...' : expression}
        </div>

        <div className="keypad">
          {BUTTONS.map((button) => (
            <button
              key={button}
              className={`key key-${buttonKind(button)}`}
              onClick={() => handleButtonPress(button)}
              type="button"
            >
              {button}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
