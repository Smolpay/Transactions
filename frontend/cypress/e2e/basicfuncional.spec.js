describe('Basic Functionality', () => {
  it('should allow user to login', () => {
    cy.visit('http://localhost:9000/login')
    cy.get('input[name="username"]').type('your-username')
    cy.get('input[name="password"]').type('your-password')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/accounts')
  })

  it('should display list of accounts', () => {
    cy.visit('http://localhost:9000/accounts')
    cy.get('.account-card').should('have.length.at.least', 1)
  })

  it('should allow transferring amount from one account to another', () => {
    cy.visit('http://localhost:9000/accounts')
    cy.get('.account-card').first().click()
    cy.get('button.transfer').click()
    cy.get('input[name="amount"]').type('100')
    cy.get('button[type="submit"]').click()
    cy.contains('Transfer successful').should('be.visible')
  })

  it('should allow creating a new account', () => {
    cy.visit('http://localhost:9000/accounts')
    cy.get('button.create-button').click()
    cy.contains('Account created').should('be.visible')
  })

  it('should allow transferring amount from newly created account', () => {
    cy.visit('http://localhost:9000/accounts')
    cy.get('.account-card').last().click()
    cy.get('button.transfer').click()
    cy.get('input[name="amount"]').type('50')
    cy.get('button[type="submit"]').click()
    cy.contains('Transfer successful').should('be.visible')
  })
})
