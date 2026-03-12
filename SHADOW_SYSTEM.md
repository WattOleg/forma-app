# 🎨 Система теней и эффектов 3D

Глобальная система теней с поддержкой CSS переменных для единого визуального стиля.

## 📦 Доступные переменные

### Базовые тени
```css
--shadow-sm      /* 0 2px 8px rgba(0,0,0,0.3) - маленькие элементы */
--shadow-md      /* 0 4px 24px rgba(0,0,0,0.4) - текст, небольшие блоки */
--shadow-lg      /* 0 10px 30px rgba(0,0,0,0.5) - средние карточки */
--shadow-xl      /* 0 12px 40px rgba(0,0,0,0.6) - большие элементы */
```

### Тени для карточек
```css
--shadow-card       /* Базовая тень карточки */
--shadow-elevated   /* Возвышенная карточка с внутренней тенью */
--shadow-deep       /* Глубокая тень для контрастных элементов */
```

### Цветные свечения (glow effects)
```css
--shadow-accent-lg      /* Зелёное свечение (#c8f55a) */
--shadow-blue-lg        /* Синее свечение (#5c9eff) */
--shadow-purple         /* Фиолетовое свечение */
--shadow-red            /* Красное свечение */
```

### Интерактивные эффекты
```css
--shadow-interactive    /* Базовая интерактивная тень */
--shadow-hover          /* Тень при наведении (более выраженная) */
--shadow-active         /* Тень при клике (ещё более выраженная) */
```

## 💻 Примеры использования в React компонентах

### Вариант 1: Простая карточка
```jsx
<div style={{
  boxShadow: 'var(--shadow-card)',
  borderRadius: '20px',
  padding: '20px'
}}>
  Содержимое
</div>
```

### Вариант 2: Карточка с цветным свечением
```jsx
<div style={{
  boxShadow: `var(--shadow-elevated), var(--shadow-accent-lg)`,
  borderRadius: '20px',
  padding: '20px'
}}>
  Важное содержимое
</div>
```

### Вариант 3: Интерактивная карточка
```jsx
<div 
  className="card-interactive"
  style={{
    boxShadow: 'var(--shadow-interactive)',
    borderRadius: '20px',
    padding: '20px'
  }}
  onMouseEnter={e => e.target.style.boxShadow = 'var(--shadow-hover)'}
  onMouseLeave={e => e.target.style.boxShadow = 'var(--shadow-interactive)'}
>
  Интерактивная карточка
</div>
```

### Вариант 4: С динамическим цветом
```jsx
const groupColor = '#c8f55a'
<div style={{
  boxShadow: `var(--shadow-elevated), ${groupColor}08 0 0 25px`,
  borderRadius: '20px'
}}>
  Динамический элемент
</div>
```

## 🎯 Лучшие практики

1. **Используйте переменные** вместо hardcoded значений
2. **Комбинируйте тени** для глубины: `var(--shadow-elevated), var(--shadow-accent-lg)`
3. **Добавляйте переходы**: `transition: box-shadow 0.3s ease`
4. **На больших экранах** используйте выраженные тени, на мобильных - мягче

## 📱 Классы для быстрого применения

```css
.card              /* Базовая карточка */
.card-elevated     /* Возвышенная карточка */
.card-deep         /* Глубокая карточка */
.card-glow         /* Карточка с зелёным свечением */
.card-glow-blue    /* Карточка с синим свечением */
.card-interactive  /* Интерактивная карточка с hover эффектами */
```

## 🔄 Когда обновлять компоненты

Если видишь в компоненте:
```jsx
boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
```

Замени на:
```jsx
boxShadow: 'var(--shadow-card)'
```

Или, если нужна более выраженная тень:
```jsx
boxShadow: 'var(--shadow-elevated)'
```
