"use client"

import { QueryClient } from "@tanstack/react-query"

/**
 * TanStack Query Client Configuration
 *
 * Default settings optimized for ERP data patterns:
 * - staleTime: 5 minutes - master data doesn't change frequently
 * - gcTime: 10 minutes - keep unused data in cache
 * - retry: 2 times with exponential backoff
 * - refetchOnWindowFocus: false - prevent unnecessary refetches
 */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Garbage collection after 10 minutes of being unused
        gcTime: 10 * 60 * 1000,
        // Retry failed queries 2 times
        retry: 2,
        // Don't refetch on window focus (prevents unnecessary requests)
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect automatically
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

/**
 * Query Key Factory
 *
 * Organized keys for cache management and invalidation.
 * Pattern: [module, entity, ...params]
 */
export const queryKeys = {
  // Master Data
  masterData: {
    all: ["masterData"] as const,

    // Colors
    colors: {
      all: ["masterData", "colors"] as const,
      list: (filters?: { page?: number; limit?: number; search?: string }) =>
        ["masterData", "colors", "list", filters] as const,
      detail: (id: string) => ["masterData", "colors", "detail", id] as const,
    },

    // Articles
    articles: {
      all: ["masterData", "articles"] as const,
      list: (filters?: { page?: number; limit?: number; search?: string; classification?: string }) =>
        ["masterData", "articles", "list", filters] as const,
      detail: (id: string) => ["masterData", "articles", "detail", id] as const,
    },

    // Models
    models: {
      all: ["masterData", "models"] as const,
      list: (filters?: { page?: number; limit?: number; search?: string }) =>
        ["masterData", "models", "list", filters] as const,
      detail: (id: string) => ["masterData", "models", "detail", id] as const,
    },

    // Sizes
    sizes: {
      all: ["masterData", "sizes"] as const,
      list: (filters?: { page?: number; limit?: number; search?: string }) =>
        ["masterData", "sizes", "list", filters] as const,
      detail: (id: string) => ["masterData", "sizes", "detail", id] as const,
    },

    // Classifications
    classifications: {
      all: ["masterData", "classifications"] as const,
      list: (filters?: { page?: number; limit?: number; search?: string }) =>
        ["masterData", "classifications", "list", filters] as const,
      detail: (id: string) => ["masterData", "classifications", "detail", id] as const,
    },

    // Suppliers
    suppliers: {
      all: ["masterData", "suppliers"] as const,
      list: (filters?: { page?: number; limit?: number; search?: string }) =>
        ["masterData", "suppliers", "list", filters] as const,
      detail: (id: string) => ["masterData", "suppliers", "detail", id] as const,
    },

    // Customers
    customers: {
      all: ["masterData", "customers"] as const,
      list: (filters?: { page?: number; limit?: number; search?: string }) =>
        ["masterData", "customers", "list", filters] as const,
      detail: (id: string) => ["masterData", "customers", "detail", id] as const,
    },
  },

  // Sales
  sales: {
    all: ["sales"] as const,

    orders: {
      all: ["sales", "orders"] as const,
      list: (filters?: { page?: number; limit?: number; status?: string }) =>
        ["sales", "orders", "list", filters] as const,
      detail: (id: string) => ["sales", "orders", "detail", id] as const,
    },

    pos: {
      all: ["sales", "pos"] as const,
      list: (filters?: { page?: number; limit?: number; date?: string }) =>
        ["sales", "pos", "list", filters] as const,
      detail: (id: string) => ["sales", "pos", "detail", id] as const,
    },
  },

  // Inventory
  inventory: {
    all: ["inventory"] as const,

    stock: {
      all: ["inventory", "stock"] as const,
      list: (filters?: { page?: number; limit?: number; warehouse?: string }) =>
        ["inventory", "stock", "list", filters] as const,
      detail: (id: string) => ["inventory", "stock", "detail", id] as const,
    },
  },

  // Messaging
  messaging: {
    all: ["messaging"] as const,

    conversations: {
      all: ["messaging", "conversations"] as const,
      list: (type?: string) => ["messaging", "conversations", "list", type] as const,
    },

    messages: {
      all: ["messaging", "messages"] as const,
      list: (conversationId: string) => ["messaging", "messages", "list", conversationId] as const,
    },

    unreadCount: ["messaging", "unreadCount"] as const,

    companyUsers: ["messaging", "companyUsers"] as const,

    groupMembers: (conversationId: string) =>
      ["messaging", "groupMembers", conversationId] as const,
  },
}
