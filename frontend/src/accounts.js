import { el, setChildren } from 'redom'
import headerComponent from './headerComponent'

// Глобальная переменная для хранения данных счетов
let cachedAccounts = null

export default function accountsPage (router) {
  const container = el('div', { class: 'accounts-container' })

  const header = headerComponent(router)

  const sortSelect = el('select', { class: 'accounts-sort-select' },
    el('option', { value: 'account' }, 'Номер счета'),
    el('option', { value: 'balance' }, 'Баланс'),
    el('option', { value: 'lastTransaction' }, 'Время последней транзакции')
  )

  const createButton = el('button', { class: 'create-button' }, '+ Создать новый счёт')
  const accountsList = el('div', { class: 'accounts-list' })
  const errorElement = el('p', { id: 'error', style: 'color: red;' })

  const titleBar = el('div', { class: 'accounts' },
    el('div', { class: 'row' },
      el('div', { class: 'col-2' },
        el('h2', { class: 'accounts-title' }, 'Ваши счета')
      ),
      el('div', { class: 'col-sm' }, sortSelect),
      el('div', { class: 'col-2' }, createButton)
    ),
    el('div', { class: 'actions' },
      accountsList,
      errorElement
    )
  )

  setChildren(container, [
    header,
    titleBar
  ])

  const fetchAccounts = async () => {
    if (cachedAccounts) {
      renderAccounts(cachedAccounts)
      return
    }

    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:3000/accounts', {
        headers: {
          Authorization: `Basic ${token}`
        }
      })
      const result = await response.json()
      if (result.error) {
        errorElement.textContent = result.error
      } else {
        cachedAccounts = result.payload
        renderAccounts(cachedAccounts)
      }
    } catch (error) {
      console.error('Fetch accounts error:', error)
      errorElement.textContent = 'Произошла ошибка при загрузке счетов.'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  }

  const renderAccounts = (accounts) => {
    accountsList.innerHTML = ''
    accounts.forEach(account => {
      const lastTransactionDate = account.transactions[0]?.date ? formatDate(account.transactions[0].date) : 'N/A'
      const accountElement = el('div', { class: 'account-card' },
        el('p', ` ${account.account}`),
        el('p', ` ${account.balance} RUB`),
        el('p', 'Последняя транзакция:',
          el('p', `${lastTransactionDate}`)
        ),
        el('button', { class: 'open-button', onclick: () => router.navigate(`/account/${account.account}`) }, 'Открыть')
      )
      accountsList.appendChild(accountElement)
    })
  }

  createButton.onclick = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:3000/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${token}`
        }
      })
      const result = await response.json()
      if (result.error) {
        errorElement.textContent = result.error
      } else {
        cachedAccounts = null // Сбросить кэш при создании нового счёта
        fetchAccounts()
      }
    } catch (error) {
      console.error('Create account error:', error)
      errorElement.textContent = 'Произошла ошибка при создании счёта.'
    }
  }

  fetchAccounts()

  return container
}
