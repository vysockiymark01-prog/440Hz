import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

const UNITS = ['шт', 'м', 'уп']

export default function Inventory() {
  const navigate = useNavigate()
  const [items, setItems] = useLocalStorage('pt_inventory_v1', [])
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('шт')
  const [qty, setQty] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [lowThreshold, setLowThreshold] = useState('3')

  const addItem = () => {
    if (!name.trim()) return
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(36),
        name: name.trim(),
        unit,
        qty: qty === '' ? 0 : Number(qty),
        unitCost: unitCost === '' ? 0 : Number(unitCost),
        lowThreshold: lowThreshold === '' ? 3 : Number(lowThreshold),
      },
    ])
    setName('')
    setQty('')
    setUnitCost('')
    setLowThreshold('3')
  }

  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id))

  const adjustQty = (id, delta) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)))
  }

  const setItemQty = (id, value) => {
    const num = value === '' ? 0 : Number(value)
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: num } : it)))
  }

  const totalValue = items.reduce((sum, it) => sum + it.qty * it.unitCost, 0)

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/tools')}>‹ Инструменты</button>
      <h1 className="screen-title">Склад расходников</h1>
      <p className="screen-subtitle">
        Струны, войлок, клей и другие расходники с остатками и закупочной ценой. Списывайте прямо в
        «Моих заказах», когда используете материал на визите.
      </p>

      {items.length > 0 && (
        <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
          <div className="big-number">{totalValue.toLocaleString('ru-RU')} ₽</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>стоимость остатков на складе</div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Добавить позицию</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Название</label>
          <input type="text" placeholder="например, струна №34" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Остаток</label>
            <input type="number" inputMode="numeric" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Ед. изм.</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Цена за ед., ₽</label>
            <input type="number" inputMode="numeric" placeholder="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Мало, если меньше</label>
            <input type="number" inputMode="numeric" placeholder="3" value={lowThreshold} onChange={(e) => setLowThreshold(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-block btn-primary" onClick={addItem} disabled={!name.trim()}>Добавить</button>
      </div>

      {items.length === 0 && <div className="empty-state">Склад пуст — добавьте первую позицию выше.</div>}

      {items.map((it) => {
        const low = it.qty <= it.lowThreshold
        return (
          <div key={it.id} className="card">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
                <div style={{ color: low ? 'var(--danger)' : 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {it.qty} {it.unit} в наличии{low ? ' · мало, пора закупить' : ''}
                  {it.unitCost > 0 ? ` · ${it.unitCost} ₽/${it.unit}` : ''}
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => removeItem(it.id)}>Удалить</button>
            </div>
            <div className="row" style={{ marginTop: 10, gap: 8, alignItems: 'center' }}>
              <button className="btn btn-sm" onClick={() => adjustQty(it.id, -1)}>−1</button>
              <input
                type="number"
                inputMode="numeric"
                value={it.qty}
                onChange={(e) => setItemQty(it.id, e.target.value)}
                style={{ width: 70, textAlign: 'center' }}
              />
              <button className="btn btn-sm" onClick={() => adjustQty(it.id, 1)}>+1</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
