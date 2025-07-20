# Frontend Setup: Next.js, TypeScript Monorepo with Turborepo

This guide outlines the steps to set up your frontend with a monorepo structure using Next.js, TypeScript, and Turborepo.

## 1. Initialize Turborepo

First, navigate into your `frontend` directory and initialize Turborepo.

```bash
cd frontend
npx create-turbo@latest
```
When prompted:
*   `Where would you like to create your turborepo?` -> `.` (current directory)
*   `Which package manager would you like to use?` -> `pnpm` (recommended for monorepos)
*   `Would you like to use TypeScript?` -> `Yes`
*   `Would you like to use ESLint?` -> `Yes`

This will set up the basic monorepo structure with `apps` and `packages` directories, `package.json`, `turbo.json`, and `pnpm-workspace.yaml`.

## 2. Create the Next.js Application (`apps/web`)

Navigate into the `apps` directory and create your Next.js application.

```bash
cd apps
npx create-next-app@latest web --typescript --eslint --tailwind --app --src-dir --use-pnpm
```
This command creates a Next.js 14+ application with TypeScript, ESLint, Tailwind CSS, the App Router, and a `src` directory, using pnpm.

## 3. Create the UI Package (`packages/ui`)

Create a new directory for your shared UI components within `packages`. This will be a simple TypeScript package.

```bash
cd packages
mkdir ui
cd ui
pnpm init
```
Edit `packages/ui/package.json` to make it a private package and add a `main` and `types` entry:

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint ."
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "react": "^18.2.0",
    "typescript": "^5.3.3"
  }
}
```
Create `packages/ui/src/index.ts` (this will be where you export your components).

## 4. Configure `tailwind.config.ts`

You'll need a shared Tailwind configuration.

### 4.1. Create `packages/tailwind-config` (Optional but Recommended)

For a cleaner setup, create a shared `tailwind-config` package.

```bash
cd ../../packages
mkdir tailwind-config
cd tailwind-config
pnpm init
```
Edit `packages/tailwind-config/package.json`:

```json
{
  "name": "@repo/tailwind-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.ts",
  "types": "index.ts",
  "exports": {
    ".": "./index.ts"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```
Create `packages/tailwind-config/index.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 4.2. Update `apps/web/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}", // Include ui package
  ],
  presets: [sharedConfig],
};

export default config;
```

### 4.3. Update `packages/ui/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;
```

## 5. Configure `tsconfig.json`

You'll need a shared `tsconfig` for the monorepo. Turborepo usually sets up `@repo/typescript-config`.

### 5.1. Update `apps/web/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/next.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@repo/ui/*": ["../../packages/ui/src/*"] // Add alias for ui package
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5.2. Update `packages/ui/tsconfig.json`

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@repo/ui/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

## 6. Update Root `package.json`

Ensure your root `package.json` (in `frontend/`) has the `workspaces` configured.

```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write "**/*.{ts,tsx,md}""
  },
  "devDependencies": {
    "prettier": "^3.1.0",
    "turbo": "latest"
  },
  "packageManager": "pnpm@8.9.0",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

## 7. Update `turbo.json`

Configure Turborepo tasks in `frontend/turbo.json`.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

## 8. Final Steps

1.  **Install Dependencies**: Run `pnpm install` from the `frontend/` root directory.
2.  **Use Components**: Import components from `@repo/ui/components` in your `apps/web` application.

## 9. Known Issues

- Be mindful of JSX syntax, especially when rendering components dynamically. Incorrectly referencing a component, for example `category.items[0].icon` instead of assigning it to a capitalized variable first, will cause a parsing error.

This setup provides a robust monorepo for your Next.js application and shared UI components.