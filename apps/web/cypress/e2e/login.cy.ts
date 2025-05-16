/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        /**
         * Sign up a test user, ignoring 409 conflicts.
         * @example cy.signup()
         */
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        signup(): Chainable<any>;
    }
}

/**
 * ログイン E2E
 * 1. テストユーザーを事前に作成（重複は 409）
 * 2. /login から認証 → タスク一覧（/tasks）へリダイレクトを確認
 */

const email = 'testuser@example.com';
const password = 'password';

Cypress.Commands.add('signup', () => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/signup`,
        body: { email, password },
        failOnStatusCode: false, // 409 Conflict を無視
    });
});

describe('Login flow', () => {
    before(() => {
        cy.signup();
    });

    it('logs in and redirects to /', () => {
        cy.visit('/login');

        cy.get('input[type="email"]').type(email);
        cy.get('input[type="password"]').type(password);
        cy.contains('button', 'ログイン').click();

        cy.url().should('eq', `${Cypress.config().baseUrl}/tasks`);
        cy.contains('ログアウト');
    });
});