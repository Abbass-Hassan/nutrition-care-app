import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="text-primary">🍎 NutritionCare</h1>
      </header>

      <main className="main">
        <div className="container">
          <h2>Theme Colors</h2>
          
          <div className="color-grid">
            <div className="color-item">
              <div className="color-swatch bg-primary"></div>
              <h3>Primary</h3>
              <p>#4CAF50</p>
              <p>Fresh Green - health, vitality</p>
            </div>
            
            <div className="color-item">
              <div className="color-swatch bg-secondary"></div>
              <h3>Secondary</h3>
              <p>#81C784</p>
              <p>Light Green - support/freshness</p>
            </div>
            
            <div className="color-item">
              <div className="color-swatch bg-accent"></div>
              <h3>Accent</h3>
              <p>#FF9800</p>
              <p>Orange - appetite & energy</p>
            </div>
            
            <div className="color-item">
              <div className="color-swatch bg-light"></div>
              <h3>Background</h3>
              <p>#F5F5F5</p>
              <p>Light Gray - clean, professional</p>
            </div>
          </div>

          <div className="button-showcase">
            <h3>Button Examples</h3>
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-accent">Accent Button</button>
            <button className="btn-outline">Outline Button</button>
          </div>

          <div className="card">
            <h3>Sample Card</h3>
            <p>This is a sample card using the theme colors.</p>
            <button className="btn-primary">Action</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
