import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

const UNITS = ['шт', 'м', 'уп']

export default function Inventory() {
  const navigate = useNavigate()
  const { t } = useLanguage()
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
      <button className="back-link" onClick={() => navigate('/tools')}>‹ {t('back_tools')}</button>
      <h1 className="screen-title">{t('tools_item_inventory')}</h1>
      <p className="screen-subtitle">{t('inv_subtitle')}</p>

      {items.length > 0 && (
        <div className="card" style={{ textAlign: 'center', marginBottom: 14 }}>
          <div className="big-number">{totalValue.toLocaleString('ru-RU')} ₽</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{t('inv_total_value_label')}</div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t('inv_add_title')}</h3>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('inv_label_name')}</label>
          <input type="text" placeholder={t('inv_ph_name')} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('inv_label_qty')}</label>
            <input type="number" inputMode="numeric" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('inv_label_unit')}</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('inv_label_price')}</label>
            <input type="number" inputMode="numeric" placeholder="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>{t('inv_label_low_threshold')}</label>
            <input type="number" inputMode="numeric" placeholder="3" value={lowThreshold} onChange={(e) => setLowThreshold(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-block btn-primary" onClick={addItem} disabled={!name.trim()}>{t('inv_add_btn')}</button>
      </div>

      {items.length === 0 && <div className="empty-state">{t('inv_empty')}</div>}

      {items.map((it) => {
        const low = it.qty <= it.lowThreshold
        return (
          <div key={it.id} className="card">
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
                <div style={{ color: low ? 'var(--danger)' : 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
                  {it.qty} {it.unit} {t('inv_in_stock')}{low ? t('inv_low_stock_suffix') : ''}
                  {it.unitCost > 0 ? ` · ${it.unitCost} ₽/${it.unit}` : ''}
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => removeItem(it.id)}>{t('inv_delete_btn')}</button>
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
