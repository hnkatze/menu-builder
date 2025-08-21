# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server
- **Build**: `npm run build` - Creates production build
- **Lint**: `npm run lint` - Runs ESLint (disabled during builds in next.config.mjs)
- **Production server**: `npm start` - Starts production server after build

## Architecture Overview

This is a Next.js 15 application for building interactive restaurant menus with a step-by-step wizard interface.

### Core Architecture

**State Management**: Uses React Context (`MenuBuilderProvider`) with useReducer for centralized state management of categories, products, and UI state. Auto-saves to localStorage on changes.

**Data Models**:
- `Category`: Menu sections with name, description, and order
- `Product`: Menu items with category association, pricing, descriptions, images, and modifiers
- `Modifier`: Product customization options (single/multiple choice) with pricing

**Step-Based UI**: Three-step wizard flow:
1. **Product Step** (`product-step.tsx`) - Category and product management
2. **Preview Step** (`preview-step.tsx`) - Menu preview and arrangement
3. **Export Step** (`export-step.tsx`) - JSON export functionality

### Key Components

**Context Provider** (`menu-builder-context.tsx`):
- Central state management with reducer pattern
- Local storage persistence
- JSON import/export functionality
- Toast notifications for user feedback

**UI Framework**: 
- Uses shadcn/ui components with Radix UI primitives
- Tailwind CSS for styling with custom CSS variables
- Responsive design with mobile-first approach

**Fonts**: Montserrat (headings) and Open Sans (body text) configured in layout.tsx

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main menu builder page
│   └── agregar-producto/  # Add product page
├── components/
│   ├── menu-builder/      # Core feature components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── theme-provider.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utilities (cn function for className merging)
└── styles/               # Global CSS
```

### Development Notes

**Language**: Application is primarily in Spanish (UI text, metadata)

**Build Configuration**: 
- ESLint and TypeScript errors ignored during builds
- Unoptimized images enabled
- Target ES6 with strict TypeScript

**Dependencies**: 
- React 19 with Next.js 15
- React Hook Form with Zod validation
- Extensive Radix UI component library
- Date handling with date-fns
- Charts with Recharts

**Context Usage**: Always use `useMenuBuilder()` hook to access menu state and actions within components that need menu data.