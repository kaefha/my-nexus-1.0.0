# MAI NIMS (Nexus Inventory Management System)

MAI NIMS is a modern, responsive, and enterprise-grade web application built to handle complex inventory, warehouse operations, procurement, and logistics management. 

## 🚀 Features

- **Dynamic Dashboard**: Real-time overview of inventory alerts, recent RFC (Request for Consumption) activities, and quick access to core modules.
- **Inventory & Warehouse Management**: Full visibility into stock levels, material tracking, goods receipts, and issuances.
- **RFC & Project Management**: End-to-end request tracking for project consumptions with dedicated approval flows.
- **Procurement & Logistics**: Vendor management, procurement monitoring, and real-time shipment map tracking.
- **Master Data**: Centralized management for materials, warehouses, vendors, and users.
- **Responsive App-like UI**: A fully rigid, desktop-app-like web interface preventing native browser bounce effects, optimized with flexible and responsive data tables.

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom implementation based on [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/kaefha/my-nexus-1.0.0.git
   cd mai-nims
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

*(To access the application from another device on the same local network, you can run `npm run dev -- -H 0.0.0.0` and visit `http://<your-local-ip>:3000`)*

## 🤝 Contribution & Deployment

- To build the application for production, use `npm run build`.
- To preview the production build locally, use `npm run start`.
