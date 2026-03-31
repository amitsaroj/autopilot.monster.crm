# Autopilot Monster CRM | Next.js Presentation Layer

Welcome to the **Frontend Client** of the Autopilot Monster CRM. This interface is built utilizing bleeding-edge React architectures (Next.js 14 App Router) engineered to deliver an uncompromising user experience, blazing-fast data fetching, and an incredibly dense UI built for operational efficiency.

## 🎨 Design & UI Philosophy

*   **Tailwind CSS + shadcn/ui:** We utilize utility-first atomic CSS strictly governed by a centralized design token system (`tailwind.config.ts`).
*   **Motion & 3D:** Seamless route transitions and 3D hero canvases implemented via Framer Motion and modern WebGL wrappers, creating that coveted "Wow Factor" for premium enterprise clients.
*   **React Server Components (RSC):** Aggressive use of server-side data fetching to minimize client bundle sizes. Protected routes are evaluated dynamically at the edge.

## 🚀 Key Feature Components

*   **CRM Kanban Boards:** Highly optimized drag-and-drop Deal interfaces. Local state is synchronized seamlessly via optimistic UI updates before confirming with the NestJS backend.
*   **Unified Inbox & Communications:** A real-time, socket-ready inbox that amalgamates Email, SMS, WhatsApp, and internal system logs into one cohesive feed per contact.
*   **AI Visual Flow Builders:** React Flow powers our custom bot-building graphical interfaces. Users can drag nodes and define branching logic visually.
*   **Admin Portals:** Dynamic, data-heavy tables with serverside pagination, sorting, and inline editing for tenant and sub-admin operations.

## 🛠 Development & Deployment

### Build Optimization
The project configures Next.js for **Standalone output** (`output: 'standalone'` in `next.config.mjs`). This severely minimizes the size of the deployed Docker container by compiling node_modules to only include strictly necessary production dependencies.

### Environment Linkage
The only required frontend environment variable is:
```properties
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
Because of browser security paradigms (CORS), the frontend is required to communicate over HTTPS/HTTP directly to the Backend Load Balancer or local Express gateway.

### Running Locally
While primarily orchestrated via Docker Compose, you can perform rapid UI iteration locally:

```bash
# Intall exact UI dependencies
npm install

# Start hot-reloading dev server on port 3000
npm run dev

# Verify strict typings and linting
npm run lint
```
