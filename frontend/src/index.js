import './index.scss'
import { el, mount } from 'redom'
import Navigo from 'navigo'
import loginPage from './login'
import accountsPage from './accounts'
import accountPage from './accountPage'
import createCurrencyPage from './currencyPage'
import createAtmsPage from './atmsPage'
import detailedBalancePage from './detailedBalancePage'
// import './styles.css'

const router = new Navigo('/', { hash: true })

const app = el('div')
mount(document.getElementById('app'), app)

router.on({
  '/login': () => {
    app.innerHTML = ''
    mount(app, loginPage(router))
  },
  '/accountsPage': async () => {
    app.innerHTML = ''
    mount(app, await accountsPage(router))
  },

  '/account/:id': async ({ data }) => {
    app.innerHTML = ''
    mount(app, await accountPage(router, data.id))
  },
  '/currency': () => {
    app.innerHTML = ''
    mount(app, createCurrencyPage(router))
  },
  '/atms': () => {
    app.innerHTML = ''
    mount(app, createAtmsPage(router))
  },
  '/detailedBalance/:id': async ({ data }) => {
    app.innerHTML = ''
    mount(app, await detailedBalancePage(router, data.id))
  }
}).resolve()

// Redirect to login if no route is matched
router.notFound(() => {
  router.navigate('/login')
})
