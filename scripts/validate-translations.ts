import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(__dirname, '..', 'messages');

// ANSI escape codes for coloring terminal output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function getKeys(obj: unknown, prefix = ''): string[] {
  let keys: string[] = [];
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return keys;
  }
  const record = obj as Record<string, unknown>;
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = record[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys = keys.concat(getKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

function getValueAtPath(obj: unknown, pathStr: string): unknown {
  const parts = pathStr.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function extractPlaceholders(text: string): string[] {
  if (typeof text !== 'string') return [];
  const regex = /\{([^}]+)\}/g;
  const placeholders: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    placeholders.push(match[1]);
  }
  return placeholders.sort();
}

function validateNamespace(ns: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const enPath = path.join(MESSAGES_DIR, ns, 'en.json');
  const arPath = path.join(MESSAGES_DIR, ns, 'ar.json');

  if (!fs.existsSync(enPath)) {
    errors.push(`Missing English translation file: ${enPath}`);
    return { errors, warnings };
  }
  if (!fs.existsSync(arPath)) {
    errors.push(`Missing Arabic translation file: ${arPath}`);
    return { errors, warnings };
  }

  let enJson: unknown;
  let arJson: unknown;

  try {
    enJson = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to parse English JSON for "${ns}": ${message}`);
    return { errors, warnings };
  }

  try {
    arJson = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Failed to parse Arabic JSON for "${ns}": ${message}`);
    return { errors, warnings };
  }

  const enKeys = getKeys(enJson);
  const arKeys = getKeys(arJson);

  const enSet = new Set(enKeys);
  const arSet = new Set(arKeys);

  // Check for missing keys in Arabic that exist in English
  for (const key of enKeys) {
    if (!arSet.has(key)) {
      errors.push(`Key "${key}" is defined in English but missing in Arabic.`);
    }
  }

  // Check for extra keys in Arabic that don't exist in English
  for (const key of arKeys) {
    if (!enSet.has(key)) {
      warnings.push(`Key "${key}" is defined in Arabic but missing in English (extra key).`);
    }
  }

  // Check variables alignment for matching keys
  const commonKeys = enKeys.filter(k => arSet.has(k));
  for (const key of commonKeys) {
    const enVal = getValueAtPath(enJson, key);
    const arVal = getValueAtPath(arJson, key);

    if (typeof enVal === 'string' && typeof arVal === 'string') {
      const enVars = extractPlaceholders(enVal);
      const arVars = extractPlaceholders(arVal);

      if (JSON.stringify(enVars) !== JSON.stringify(arVars)) {
        errors.push(
          `Variable mismatch for key "${key}":\n` +
          `  EN placeholders: [${enVars.join(', ')}] -> "${enVal}"\n` +
          `  AR placeholders: [${arVars.join(', ')}] -> "${arVal}"`
        );
      }
    }
  }

  return { errors, warnings };
}

function run() {
  console.log(`${BOLD}🌐 Starting Translation Validation Checks...${RESET}\n`);

  if (!fs.existsSync(MESSAGES_DIR)) {
    console.error(`${RED}Error: Messages directory not found at ${MESSAGES_DIR}${RESET}`);
    process.exit(1);
  }

  const namespaces = fs.readdirSync(MESSAGES_DIR).filter(file => {
    return fs.statSync(path.join(MESSAGES_DIR, file)).isDirectory();
  });

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const ns of namespaces) {
    console.log(`Checking namespace: ${BOLD}${ns}${RESET}`);
    const { errors, warnings } = validateNamespace(ns);

    if (errors.length > 0) {
      errors.forEach(err => console.log(`  ${RED}❌ Error:${RESET} ${err}`));
      totalErrors += errors.length;
    }
    if (warnings.length > 0) {
      warnings.forEach(warn => console.log(`  ${YELLOW}⚠️ Warning:${RESET} ${warn}`));
      totalWarnings += warnings.length;
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`  ${GREEN}✓ Validated successfully.${RESET}`);
    }
    console.log('');
  }

  console.log('--------------------------------------------------');
  console.log(`${BOLD}Validation Summary:${RESET}`);
  console.log(`  Errors:   ${totalErrors > 0 ? RED : GREEN}${totalErrors}${RESET}`);
  console.log(`  Warnings: ${totalWarnings > 0 ? YELLOW : GREEN}${totalWarnings}${RESET}`);

  if (totalErrors > 0) {
    console.log(`\n${RED}${BOLD}❌ Validation failed. Please fix the translation errors listed above.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`\n${GREEN}${BOLD}✓ All translations are validated and type-safe!${RESET}\n`);
    process.exit(0);
  }
}

run();
