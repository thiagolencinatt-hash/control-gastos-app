# 💰 FinanzApp — Control de Gastos Personal

> App financiera personal inteligente construida con Next.js 16, diseño premium "Nano Banana" (dark + dorado eléctrico), ventanas flotantes arrastrables, cotizaciones del dólar en tiempo real y asistente IA integrado.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-purple?logo=framer)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Funcionalidades

### 📊 Dashboard Central (Todo en 1 Página)
- **Balance general** editable con 1 clic — saldo real, ingresos y gastos
- **Configuración de sueldo mensual** — ingresá tu sueldo y día de cobro
- **Cotización dólar en vivo** — Blue, MEP, Oficial y Crypto (fuentes argentinas)
- **Cuentas y billeteras** — Santander, Mercado Pago, crypto, efectivo USD
- **Gráfico de gastos** por categoría
- **Transacciones recientes** editables directamente desde el dashboard

### 🎯 Metas & Ahorros con Asignación Inteligente
- Crear/editar/borrar metas de ahorro y wishlist
- **Distribuir sueldo entre metas** — porcentaje rápido (10%, 20%, 30%) o monto exacto
- **Priorización** ⭐ Alta / Media / Baja
- **Proyección**: "¡A este ritmo alcanzás la meta en X meses!"
- Botones rápidos +$20k / +$50k para sumar ahorros
- **"Borrar Todo"** para limpiar metas ficticias con 1 clic

### 💳 Cuotas & Tarjetas
- Registrar compras en cuotas con cálculo automático de valor por cuota
- Toggle sin interés / con interés + CFT
- Marcar cuotas como pagas con 1 clic
- Calculadora de cuotas vs inflación
- Proyección futura de compromisos mensuales
- **"Borrar Todo"** para empezar en limpio

### 🤖 Asistente IA (Gemini)
- Chat inteligente sobre tus finanzas
- Análisis de hábitos de gasto
- Sugerencias de ahorro personalizadas

### 🎨 Diseño Premium
- Tema "Nano Banana" — fondo oscuro `#0f172a` con acento dorado eléctrico
- **Ventanas flotantes arrastrables** (Framer Motion drag)
- Botones 3D con feedback físico (`btn-3d`)
- Glassmorphism con backdrop-blur
- Animaciones suaves de entrada (`animate-slide-up`, `animate-fade-in`)
- **100% responsivo** — mobile-first para iOS y Android

---

## 📱 Optimizado para Móvil (iOS / Android)

- Layout `dvh` (dynamic viewport height) para evitar problemas con la barra del navegador
- Barra de navegación inferior nativa con iconos grandes
- Touch targets ≥ 44px para accesibilidad táctil
- Ventanas arrastrables con drag constraints responsivos
- PWA-ready con `manifest.json` y meta tags de Apple

---

## 🚀 Instalación y Desarrollo

### Requisitos
- **Node.js** ≥ 18
- **npm** ≥ 9

### Setup

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/control-gastos-app.git
cd control-gastos-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus keys de Supabase y Gemini

# Ejecutar en modo desarrollo
npm run dev
```

Abrí **http://localhost:3000** en tu navegador o celular (mismo WiFi).

### Variables de Entorno

Crear `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
GEMINI_API_KEY=tu-api-key-de-gemini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Nota**: La app funciona perfectamente en modo demo sin configurar Supabase. Los datos se gestionan en memoria.

---

## 🏗️ Arquitectura del Proyecto

```
finance-app/
├── app/
│   ├── (dashboard)/          # Páginas del panel principal
│   │   ├── page.tsx          # Dashboard central (TODO en 1 página)
│   │   ├── goals/            # Metas y ahorros
│   │   ├── installments/     # Cuotas y deudas
│   │   ├── transactions/     # Historial de movimientos
│   │   ├── ai-assistant/     # Chat IA financiero
│   │   └── settings/         # Configuración
│   ├── api/                  # API Routes (Next.js)
│   │   ├── accounts/
│   │   ├── goals/
│   │   ├── installments/
│   │   ├── transactions/
│   │   ├── summary/
│   │   ├── rates/            # Cotizaciones del dólar
│   │   ├── finances/         # Ajuste rápido de finanzas
│   │   └── ai-assistant/     # Endpoint del asistente IA
│   ├── login/                # Página de login
│   ├── globals.css           # Tema Nano Banana + utilidades
│   └── layout.tsx            # Root layout con providers
├── components/
│   ├── dashboard/            # Componentes del dashboard
│   ├── goals/                # Formularios y tarjetas de metas
│   ├── installments/         # Formularios y tarjetas de cuotas
│   ├── transactions/         # Formularios y filtros
│   ├── layout/               # Header, Sidebar, BottomNav
│   ├── ui/                   # DraggableWindow y primitivas
│   └── providers/            # ThemeProvider
├── lib/
│   ├── demo-data.ts          # Estado en memoria (modo demo)
│   ├── types.ts              # TypeScript types
│   ├── supabase/             # Clientes Supabase
│   ├── gemini/               # Cliente y prompts Gemini IA
│   └── utils/                # Formateo de monedas, cn()
├── public/                   # Assets estáticos + manifest PWA
└── supabase/
    └── schema.sql            # Esquema de base de datos
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Lenguaje** | TypeScript 5 |
| **Estilos** | CSS Variables + Custom Properties + Glassmorphism |
| **Animaciones** | Framer Motion 11 (drag, layout, AnimatePresence) |
| **Base de datos** | Supabase (PostgreSQL) / Demo en memoria |
| **IA** | Google Gemini API |
| **Cotizaciones** | DolarAPI.com (Blue, MEP, Oficial, Crypto) |
| **Icons** | Lucide React |
| **Fechas** | date-fns con locale `es` |

---

## 📄 Licencia

MIT © 2026
