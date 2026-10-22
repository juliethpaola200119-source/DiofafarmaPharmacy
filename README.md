# ⚕ DioFaFarma - Sistema Web de Gestión Farmacéutica

Sistema integral para droguerías y farmacias desarrollado con arquitectura desacoplada (Frontend en React + Backend REST API en Node.js/Express con MySQL).

---

## 📁 Estructura del Repositorio (Monorepo)

```
DiofaFarma_ProjectFinal/
├── Diofafarma_FrontEnd/           # Aplicación cliente en React + Vite
│   ├── src/
│   │   ├── components/            # Componentes modulares (Productos, Usuarios, Clientes, Ventas, etc.)
│   │   ├── pages/                 # Páginas (Home, Login, Productos, Usuarios, Clientes, Ventas, Reportes)
│   │   ├── services/              # Conexión HTTP y llamadas a la API
│   │   └── utils/                 # Formateadores de moneda y stock
│   ├── package.json
│   └── vite.config.js
│
├── DiofaFarma_API_REST_Proyecto/  # API RESTful en Node.js + Express + MySQL
│   ├── src/
│   │   ├── controllers/           # Controladores de la API
│   │   ├── routes/                # Enrutadores modulares (/productos, /usuarios, /clientes, /ventas, /reportes)
│   │   ├── services/              # Lógica de negocio y transacciones SQL
│   │   ├── middleware/            # JWT y manejo centralizado de errores
│   │   └── database/              # Pool de conexiones MySQL y auto-migración
│   ├── database/
│   │   └── diofafarma.sql         # Script SQL con estructura y datos semilla
│   └── package.json
│
└── README.md
```

---

## 🚀 Despliegue en la Web (Hosting)

Al ser un monorepo, puedes desplegar cada parte en la plataforma que prefieras:

1. **Frontend (Vercel / Netlify / Cloudflare Pages):**
   - **Root Directory:** `Diofafarma_FrontEnd`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Variable de Entorno:** `VITE_API_URL=https://tu-api-backend.com/api`

2. **Backend (Render / Railway / Railway.app):**
   - **Root Directory:** `DiofaFarma_API_REST_Proyecto`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Variables de Entorno:** `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`.

3. **Base de Datos (MySQL en la nube):**
   - Servicios gratuitos/económicos: **Clever Cloud**, **Railway MySQL**, **Aiven**, **PlanetScale**.
