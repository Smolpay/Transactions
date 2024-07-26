import { el, mount } from 'redom'
import Chart from 'chart.js/auto'
import headerComponent from './headerComponent'

export default async function detailedBalancePage (router, id) {
  const container = el('div')
  let balanceChart = null
  const ratioChart = null

  const header = headerComponent(router)

  const backButton = el('button', { class: 'back-button-detailed', onclick: () => router.navigate(`/account/${id}`) }, '<- Вернуться назад')
  const balanceTitle = el('h2', 'История баланса')
  const accountNumber = el('p', `№ ${id}`)

  const balanceChartCard = el('div', { class: 'card' },
    el('p', { style: 'font-weight: bold;' }, 'Динамика баланса'),
    el('canvas', { id: 'balanceChart', style: 'width: 100%; height: 300px;' })
  )
  const ratioChartCard = el('div', { class: 'card' },
    el('p', { style: 'font-weight: bold;' }, 'Соотношение входящих и исходящих транзакций'),
    el('canvas', { id: 'ratioChart', style: 'width: 100%; height: 300px;' }),
    el('p', { id: 'ratioMaxValue', style: 'text-align: right; font-weight: bold;' })
  )
  container.append(
    header,
    backButton,
    balanceTitle,
    accountNumber,
    balanceChartCard,
    ratioChartCard
  )

  // Fetch account information from the server
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
    console.log(data.payload)
    if (!data) {
      throw new Error('No account data found')
    }

    const accountInfo = data.payload

    // Populate balance chart
    const balanceLabels = []
    const balanceValues = []
    const transactionsByMonth = {}
    const currentDate = new Date()
    currentDate.setDate(1)

    for (let i = 0; i < 12; i++) {
      const month = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
      balanceLabels.unshift(month)
      transactionsByMonth[month] = { balance: 0, transactions: [] }
      currentDate.setMonth(currentDate.getMonth() - 1)
    }

    accountInfo.transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      const month = transactionDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
      if (transactionsByMonth[month]) {
        // transactionsByMonth[month].balance += transaction.amount
        transactionsByMonth[month].transactions.push(transaction)
      }
    })

    // Object.values(transactionsByMonth).forEach(({ balance }) => {
    //   balanceValues.push(balance)
    // })
    let cumulativeBalance = 0
    balanceLabels.forEach(month => {
      const { transactions } = transactionsByMonth[month]
      transactions.forEach(transaction => {
        cumulativeBalance += transaction.amount
      })
      balanceValues.push(cumulativeBalance)
    })

    const minBalance = Math.min(...balanceValues)
    const maxBalance = Math.max(...balanceValues)

    balanceChart = new Chart(balanceChartCard.querySelector('#balanceChart'), {
      type: 'bar',
      data: {
        labels: balanceLabels,
        datasets: [{
          label: 'Динамика баланса',
          data: balanceValues,
          backgroundColor: '#007bff'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            min: minBalance,
            max: maxBalance
          }
        }
      }
    })

    // Populate ratio chart
    // const ratioLabels = balanceLabels
    // const positiveAmounts = []
    // const negativeAmounts = []

    // ratioLabels.forEach(month => {
    //   const { transactions } = transactionsByMonth[month]
    //   let positiveSum = 0
    //   let negativeSum = 0
    //   transactions.forEach(transaction => {
    //     if (transaction.from === id) {
    //       negativeSum += transaction.amount
    //     } else {
    //       positiveSum += transaction.amount
    //     }
    //   })
    //   positiveAmounts.push(positiveSum)
    //   negativeAmounts.push(negativeSum)
    // })

    // ratioChart = new Chart(ratioChartCard.querySelector('#ratioChart'), {
    //   type: 'bar',
    //   data: {
    //     labels: ratioLabels,
    //     datasets: [
    //       {
    //         label: 'Доходные транзакции',
    //         // data: positiveAmounts,
    //         data: positiveAmounts,
    //         backgroundColor: 'green',
    //         stack: 'combined'
    //       },
    //       {
    //         label: 'Расходные транзакции',
    //         data: negativeAmounts.map(amount => -amount),
    //         backgroundColor: 'red',
    //         stack: 'combined'
    //       }
    //     ]
    //   },
    //   options: {
    //     responsive: true,
    //     scales: {
    //       x: {
    //         stacked: true
    //       },
    //       y: {
    //         stacked: true,
    //         beginAtZero: true
    //       }
    //     }
    //   }
    // })
    const transactionRatioData = balanceLabels.map(month => {
      const { transactions } = transactionsByMonth[month]
      let positiveTransactions = 0
      let negativeTransactions = 0

      transactions.forEach(transaction => {
        if (transaction.amount > 0) {
          positiveTransactions += transaction.amount
        } else {
          negativeTransactions += transaction.amount
        }
      })

      return {
        positive: positiveTransactions,
        negative: Math.abs(negativeTransactions)
      }
    })

    const ratioChart = new Chart(ratioChartCard.querySelector('#ratioChart'), {
      type: 'bar',
      data: {
        labels: balanceLabels,
        datasets: [
          {
            label: 'Доходные транзакции',
            data: transactionRatioData.map(data => data.positive),
            backgroundColor: 'green'
          },
          {
            label: 'Расходные транзакции',
            data: transactionRatioData.map(data => data.negative),
            backgroundColor: 'red'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            stacked: true,
            beginAtZero: true
          },
          x: {
            stacked: true
          }
        }
      }
    })

    const maxRatioValue = Math.max(...positiveAmounts.map(Math.abs), ...negativeAmounts.map(Math.abs))
    ratioChartCard.querySelector('#ratioMaxValue').textContent = `Макс. значение: ${maxRatioValue}`
  } catch (error) {
    console.error('Ошибка при получении информации о счёте:', error)
    alert('Произошла ошибка при получении информации о счёте.')
  }

  const transactionTitle = el('h2', 'История переводов')

  const transactionHistoryCard = el('div', { class: 'card', style: 'width: 100%;' },
    el('h3', 'История переводов'),
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

  container.append(
    transactionTitle,
    transactionHistoryCard
  )

  // Fetch account information from the server
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
    const tbody = transactionHistoryCard.querySelector('tbody')
    tbody.innerHTML = ''
    accountInfo.transactions.slice(-25).reverse().forEach(transaction => {
      const isDebit = transaction.from === id
      const row = el('tr',
        el('td', transaction.from),
        el('td', transaction.to),
        el('td', { style: isDebit ? 'color: red;' : 'color: green;' }, transaction.amount),
        el('td', new Date(transaction.date).toLocaleDateString('ru-RU'))
      )
      tbody.appendChild(row)
    })
  } catch (error) {
    console.error('Ошибка при получении информации о счёте:', error)
    alert('Произошла ошибка при получении информации о счёте.')
  }

  return container
}
