import { el } from 'redom'

const headerComponent = (router) => {
  return el('header', { class: 'header' },
    el('div', { class: 'row' }),
    el('div', { class: 'header-left' }, 'Coin.'),
    el('div', { class: 'header-right' },
      el('button', { onclick: () => router.navigate('/atms') }, 'Банкоматы'),
      el('button', { onclick: () => router.navigate('/accounts') }, 'Счета'),
      el('button', { onclick: () => router.navigate('/currency') }, 'Валюта'),
      el('button', { onclick: () => { localStorage.removeItem('token'); router.navigate('/login') } }, 'Выйти')
    )
  )
}

export default headerComponent
