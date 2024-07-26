import { el } from 'redom'
import headerComponent from './headerComponent'

const createAtmsPage = (router) => {
  const header = headerComponent(router)

  const container = el('div')

  const title = el('h1', 'Карта банкоматов')
  const mapContainer = el('div', { id: 'map', class: 'map' })

  container.append(header, title, mapContainer)

  const loadYandexMap = () => {
    ymaps.ready(() => {
      const map = new ymaps.Map('map', {
        center: [55.751574, 37.573856],
        zoom: 10,
        controls: ['zoomControl', 'fullscreenControl']
      })

      fetch('http://localhost:3000/banks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then(data => {
          if (!Array.isArray(data.payload)) {
            throw new TypeError('Expected an array of ATM locations')
          }
          console.log(data)
          data.payload.forEach(atm => {
            const placemark = new ymaps.Placemark([atm.lat, atm.lon], {
              balloonContent: 'Банкомат'
            })
            map.geoObjects.add(placemark)
          })
        })
        .catch(error => {
          console.error('Error fetching ATM locations:', error)
          alert('Ошибка при получении данных о банкоматах.')
        })
    })
  }

  loadYandexMap()

  return container
}

export default createAtmsPage
