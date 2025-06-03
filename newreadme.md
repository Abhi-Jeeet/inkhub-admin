# Inkhub Admin Dashboard

A modern, full-featured analytics and management dashboard for Shopify, Pinterest, and a custom Design Library. Built with Next.js, React, Redux Toolkit, Tailwind CSS, and AWS SDK, with advanced caching (disk, Valkey/Redis), universal navigation, and highly customizable data views.

---

## 🚀 Features

### Universal Navigation & Layout
- **Global Tab System:** Persistent, global tab bar for all major sections (Shopify, Pinterest, Design Library, etc.), with open/close/switch and state saved in localStorage.
- **Universal Analytics Bar:** Reusable analytics controls (filter, group, aggregate) that adapt to the current section/tab, fully wired to DataView for live analytics.
- **Universal Operation Bar:** Context-aware actions (Download, Upload, etc.) and access to filtered/grouped data.
- **Secondary Sidebar:** Context-sensitive, collapsible sidebar for section navigation.

### DataView Component
- **Highly Customizable:** Table, grid, and card views, with easy-to-modify layout, effects, and spacing via props.
- **Sticky Headers:** Table and grid headers remain visible when scrolling vertically.
- **Field Selection Modals:** Modern, reusable modals (`GridConfigModal`, `CardConfigModal`) for selecting visible fields in grid and card views.
- **Advanced Field Handling:** Supports nested fields, robust image detection, and clickable links in form views.
- **Tag Filtering & Search:** Filter by tags and search by any field.
- **Edit/Delete Modals:** Responsive modals for editing and deleting items.
- **Paginated View:** Supports paginated data loading with a Next button for all major sections.
- **Per-Card Field Customization:** Card view allows per-card field selection with a settings modal for each card.
- **Grid View Customization:** Grid view supports global field selection with a settings modal.
- **Collapsible Nested Form/JSON View:** Modals for row details support collapsible sections for nested data.
- **Modern UI/UX:** All modals and controls use a modern, clean, and accessible design.

### Shopify Section
- **Tabbed Interface:** Orders, Products, and Collections, managed by the universal tab system.
- **Analytics Bar:** Dynamic controls for filtering, grouping, and aggregation.
- **Orders Analytics:** Filter by status, group by status/customer/date, aggregate by count/sum/average.
- **Products Analytics:** Filter by status, group by type/vendor, aggregate by count/sum inventory.
- **Redux Integration:** Centralized state management for Shopify data.
- **Disk/Valkey Cache & Pagination:** Efficient, persistent caching and paginated API with a Next button.

### Pinterest Section
- **Boards & Pins:** DataView for boards and pins, with analytics and operations.
- **Analytics Bar:** Filter/group/aggregate pins and boards.
- **Redux Integration:** Centralized state management for Pinterest data.
- **Disk/Valkey Cache & Pagination:** Efficient, persistent caching and paginated API with a Next button.

### Design Library Section
- **CRUD Operations:** Create, Read, Update, and Delete designs stored in DynamoDB.
- **Image Support:** Upload and display design images from S3, with public read access.
- **Table, Grid, and Card Views:** Switch between layouts, with modals for details and editing.
- **Tag Filtering & Search:** Filter by tags and search by any field.
- **Redux Integration:** Centralized state management for design data.
- **Disk/Valkey Cache & Pagination:** Efficient, persistent caching and paginated API with a Next button.

### Caching System (Disk & Valkey/Redis)
- **Disk-Based LRU Cache:** Fast, persistent, and scalable data access for all major API routes.
- **Valkey/Redis Support:** Optionally use Valkey (Redis-compatible) for caching in development or production.
- **Cache Key Structure:** Resource, page size (`limit`), and pagination key (`lastKey`).
- **TTL (Time-to-Live):** Default 5 minutes, configurable.
- **Cache Invalidation:** On any mutation (create/update/delete), relevant cache keys are invalidated.
- **Pagination Support:** Each page of data is cached separately.

### UI/UX Improvements (2024)
- **Sticky Table/Grid Headers**
- **Field Selection Modals**
- **Per-Card and Global Field Customization**
- **Collapsible Nested Form/JSON View**
- **Robust Image and Link Handling**
- **Overflow, Truncation, and Tooltips**

---

## 🏗️ Tech Stack
- **Next.js 14** (App Router)
- **React 18**
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **AWS SDK v3** for DynamoDB and S3
- **Valkey/Redis** and **lru-cache** for caching
- **TypeScript**
- **Docker** for local development and caching

---

## 📁 Directory Structure

- `src/components/common/` — Shared UI and logic components (DataView, TableView, GridView, CardConfigModal, GridConfigModal, etc.)
- `src/components/layout/` — Layout and navigation components (DashboardLayout, Sidebar, TabContext, etc.)
- `src/store/` — Redux store and slices (shopifySlice, pinterestSlice, designLibrarySlice)
- `src/app/` — Next.js app directory (routes, pages, layouts for Shopify, Pinterest, Design Library, Settings)
- `src/utils/` — Utility functions (cache, redis)

---

## 🐳 Docker & Valkey (Redis-Compatible) Caching

You can use [Valkey](https://valkey.io/) (a Redis-compatible in-memory cache) for local development or production caching.

### docker-compose.yml
```yaml
version: '3.8'

services:
  valkey:
    image: valkey/valkey:latest
    container_name: valkey-cache
    ports:
      - "6379:6379"
    volumes:
      - valkey-data:/data
    command: valkey-server --appendonly yes
    restart: unless-stopped
    networks:
      - app-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: inkhub-admin
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=valkey
      - REDIS_PORT=6379
    depends_on:
      - valkey
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  valkey-data:
    driver: local
```

### Dockerfile
```Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Running Locally with Docker
1. **Build and start everything:**
   ```bash
   docker compose up --build
   ```
2. The app will be available at [http://localhost:3000](http://localhost:3000)
3. Valkey will be available at `localhost:6379` for caching.

### Standalone Valkey for Local Dev
If you want to run only Valkey for local dev (not the app):
```bash
docker compose up valkey
```

---

## ⚡ Cache System
- **Disk LRU Cache:** Used by default for all API routes if Valkey/Redis is not available.
- **Valkey/Redis:** If `REDIS_HOST` and `REDIS_PORT` are set, the app uses Valkey for caching (see `src/utils/redis.ts`).
- **Config:**
  - Set `REDIS_HOST` and `REDIS_PORT` in your environment or Docker Compose.
  - Or set `VALKEY_URL=redis://localhost:6379` in `.env.local` for local dev.
- **Cache Utility:** See `src/utils/cache.ts` and `src/utils/redis.ts` for implementation details.

---

## 🛠️ Setup & Development

### 1. Clone the repo
```bash
git clone <repo-url>
cd inkhub-admin
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SHOPIFY_ORDERS_TABLE=shopify_inkhub_get_orders
SHOPIFY_PRODUCTS_TABLE=shopify_inkhub_get_products
DESIGN_TABLE=admin-design-image
VALKEY_URL=redis://localhost:6379
```

### 4. Run the development server
```bash
npm run dev
# or
yarn dev
```

### 5. Open the app
Go to [http://localhost:3000](http://localhost:3000)

---

## 🧩 Major Components & Slices
- **DataView:** Universal data display (table, grid, card) with modals, field selection, and more.
- **TableView, GridView:** Specialized views for tabular and grid data.
- **CardConfigModal, GridConfigModal:** Modern, reusable modals for field selection.
- **UniversalAnalyticsBar, UniversalOperationBar:** Analytics and action bars for all sections.
- **Redux Slices:** `shopifySlice`, `pinterestSlice`, `designLibrarySlice` for state management.
- **DashboardLayout, Sidebar, TabContext:** Layout and navigation.

---

## 🧑‍💻 Contributing
- Fork the repo and create a feature branch.
- Follow the code style and naming conventions.
- Add/Update tests if needed.
- Open a PR with a clear description.

---

## 🐞 Troubleshooting
- **Sticky headers not working?** Make sure the scroll container is set up as in `TableView.tsx` and `GridView.tsx`.
- **Cache not working?** Check your Valkey/Redis connection and environment variables.
- **AWS errors?** Double-check your credentials and table names in `.env.local`.
- **UI bugs?** Check the browser console for errors and inspect the relevant component.

---

## 📚 Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Valkey (Redis-compatible)](https://valkey.io/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Deploy
The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) or your own Docker setup.

---

**Inkhub Admin** — Modern analytics and management for Shopify, Pinterest, and your Design Library.
