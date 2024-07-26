const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents (on, config) {
      // Настройки событий можно добавить здесь
    },
    baseUrl: 'http://localhost:9000',
    specPattern: 'cypress/e2e/**/*.spec.js'
  }
})
