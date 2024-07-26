import { el } from 'redom'
import headerComponent from './headerComponent'

// Элемент заголовка, аналогичный другим страницам
const createCurrencyPage = (router) => {
  const header = headerComponent(router)
  const container = el('div')

  const title = el('h1', 'Валютный обмен')

  // Ваши валюты
  const yourCurrenciesCard = el('div', { class: 'col-sm' },
    el('div', { class: 'card-yourcurrency' },
      el('h2', 'Ваши валюты'),
      el('div', { id: 'your-currencies' })
    )
  )

  // Обмен валюты
  const exchangeCurrencyCard = el('div', { class: 'card-currency-change' },
    el('h2', 'Обмен валюты'),
    el('div', { class: 'row' },
      el('div', { class: 'col-9' },
        el('label', { class: 'currency-label' }, 'Из'),
        el('select', { class: 'currency-select', id: 'from-currency' }),
        el('label', { class: 'currency-label' }, 'В'),
        el('select', { class: 'currency-select', id: 'to-currency' }),

        el('div', { class: 'currency-label-sum' },
          el('label', { class: 'currency-label' }, 'Сумма'),
          el('input', { class: 'currency-input', type: 'number', id: 'amount-input' })
        )
      ),
      el('div', { class: 'col-sm' },
        el('button', { class: 'exchange-button', id: 'exchange-button' }, 'Обменять')
      )
    )
  )
  yourCurrenciesCard.append(exchangeCurrencyCard)

  // Изменение курсов в реальном времени
  const exchangeRateChangesCard = el('div', { class: 'col-4' },
    el('div', { class: 'card-exchange-rate-changes' },
      el('h2', 'Изменение курсов в реальном времени'),
      el('div', { id: 'exchange-rate-changes' })
    )
  )

  const tableCurrencyCard = el('div', { class: 'row' })

  tableCurrencyCard.append(yourCurrenciesCard, exchangeRateChangesCard)

  container.append(header, title, tableCurrencyCard)

  // Функция для получения и отображения валютных счетов
  const fetchAndDisplayCurrencies = () => {
    // console.log('Получение валют...')
    fetch('http://localhost:3000/currencies', {
      headers: {
        Authorization: `Basic ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const yourCurrenciesContainer = document.getElementById('your-currencies')
        yourCurrenciesContainer.innerHTML = ''
        for (const [code, currency] of Object.entries(data.payload)) {
          if (currency.amount > 0) {
            const currencyDiv = el('div', `${code}............................. ${currency.amount}`)
            yourCurrenciesContainer.appendChild(currencyDiv)
          }
        }
        // console.log('Обмены показаны.')
      })
      .catch(error => {
        console.error('Error fetching currencies:', error)
        alert('Ошибка при получении данных валютных счетов.')
      })
  }

  const fetchAndDisplayAllCurrencies = () => {
    // console.log('Получение всех курсов.')
    fetch('http://localhost:3000/all-currencies', {
      headers: {
        Authorization: `Basic ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const fromCurrencySelect = document.getElementById('from-currency')
        const toCurrencySelect = document.getElementById('to-currency')
        fromCurrencySelect.innerHTML = ''
        toCurrencySelect.innerHTML = ''

        data.payload.forEach(code => {
          const fromOption = el('option', { value: code }, code)
          const toOption = el('option', { value: code }, code)
          fromCurrencySelect.appendChild(fromOption)
          toCurrencySelect.appendChild(toOption)
        })
        // console.log('Все валюты загружены')
      })
      .catch(error => {
        console.error('Error fetching all currencies:', error)
        alert('Ошибка при получении списка всех валют.')
      })
  }

  fetchAndDisplayCurrencies()
  fetchAndDisplayAllCurrencies()

  // Websocket connection for real-time exchange rates
  const socket = new WebSocket('ws://localhost:3000/currency-feed')

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    const fromCurrencyElement = document.getElementById('from-currency')
    const toCurrencyElement = document.getElementById('to-currency')

    if (fromCurrencyElement && toCurrencyElement) {
      const fromCurrency = fromCurrencyElement.value
      const toCurrency = toCurrencyElement.value

      if (message.type === 'EXCHANGE_RATE_CHANGE' && message.from === fromCurrency && message.to === toCurrency) {
        const exchangeRateChangesContainer = document.getElementById('exchange-rate-changes')
        const arrow = message.change > 0 ? '↑' : '↓'
        const rateChangeDiv = el('div', `${message.from}/${message.to}............................${message.rate} ${arrow}`)
        rateChangeDiv.style.color = message.change > 0 ? 'green' : 'red'
        exchangeRateChangesContainer.appendChild(rateChangeDiv)
        const children = exchangeRateChangesContainer.children
        if (children.length > 12) {
          exchangeRateChangesContainer.removeChild(children[12])
        }
      }
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  // Обработчик обмена валюты
  const handleCurrencyExchange = () => {
    // console.log('Жмяк')
    const fromCurrency = document.getElementById('from-currency').value
    const toCurrency = document.getElementById('to-currency').value
    const amount = parseFloat(document.getElementById('amount-input').value)

    if (isNaN(amount) || amount <= 0) {
      alert('Пожалуйста, введите корректную положительную сумму.')
      return
    }

    fetch('http://localhost:3000/currency-buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ from: fromCurrency, to: toCurrency, amount })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          let errorMessage = 'Ошибка обмена.'
          switch (data.error) {
            case 'Unknown currency code':
              errorMessage = 'Неверный валютный код.'
              break
            case 'Invalid amount':
              errorMessage = 'Некорректная сумма перевода.'
              break
            case 'Not enough currency':
              errorMessage = 'Недостаточно средств на счёте.'
              break
            case 'Overdraft prevented':
              errorMessage = 'Превышен доступный лимит.'
              break
          }
          alert(errorMessage)
        } else {
          fetchAndDisplayCurrencies()
          alert('Обмен успешно выполнен!')
        }
      })
      .catch(error => {
        console.error('Ошибка при выполнении обмена:', error)
        alert('Произошла ошибка при выполнении обмена.')
      })
  }

  // Привязка обработчика к кнопке
  document.addEventListener('DOMContentLoaded', () => {
    const exchangeButton = document.getElementById('exchange-button')
    if (exchangeButton) {
      exchangeButton.addEventListener('click', handleCurrencyExchange)
      // console.log('Отжмяк')
    } else {
      console.error('Exchange button not found.')
    }
  })

  return container
}

export default createCurrencyPage
