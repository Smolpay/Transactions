import { el } from 'redom'
import Chart from 'chart.js/auto'
import headerComponent from './headerComponent'

export default async function accountPage (router, id) {
  const container = el('div', { class: 'container' }) // Добавляем класс контейнера для Bootstrap
  let chart = null

  const header = headerComponent(router)
  const upString = el('div', { class: 'upString' },
    el('div', { class: 'row' },
      el('div', { class: 'col-sm' },
        el('h2', { style: 'display: ' }, 'Просмотр счета')),
      el('div', { class: 'col-sm' },
        el('button', { class: 'back-button', onclick: () => router.navigate('/accountsPage') }, '<- Вернуться назад')
      )
    )
  )

  const accountNumber = el('span', { class: 'accountNumber' })

  const middleString = el('div', { class: 'middleString' },
    el('div', { class: 'row' },
      el('div', { class: 'col-sm' },
        el('p', `№ ${id}`)
      ),
      el('div', { class: 'col-sm' },
        el('p', { class: 'balance' }, 'Баланс: ', accountNumber)
      )
    )
  )

  const previousAccounts = JSON.parse(localStorage.getItem('previousAccounts')) || []

  const newTransferCard = el('div', { class: 'card h-100' }, // Добавляем класс h-100 для выравнивания высоты
    el('p', { style: 'font-weight: bold;' }, 'Новый перевод:'),
    el('p', 'Счёт получателя'),
    el('input', { type: 'text', placeholder: 'Счёт получателя', id: 'recipientAccountInput', list: 'previousAccounts' }),
    el('datalist', { id: 'previousAccounts' }, previousAccounts.map(account => el('option', { value: account }))),
    el('p', 'Сумма перевода'),
    el('input', { type: 'number', placeholder: 'Сумма перевода', id: 'amountInput' }),
    el('button', { class: 'send-button' }, el('img', { src: './pictures/mail.svg' }), ' Отправить')
  )

  const chartCard = el('div', { class: 'card h-100' }, // Добавляем класс h-100 для выравнивания высоты
    el('p', { style: 'font-weight: bold;' }, 'Динамика баланса', { onclick: () => router.navigate(`/detailedBalance/${id}`) }),
    el('canvas', { style: 'width: 100%; height: 300px;' })
  )

  const transactionHistoryCard = el('div', { class: 'card', style: 'width: 100%;' },
    el('h3', 'История переводов', { onclick: () => router.navigate(`/detailedBalance/${id}`) }),
    el('table',
      el('thead',
        el('tr',
          el('th', { style: 'background-color: #007bff; color: white;' }, 'Счет отправителя'),
          el('th', { style: 'background-color: #007bff; color: white;' }, 'Счет получателя'),
          el('th', { style: 'background-color: #007bff; color: white;' }, 'Сумма'),
          el('th', { style: 'background-color: #007bff; color: white;' }, 'Дата')
        )
      ),
      el('tbody')
    )
  )

  const cardsContainer = el('div', { class: 'cards-container row' },
    el('div', { class: 'col-sm-6 mb-3 d-flex' }, newTransferCard),
    el('div', { class: 'col-sm-6 mb-3 d-flex' }, chartCard)
  )

  container.append(
    header,
    upString,
    middleString,
    cardsContainer,
    transactionHistoryCard
  )

  // Получение информации о счёте с сервера
  try {
    const response = await fetch(`http://localhost:3000/account/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()

    if (!data) {
      throw new Error('No account data found')
    }

    const accountInfo = data.payload
    renderAccountInfo(accountInfo)

    // Конфигурация Chart.js
    const labels = accountInfo.transactions.map(transaction => new Date(transaction.date).toLocaleDateString('ru-RU'))
    const values = accountInfo.transactions.map(transaction => transaction.amount)

    chart = new Chart(chartCard.querySelector('canvas'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Динамика баланса',
          data: values,
          backgroundColor: '#007bff'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Ошибка при получении информации о счёте:', error)
    alert('Произошла ошибка при получении информации о счёте.')
  }

  // Функция для отображения информации о счёте
  function renderAccountInfo (account) {
    accountNumber.textContent = `${account.balance} RUB`

    const tbody = transactionHistoryCard.querySelector('tbody')
    tbody.innerHTML = ''
    account.transactions.slice(-10).reverse().forEach(transaction => {
      const isDebit = transaction.from === id
      const row = el('tr',
        el('td', transaction.from),
        el('td', transaction.to),
        el('td', { style: isDebit ? 'color: red;' : 'color: green;' }, transaction.amount),
        el('td', new Date(transaction.date).toLocaleDateString('ru-RU'))
      )
      tbody.appendChild(row)
    })
  }

  // Обработчик события для отправки перевода
  newTransferCard.querySelector('.send-button').addEventListener('click', async () => {
    const recipientAccount = document.getElementById('recipientAccountInput').value.trim()
    const amount = parseFloat(document.getElementById('amountInput').value)

    if (!recipientAccount || isNaN(amount) || amount <= 0) {
      alert('Пожалуйста, введите корректный счёт получателя и положительную сумму перевода.')
      return
    }

    const token = localStorage.getItem('token')

    // Выполнение перевода
    try {
      const response = await fetch('http://localhost:3000/transfer-funds', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: id,
          to: recipientAccount,
          amount
        })
      })

      const data = await response.json()

      if (data.error) {
        alert(`Ошибка перевода: ${data.error}`)
      } else {
        alert('Перевод успешно выполнен!')
        // Обновление информации о счёте после успешного перевода
        renderAccountInfo(data.payload)
        chart.data.datasets[0].data = data.payload.transactions.map(transaction => transaction.amount)
        chart.update()

        // Сохранение счёта получателя в localStorage
        if (!previousAccounts.includes(recipientAccount)) {
          previousAccounts.push(recipientAccount)
          localStorage.setItem('previousAccounts', JSON.stringify(previousAccounts))
        }
      }
    } catch (error) {
      console.error('Ошибка при выполнении перевода:', error)
      alert('Произошла ошибка при выполнении перевода.')
    }
  })

  return container
}
