// import { el, mount } from 'redom'
// import Navigo from 'navigo'
// import loginPage from './login'
// import createAtmsPage from './atmsPage'
// import accountsPage from './accounts'
// import accountPage from './accountPage'
// import currencyPage from './currencyPage'
// import './index.scss'

// const mainContainer = document.getElementById('app')

// const router = new Navigo('/')

// const render = (component) => {
//   mainContainer.innerHTML = ''
//   mount(mainContainer, component)
// }

// router.on('/login', () => {
//   render(loginPage(router))
// }).resolve()

// router.on('/atms', () => {
//   render(createAtmsPage(router))
// }).resolve()

// router.on('/accounts', () => {
//   render(accountsPage(router))
// }).resolve()

// router.on('/account/:id', (params) => {
//   render(accountPage(router, params))
// }).resolve()

// router.on('/currency', () => {
//   render(currencyPage(router))
// }).resolve()

// // Redirect to login if no route matches
// router.notFound(() => {
//   router.navigate('/login')
// }).resolve()
