import { useEffect, useMemo, useState } from 'react'
import './styles.css'

interface Product {
  id: number
  name: string
  price: number
  emoji: string
  category: 'Drinks' | 'Food' | 'Snacks'
}

interface CartLine {
  product: Product
  qty: number
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Espresso', price: 3.5, emoji: '☕', category: 'Drinks' },
  { id: 2, name: 'Iced Latte', price: 4.5, emoji: '🧊', category: 'Drinks' },
  { id: 3, name: 'Orange Juice', price: 3.0, emoji: '🍊', category: 'Drinks' },
  { id: 4, name: 'Burger', price: 7.5, emoji: '🍔', category: 'Food' },
  { id: 5, name: 'Pizza Slice', price: 5.0, emoji: '🍕', category: 'Food' },
  { id: 6, name: 'Caesar Salad', price: 6.5, emoji: '🥗', category: 'Food' },
  { id: 7, name: 'Fries', price: 3.25, emoji: '🍟', category: 'Snacks' },
  { id: 8, name: 'Pretzel', price: 2.0, emoji: '🥨', category: 'Snacks' },
  { id: 9, name: 'Cookie', price: 2.5, emoji: '🍪', category: 'Snacks' }
]

const TABS = ['All', 'Drinks', 'Food', 'Snacks'] as const
const TAX_RATE = 0.08

function App(): JSX.Element {
  const [version, setVersion] = useState('')
  const [tab, setTab] = useState<(typeof TABS)[number]>('All')
  const [cart, setCart] = useState<CartLine[]>([])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    window.updater.getVersion().then(setVersion)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const visibleProducts = useMemo(
    () => (tab === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === tab)),
    [tab]
  )

  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  function addToCart(product: Product): void {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { product, qty: 1 }]
    })
  }

  function changeQty(id: number, delta: number): void {
    setCart((prev) =>
      prev
        .map((l) => (l.product.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    )
  }

  function checkout(): void {
    setToast(`Payment of $${total.toFixed(2)} received`)
    setCart([])
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          PointSoft
        </div>
        <button className="version-chip" onClick={() => window.updater.checkForUpdates()}>
          v{version} · check for updates
        </button>
      </header>

      <div className="layout">
        <main className="catalog">
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <button key={product.id} className="product-card" onClick={() => addToCart(product)}>
                <div className="product-emoji">{product.emoji}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-price">${product.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </main>

        <aside className="cart">
          <div className="cart-title">Current Order</div>

          <div className="cart-items">
            {cart.length === 0 && <div className="cart-empty">Tap a product to add it</div>}
            {cart.map((line) => (
              <div className="cart-item" key={line.product.id}>
                <span>{line.product.emoji}</span>
                <span className="cart-item-name">{line.product.name}</span>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => changeQty(line.product.id, -1)}>
                    −
                  </button>
                  {line.qty}
                  <button className="qty-btn" onClick={() => changeQty(line.product.id, 1)}>
                    +
                  </button>
                </div>
                <span className="cart-item-price">
                  ${(line.product.price * line.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="totals-row grand">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button className="checkout-btn" disabled={cart.length === 0} onClick={checkout}>
            Charge ${total.toFixed(2)}
          </button>
        </aside>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
