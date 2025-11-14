/**
 * Dynamic Prisma client helper for multi-schema PostgreSQL setup
 * Provides cached PrismaClient instances per schema to avoid creating clients per request
 */

// Import Node.js types
/// <reference types="node" />

// Import separate Prisma clients for public and store schemas
import { PrismaClient as PublicPrismaClient } from '../../../prisma/generated/public';
import { PrismaClient as StorePrismaClient } from '../../../prisma/generated/store';

export { PublicPrismaClient, StorePrismaClient };

// Separate caches for different client types
const publicPrismaClients = new Map<string, PublicPrismaClient>();
const storePrismaClients = new Map<string, StorePrismaClient>();

/**
 * Get PrismaClient instance for a specific PostgreSQL schema
 * Creates new instance if not cached, otherwise returns cached instance
 * 
 * @param schema - PostgreSQL schema name (e.g., 'store_abc123')
 * @returns PrismaClient configured for the specified schema
 * @throws Error if DATABASE_URL_BASE environment variable is missing
 */
export function getPrismaForSchema(schema: string): StorePrismaClient {
  // Check if client already exists for this schema
  if (storePrismaClients.has(schema)) {
    return storePrismaClients.get(schema)!;
  }

  // Get base database URL without schema parameter
  const databaseUrlBase = process.env.DATABASE_URL_BASE;
  if (!databaseUrlBase) {
    throw new Error('DATABASE_URL_BASE environment variable is required');
  }

  // Construct schema-specific connection URL
  const schemaUrl = `${databaseUrlBase}?schema=${schema}`;

  // Create new PrismaClient with schema-specific datasource
  const prisma = new StorePrismaClient({
    datasources: {
      db: {
        url: schemaUrl
      }
    }
  });

  // Cache the client for reuse
  storePrismaClients.set(schema, prisma);

  return prisma;
}

/**
 * Get PrismaClient instance for the public schema (user/store management)
 * Uses DATABASE_URL_PUBLIC environment variable
 * 
 * @returns PrismaClient configured for the public schema
 * @throws Error if DATABASE_URL_PUBLIC environment variable is missing
 */
export function getPrismaPublic(): PublicPrismaClient {
  const cacheKey = 'public';
  
  // Check if public client already exists
  if (publicPrismaClients.has(cacheKey)) {
    return publicPrismaClients.get(cacheKey)!;
  }

  // Get public database URL
  const databaseUrlPublic = process.env.DATABASE_URL_PUBLIC;
  if (!databaseUrlPublic) {
    throw new Error('DATABASE_URL_PUBLIC environment variable is required');
  }

  // Create new PrismaClient for public schema
  const prisma = new PublicPrismaClient({
    datasources: {
      db: {
        url: databaseUrlPublic
      }
    }
  });

  // Cache the client for reuse
  publicPrismaClients.set(cacheKey, prisma);

  return prisma;
}

/**
 * Clear all cached PrismaClient instances
 * Useful for testing or when you need to reset connections
 */
export function clearPrismaCache(): void {
  // Disconnect all public clients before clearing cache
  for (const [, client] of publicPrismaClients.entries()) {
    client.$disconnect().catch(console.error);
  }
  
  // Disconnect all store clients before clearing cache
  for (const [, client] of storePrismaClients.entries()) {
    client.$disconnect().catch(console.error);
  }
  
  publicPrismaClients.clear();
  storePrismaClients.clear();
}

/**
 * Disconnect a specific schema's PrismaClient
 * @param schema - Schema name to disconnect
 */
export async function disconnectPrismaSchema(schema: string): Promise<void> {
  // Check store clients first
  const storeClient = storePrismaClients.get(schema);
  if (storeClient) {
    await storeClient.$disconnect();
    storePrismaClients.delete(schema);
    return;
  }
  
  // Check public clients (for 'public' schema)
  const publicClient = publicPrismaClients.get(schema);
  if (publicClient) {
    await publicClient.$disconnect();
    publicPrismaClients.delete(schema);
  }
}

/**
 * Get all cached schema names (for debugging/monitoring)
 * @returns Array of cached schema names
 */
export function getCachedSchemas(): string[] {
  const storeSchemas = Array.from(storePrismaClients.keys());
  const publicSchemas = Array.from(publicPrismaClients.keys());
  return [...storeSchemas, ...publicSchemas];
}