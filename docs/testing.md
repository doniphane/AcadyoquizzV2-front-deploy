# Guide des Tests - AcadyoQuizz

## Vue d'ensemble

Ce guide explique comment mettre en place, exécuter et maintenir les tests pour l'application AcadyoQuizz. L'application utilise une stratégie de test moderne avec des outils adaptés à React et TypeScript.

## Architecture de tests

### Types de tests

1. **Tests unitaires** : Composants isolés, fonctions utilitaires
2. **Tests d'intégration** : Interaction entre composants
3. **Tests end-to-end** : Parcours utilisateur complets
4. **Tests de performance** : Chargement et rendu
5. **Tests d'accessibilité** : Conformité WCAG

## Configuration des tests

### Installation des dépendances de test

```bash
# Outils de test principaux
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Types TypeScript pour les tests
pnpm add -D @types/jest jsdom

# Outils supplémentaires
pnpm add -D @testing-library/react-hooks msw happy-dom
```

### Configuration Vitest

Créez `vitest.config.ts` :

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    reporter: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        'dist/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/services': resolve(__dirname, './src/services'),
      '@/types': resolve(__dirname, './src/types')
    }
  }
})
```

### Setup des tests

Créez `src/test/setup.ts` :

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { server } from './mocks/server'

// Configuration globale pour les tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => {
  server.close()
})

// Mock des APIs navigateur
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
global.sessionStorage = localStorageMock
```

### Configuration des mocks

Créez `src/test/mocks/server.ts` :

```typescript
import { setupServer } from 'msw/node'
import { rest } from 'msw'

const API_URL = 'http://localhost:8000'

export const handlers = [
  // Mock de l'authentification
  rest.post(`${API_URL}/api/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'user@example.com',
          role: 'student'
        }
      })
    )
  }),

  // Mock des quiz
  rest.get(`${API_URL}/api/quizzes`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: 'Quiz de test',
          description: 'Description du quiz',
          questions: []
        }
      ])
    )
  }),

  // Mock des résultats
  rest.post(`${API_URL}/api/quiz/:id/submit`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        score: 85,
        correct: 8,
        total: 10
      })
    )
  })
]

export const server = setupServer(...handlers)
```

## Tests unitaires

### Test d'un composant simple

```typescript
// src/components/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Test avec Context et Store

```typescript
// src/components/__tests__/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginForm } from '@/pages/LoginPage'
import { AuthProvider } from '@/components/AuthProvider'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    // Remplir le formulaire
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    // Soumettre
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    // Vérifier les appels API
    await waitFor(() => {
      expect(screen.getByText(/connexion réussie/i)).toBeInTheDocument()
    })
  })

  it('should show validation errors', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    // Soumettre sans remplir les champs
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    await waitFor(() => {
      expect(screen.getByText(/email requis/i)).toBeInTheDocument()
      expect(screen.getByText(/mot de passe requis/i)).toBeInTheDocument()
    })
  })
})
```

### Test des utilitaires

```typescript
// src/utils/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest'
import { formatScore, formatDate, calculatePercentage } from '@/utils/formatters'

describe('Formatters Utilities', () => {
  describe('formatScore', () => {
    it('should format score correctly', () => {
      expect(formatScore(8, 10)).toBe('8/10 (80%)')
      expect(formatScore(0, 10)).toBe('0/10 (0%)')
      expect(formatScore(10, 10)).toBe('10/10 (100%)')
    })
  })

  describe('formatDate', () => {
    it('should format date in French locale', () => {
      const date = new Date('2024-01-15T10:30:00')
      expect(formatDate(date)).toBe('15/01/2024 à 10:30')
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(8, 10)).toBe(80)
      expect(calculatePercentage(0, 10)).toBe(0)
      expect(calculatePercentage(10, 0)).toBe(0)
    })
  })
})
```

## Tests d'intégration

### Test de navigation

```typescript
// src/__tests__/Navigation.integration.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'

describe('Navigation Integration', () => {
  it('should navigate between pages correctly', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    // Vérifier la page d'accueil
    expect(screen.getByText(/bienvenue/i)).toBeInTheDocument()

    // Naviguer vers la page de connexion
    await user.click(screen.getByRole('link', { name: /se connecter/i }))
    
    // Vérifier la page de connexion
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
```

### Test de flux complet

```typescript
// src/__tests__/QuizFlow.integration.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@/test/utils/TestWrapper'
import App from '@/App'

describe('Quiz Flow Integration', () => {
  it('should complete quiz flow from start to finish', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // 1. Se connecter
    await user.click(screen.getByRole('link', { name: /se connecter/i }))
    await user.type(screen.getByLabelText(/email/i), 'student@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))

    // 2. Sélectionner un quiz
    await waitFor(() => {
      expect(screen.getByText(/tableau de bord/i)).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Quiz de test'))

    // 3. Commencer le quiz
    await user.click(screen.getByRole('button', { name: /commencer/i }))

    // 4. Répondre aux questions
    await user.click(screen.getByLabelText(/réponse a/i))
    await user.click(screen.getByRole('button', { name: /suivant/i }))

    // 5. Terminer et voir les résultats
    await user.click(screen.getByRole('button', { name: /terminer/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/résultats/i)).toBeInTheDocument()
      expect(screen.getByText(/score/i)).toBeInTheDocument()
    })
  })
})
```

## Tests End-to-End

### Configuration Playwright

```bash
# Installation de Playwright
pnpm add -D @playwright/test
npx playwright install
```

### Configuration Playwright (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Test E2E complet

```typescript
// e2e/quiz-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Quiz Application E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('complete user journey from login to quiz completion', async ({ page }) => {
    // 1. Naviguer vers la connexion
    await page.click('text=Se connecter')
    await expect(page.locator('h1')).toContainText('Connexion')

    // 2. Se connecter
    await page.fill('input[name="email"]', 'student@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // 3. Vérifier la redirection vers le tableau de bord
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toContainText('Tableau de bord')

    // 4. Sélectionner un quiz
    await page.click('text=Quiz de Mathématiques')
    await expect(page).toHaveURL(/\/quiz\/\d+/)

    // 5. Commencer le quiz
    await page.click('text=Commencer le quiz')
    await expect(page.locator('.question')).toBeVisible()

    // 6. Répondre aux questions
    for (let i = 0; i < 3; i++) {
      await page.click('input[type="radio"]:first-child')
      await page.click('text=Suivant')
    }

    // 7. Terminer le quiz
    await page.click('text=Terminer le quiz')
    
    // 8. Vérifier les résultats
    await expect(page.locator('h1')).toContainText('Résultats')
    await expect(page.locator('.score')).toBeVisible()
    
    // 9. Télécharger le PDF (optionnel)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Télécharger PDF')
    ])
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  })

  test('should handle form validation errors', async ({ page }) => {
    await page.click('text=Se connecter')
    
    // Soumettre sans remplir
    await page.click('button[type="submit"]')
    
    // Vérifier les erreurs
    await expect(page.locator('text=Email requis')).toBeVisible()
    await expect(page.locator('text=Mot de passe requis')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Vérifier que le menu mobile fonctionne
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    await page.click('text=Se connecter')
    await expect(page.locator('form')).toBeVisible()
  })
})
```

## Tests de performance

### Configuration des tests de performance

```typescript
// src/__tests__/Performance.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { performance } from 'perf_hooks'
import App from '@/App'
import { TestWrapper } from '@/test/utils/TestWrapper'

describe('Performance Tests', () => {
  it('should render App component within performance budget', () => {
    const startTime = performance.now()
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Le rendu ne doit pas prendre plus de 100ms
    expect(renderTime).toBeLessThan(100)
  })

  it('should handle large quiz lists efficiently', () => {
    const quizzes = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Quiz ${i}`,
      description: `Description ${i}`
    }))

    const startTime = performance.now()
    
    // Simuler le rendu d'une grande liste
    const result = quizzes.map(quiz => `${quiz.title}: ${quiz.description}`)
    
    const endTime = performance.now()
    const processTime = endTime - startTime
    
    expect(processTime).toBeLessThan(50)
    expect(result).toHaveLength(1000)
  })
})
```

## Tests d'accessibilité

### Configuration jest-axe

```bash
pnpm add -D @axe-core/react jest-axe
```

### Tests d'accessibilité

```typescript
// src/__tests__/Accessibility.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { LoginForm } from '@/pages/LoginPage'
import { TestWrapper } from '@/test/utils/TestWrapper'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('should not have accessibility violations on login form', async () => {
    const { container } = render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper ARIA labels on form elements', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    
    expect(emailInput).toHaveAttribute('aria-required', 'true')
    expect(passwordInput).toHaveAttribute('aria-required', 'true')
  })
})
```

## Scripts de test

### Configuration package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test:coverage && pnpm test:e2e"
  }
}
```

### Commandes de test

```bash
# Tests unitaires et d'intégration
pnpm test                    # Lancer tous les tests
pnpm test:watch             # Mode watch
pnpm test:coverage          # Avec rapport de couverture
pnpm test:ui                # Interface graphique

# Tests E2E
pnpm test:e2e               # Tous les navigateurs
pnpm test:e2e --headed      # Avec interface graphique
pnpm test:e2e --debug       # Mode debug

# Tests spécifiques
pnpm test LoginForm         # Tests d'un composant
pnpm test --grep "should handle click"  # Tests par pattern
```

## Pipeline CI/CD pour les tests

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: |
        cd AcadyoquizzV2-front-deploy
        pnpm install
        
    - name: Run unit tests
      run: |
        cd AcadyoquizzV2-front-deploy
        pnpm test:coverage
        
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: |
        cd AcadyoquizzV2-front-deploy
        pnpm install
        
    - name: Install Playwright browsers
      run: |
        cd AcadyoquizzV2-front-deploy
        npx playwright install --with-deps
        
    - name: Run E2E tests
      run: |
        cd AcadyoquizzV2-front-deploy
        pnpm test:e2e
        
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

## Bonnes pratiques de test

### Structure des tests
- Organiser les tests par fonctionnalité
- Utiliser des noms descriptifs
- Suivre le pattern AAA (Arrange, Act, Assert)
- Maintenir l'isolation des tests

### Données de test
- Utiliser des factories pour les données
- Éviter les données hardcodées
- Nettoyer après chaque test

### Maintenance
- Réviser régulièrement les tests
- Maintenir une couverture > 80%
- Documenter les tests complexes
- Refactoriser les tests dupliqués