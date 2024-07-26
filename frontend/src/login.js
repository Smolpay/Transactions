import { el, setChildren } from 'redom'

export default function loginPage (router) {
  const container = el('div')

  const header = el('header', { class: 'header' },
    el('div', { class: 'header-left' }, 'Coin.')
  )

  const loginForm = el('div', { class: 'login-card' },
    el('form', { class: 'login-form' },
      el('h1', 'Вход в аккаунт'),
      el('p', 'Логин', { class: 'login-text' },
        el('input', { class: 'login-input', type: 'text', placeholder: 'login', id: 'login' })
      ),
      el('p', 'Пароль', { class: 'login-text' },
        el('input', { class: 'login-input', type: 'password', placeholder: 'Password', id: 'password' })
      ),
      el('button', { class: 'login-button', type: 'submit' }, 'Войти'),
      el('p', { id: 'error', style: 'color: red;' })
    )
  )

  setChildren(container, [
    header,
    loginForm
  ])

  loginForm.onsubmit = async (e) => {
    e.preventDefault()
    const login = loginForm.querySelector('#login').value.trim()
    const password = loginForm.querySelector('#password').value.trim()
    const errorElement = loginForm.querySelector('#error')

    console.log('Login attempt:', { login, password })

    if (login.length < 6 || password.length < 6 || /\s/.test(login) || /\s/.test(password)) {
      errorElement.textContent = 'Login and password must be at least 6 characters long and contain no spaces.'
      return
    }

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, password })
      })

      const result = await response.json()

      console.log('Login response:', result)

      if (result.error) {
        errorElement.textContent = result.error
      } else {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('token', result.payload.token)
        }
        router.navigate('/accountsPage')
      }
    } catch (error) {
      console.error('Login error:', error)
      errorElement.textContent = 'An error occurred during login.'
    }
  }

  return container
}
