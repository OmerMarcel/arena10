// ============================================================
// ARENA 10 Backend — Logger centralisé
// ============================================================

import { config } from '../config'

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'cache'

const COLORS = {
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[90m',  // grey
  cache: '\x1b[32m',  // green
  reset: '\x1b[0m',
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  const color = COLORS[level]
  const prefix = `${color}[${timestamp()}] [${level.toUpperCase().padEnd(5)}]${COLORS.reset}`
  
  if (meta !== undefined) {
    console.log(`${prefix} ${message}`, meta)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

export const logger = {
  info:  (msg: string, meta?: unknown) => log('info', msg, meta),
  warn:  (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => {
    if (config.nodeEnv === 'development') log('debug', msg, meta)
  },
  cache: (msg: string, meta?: unknown) => log('cache', msg, meta),
}

