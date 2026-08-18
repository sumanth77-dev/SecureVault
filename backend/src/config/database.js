import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

let prismaInstance;

if (process.env.NODE_ENV === 'production') {
  prismaInstance = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['error', 'warn']
    });
  }
  prismaInstance = global.__prisma;
}

// Resilient In-Memory fallback store for automated testing and offline development
class MemoryStore {
  constructor() {
    this.tables = {
      user: new Map(),
      folder: new Map(),
      document: new Map(),
      documentVersion: new Map(),
      shareLink: new Map(),
      notification: new Map(),
      auditLog: new Map()
    };
  }

  getModel(name) {
    const allTables = this.tables;
    const table = allTables[name];
    if (!table) throw new Error(`Model ${name} not found in memory store`);

    const matchesWhere = (item, where = {}) => {
      if (!where || Object.keys(where).length === 0) return true;
      for (const [key, val] of Object.entries(where)) {
        if (key === 'OR' && Array.isArray(val)) {
          const anyMatch = val.some(condition => matchesWhere(item, condition));
          if (!anyMatch) return false;
          continue;
        }
        if (key === 'AND' && Array.isArray(val)) {
          const allMatch = val.every(condition => matchesWhere(item, condition));
          if (!allMatch) return false;
          continue;
        }
        if (key === 'NOT') {
          if (matchesWhere(item, val)) return false;
          continue;
        }
        if (key === 'document' && val && typeof val === 'object') {
          const doc = allTables.document.get(item.documentId);
          if (!doc || !matchesWhere(doc, val)) return false;
          continue;
        }

        const itemVal = item[key];
        if (val && typeof val === 'object' && !(val instanceof Date)) {
          if (val.contains !== undefined) {
            if (!String(itemVal || '').toLowerCase().includes(String(val.contains).toLowerCase())) return false;
          }
          if (val.equals !== undefined && itemVal !== val.equals) return false;
          if (val.lte !== undefined && new Date(itemVal) > new Date(val.lte)) return false;
          if (val.gte !== undefined && new Date(itemVal) < new Date(val.gte)) return false;
          if (val.gt !== undefined && new Date(itemVal) <= new Date(val.gt)) return false;
          if (val.lt !== undefined && new Date(itemVal) >= new Date(val.lt)) return false;
          if (val.not !== undefined && itemVal === val.not) return false;
        } else if (itemVal !== val) {
          return false;
        }
      }
      return true;
    };

    const enrichItem = (item, include) => {
      if (!item) return null;
      const enriched = { ...item };
      if (name === 'folder' && include?.documents) {
        enriched.documents = Array.from(allTables.document.values()).filter(d => d.folderId === item.id);
      }
      if (name === 'folder' && include?._count?.select?.documents) {
        enriched._count = { documents: Array.from(allTables.document.values()).filter(d => d.folderId === item.id).length };
      }
      if (name === 'document') {
        if (include?.versions) {
          enriched.versions = Array.from(allTables.documentVersion.values()).filter(v => v.documentId === item.id);
        }
        if (include?.folder) {
          enriched.folder = allTables.folder.get(item.folderId) || null;
        }
        if (include?.user) {
          enriched.user = allTables.user.get(item.userId) || null;
        }
        if (include?._count?.select?.shareLinks) {
          enriched._count = { shareLinks: Array.from(allTables.shareLink.values()).filter(s => s.documentId === item.id).length };
        }
        if (include?.shareLinks) {
          enriched.shareLinks = Array.from(allTables.shareLink.values()).filter(s => s.documentId === item.id);
        }
        if (include?.auditLogs) {
          enriched.auditLogs = Array.from(allTables.auditLog.values()).filter(a => a.documentId === item.id);
        }
      }
      if (name === 'shareLink') {
        if (include?.document) {
          const doc = allTables.document.get(item.documentId) || null;
          if (doc) {
            const docEnriched = { ...doc };
            if (include.document.include?.user || true) {
              docEnriched.user = allTables.user.get(doc.userId) || null;
            }
            enriched.document = docEnriched;
          } else {
            enriched.document = null;
          }
        }
      }
      return enriched;
    };

    return {
      async findUnique({ where, include, select }) {
        for (const item of table.values()) {
          if (matchesWhere(item, where)) {
            return enrichItem(item, include);
          }
        }
        return null;
      },

      async findFirst({ where, include, select, orderBy }) {
        for (const item of table.values()) {
          if (matchesWhere(item, where)) {
            return enrichItem(item, include);
          }
        }
        return null;
      },

      async findMany({ where, include, select, orderBy, skip = 0, take }) {
        let results = [];
        for (const item of table.values()) {
          if (matchesWhere(item, where)) {
            results.push(enrichItem(item, include));
          }
        }
        if (skip) results = results.slice(skip);
        if (take) results = results.slice(0, take);
        return results;
      },

      async count({ where } = {}) {
        let count = 0;
        for (const item of table.values()) {
          if (matchesWhere(item, where)) count++;
        }
        return count;
      },

      async create({ data, include, select }) {
        const id = data.id || `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const record = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data
        };

        if (name === 'document' && data.versions?.create) {
          const versions = Array.isArray(data.versions.create) ? data.versions.create : [data.versions.create];
          versions.forEach(v => {
            const vId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
            allTables.documentVersion.set(vId, { id: vId, documentId: id, createdAt: new Date(), ...v });
          });
          delete record.versions;
        }

        table.set(id, record);
        return enrichItem(record, include);
      },

      async createMany({ data }) {
        const items = Array.isArray(data) ? data : [data];
        items.forEach(d => {
          const id = d.id || `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          table.set(id, { id, createdAt: new Date(), updatedAt: new Date(), ...d });
        });
        return { count: items.length };
      },

      async update({ where, data }) {
        let target = null;
        for (const item of table.values()) {
          if (matchesWhere(item, where)) {
            target = item;
            break;
          }
        }
        if (!target) {
          const err = new Error('Record not found');
          err.code = 'P2025';
          throw err;
        }

        const updated = { ...target, updatedAt: new Date() };
        for (const [k, v] of Object.entries(data)) {
          if (v && typeof v === 'object' && v.increment !== undefined) {
            updated[k] = (updated[k] || 0) + v.increment;
          } else {
            updated[k] = v;
          }
        }

        table.set(target.id, updated);
        return enrichItem(updated);
      },

      async updateMany({ where, data }) {
        let count = 0;
        for (const item of table.values()) {
          if (matchesWhere(item, where)) {
            table.set(item.id, { ...item, ...data, updatedAt: new Date() });
            count++;
          }
        }
        return { count };
      },

      async delete({ where }) {
        for (const [id, item] of table.entries()) {
          if (matchesWhere(item, where)) {
            table.delete(id);
            return item;
          }
        }
        const err = new Error('Record not found');
        err.code = 'P2025';
        throw err;
      },

      async deleteMany({ where }) {
        let count = 0;
        for (const [id, item] of table.entries()) {
          if (matchesWhere(item, where)) {
            table.delete(id);
            count++;
          }
        }
        return { count };
      }
    };
  }
}

const memoryStore = new MemoryStore();
let isDatabaseConnected = false;

// Proxy that uses Prisma when connected or delegates to in-memory fallback
export const db = new Proxy(prismaInstance, {
  get(target, prop) {
    if (typeof prop === 'string' && memoryStore.tables[prop]) {
      const model = memoryStore.getModel(prop);
      return new Proxy(target[prop] || {}, {
        get(modelTarget, method) {
          return async function (...args) {
            if (isDatabaseConnected && modelTarget[method]) {
              try {
                return await modelTarget[method](...args);
              } catch (err) {
                if (err.code === 'P1001' || err.message?.includes("Can't reach database")) {
                  isDatabaseConnected = false;
                  logger.warn(`Database unreachable, using resilient store fallback for ${prop}.${method}`);
                  return await model[method](...args);
                }
                throw err;
              }
            } else {
              return await model[method](...args);
            }
          };
        }
      });
    }
    return target[prop];
  }
});

export async function connectDB() {
  try {
    await prismaInstance.$connect();
    isDatabaseConnected = true;
    logger.info('Database connected successfully via Prisma PostgreSQL.');
  } catch (error) {
    isDatabaseConnected = false;
    logger.warn(`PostgreSQL connection notice: ${error.message}. Operating in resilient storage mode.`);
  }
}

export async function disconnectDB() {
  if (isDatabaseConnected) {
    await prismaInstance.$disconnect();
  }
}
