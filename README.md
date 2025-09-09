# Customer Web Frontend - Data Visualization Platform

> Modern React TypeScript application for customer data visualization and management

## 🚀 Overview

This is a modern web application built for data visualization and customer management. The project features a comprehensive role-based access control system, responsive design, and modern development practices.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Authentication & Authorization](#-authentication--authorization)
- [Routing System](#-routing-system)
- [Components](#-components)
- [Building for Production](#-building-for-production)
- [Contributing](#-contributing)

## ✨ Features

- **🔐 Role-Based Access Control (RBAC)** - Comprehensive authentication and authorization system
- **📱 Responsive Design** - Mobile-first responsive UI with Tailwind CSS
- **🎨 Modern UI Components** - Reusable components with shadcn/ui
- **🚀 Performance Optimized** - Lazy loading, code splitting, and performance best practices
- **🛡️ Error Handling** - Comprehensive error boundaries and error pages
- **🔄 State Management** - Efficient state management with modern React patterns
- **📊 Data Visualization** - Interactive charts and data visualization components
- **🌙 Theme Support** - Light/dark theme support
- **🔔 Toast Notifications** - User-friendly notification system
- **📄 Pagination** - Efficient data pagination components

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with Hooks and Suspense
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git**

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd FE_WEB_CUSTOMER
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**

   ```bash
   # Copy environment variables
   cp .env.example .env.local

   # Edit the environment variables
   nano .env.local
   ```

4. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📁 Project Structure

```
FE_WEB_CUSTOMER/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Common components (Button, Input, etc.)
│   │   ├── layout/        # Layout components
│   │   ├── error/         # Error handling components
│   │   └── ui/            # shadcn/ui components
│   ├── config/            # Configuration files
│   │   └── routes.ts      # Route configurations and RBAC
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.ts     # Authentication hook
│   ├── pages/             # Page components
│   │   ├── home/          # Home page
│   │   ├── auth/          # Authentication pages
│   │   ├── demo/          # Demo pages
│   │   ├── not-found/     # 404 page
│   │   └── forbidden/     # 403 page
│   ├── router/            # Routing configuration
│   │   ├── AppRouter.tsx  # Main router component
│   │   └── routers.ts     # Route constants
│   ├── theme/             # Theme and styling
│   │   └── animation.ts   # Animation utilities
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Application entry point
├── .env.example           # Environment variables example
├── .gitignore             # Git ignore rules
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Customer Web App

# Authentication
VITE_AUTH_SECRET=your-secret-key

# Other configurations
VITE_ENABLE_ANALYTICS=false
```

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

## 🔐 Authentication & Authorization

### User Roles

- **GUEST** - Non-authenticated users with limited access
- **CUSTOMER** - Authenticated customers with standard access
- **ADMIN** - Administrative users with full access

### Permissions

```typescript
// Available permissions
VIEW_PUBLIC; // View public content
VIEW_PROFILE; // View user profile
EDIT_PROFILE; // Edit user profile
ADMIN_ACCESS; // Admin panel access
MANAGE_USERS; // User management
```

### Role-Permission Mapping

```typescript
const rolePermissions = {
  GUEST: ['VIEW_PUBLIC'],
  CUSTOMER: ['VIEW_PUBLIC', 'VIEW_PROFILE', 'EDIT_PROFILE'],
  ADMIN: ['VIEW_PUBLIC', 'ADMIN_ACCESS', 'MANAGE_USERS'],
};
```

## 🛣️ Routing System

### Route Configuration

Routes are configured in `src/config/routes.ts`:

```typescript
{
  path: '/profile',
  name: 'profile',
  component: 'ProfilePage',
  layout: 'CUSTOMER',
  isProtected: true,
  roles: [UserRole.CUSTOMER],
  permissions: [Permission.VIEW_PROFILE],
  meta: {
    title: 'User Profile',
    description: 'View and edit user profile'
  }
}
```

### Adding New Routes

1. **Define the route** in `src/config/routes.ts`
2. **Add component** to `componentMap` in `AppRouter.tsx`
3. **Create the page component** in appropriate directory

### Protected Routes

Routes can be protected by:

- **Authentication** - `isProtected: true`
- **Roles** - `roles: [UserRole.CUSTOMER]`
- **Permissions** - `permissions: [Permission.VIEW_PROFILE]`

## 🧩 Components

### Layout Components

- **CustomerLayout** - Main layout for customer pages
- **AuthLayout** - Layout for authentication pages

### Common Components

- **Button** - Reusable button component
- **Input** - Form input components
- **Modal** - Modal dialog component
- **Toast** - Notification component
- **Pagination** - Data pagination component

### Error Handling

- **ErrorBoundary** - React error boundary
- **NotFoundPage** - 404 error page
- **ForbiddenPage** - 403 access denied page

## 🏗️ Building for Production

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Preview the build**

   ```bash
   npm run preview
   ```

3. **Deploy**
   - The `dist` folder contains the production build
   - Deploy to your preferred hosting service

### Build Optimizations

- **Code Splitting** - Automatic route-based code splitting
- **Tree Shaking** - Unused code elimination
- **Asset Optimization** - Image and asset optimization
- **Bundle Analysis** - Analyze bundle size with `npm run build --analyze`

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Follow coding standards**
   ```bash
   npm run lint
   npm run format
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/new-feature
   ```
7. **Create a Pull Request**

### Coding Standards

- Use **TypeScript** for type safety
- Follow **ESLint** rules
- Use **Prettier** for code formatting
- Write **meaningful commit messages**
- Add **comments** for complex logic
- Create **reusable components**

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- **Email**: support@example.com
- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

---

**Happy Coding! 🚀**

#### Màu background Tailwind

bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
