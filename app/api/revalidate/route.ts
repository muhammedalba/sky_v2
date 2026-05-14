import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PRODUCTION-GRADE REVALIDATION CONFIGURATION
 * 
 * SECURITY NOTE:
 * We use an Authorization Bearer token instead of query parameters.
 * Query parameters are often logged by reverse proxies (Nginx, Cloudflare),
 * load balancers, and monitoring tools, which could leak the secret.
 * Headers are generally treated as sensitive and are less likely to be logged.
 */
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

/**
 * TAG WHITELIST
 * 
 * Prevents accidental or malicious invalidation of the entire site cache.
 * Only tags defined here can be cleared via this endpoint.
 */
const ALLOWED_TAGS = new Set([
  'settings',
  'public-settings',
  'products',
  'categories',
  'homepage',
  'brands',
  'carousel',
]);

/**
 * STRUCTURED LOGGER
 */
const logger = {
  info: (message: string, context?: any) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    }));
  },
  error: (message: string, context?: any) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    }));
  },
};

/**
 * ON-DEMAND REVALIDATION ENDPOINT (POST ONLY)
 * 
 * This endpoint allows secure, targeted cache clearing from authorized 
 * infrastructure (e.g., the NestJS backend dashboard).
 */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // 1. AUTHORIZATION CHECK (Bearer Token)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ') || authHeader.split(' ')[1] !== REVALIDATE_SECRET) {
      logger.error('Unauthorized revalidation attempt blocked', { requestId, clientIp });
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing Bearer REVALIDATE SECRET' },
        { status: 401 }
      );
    }

    // 2. DATA EXTRACTION
    const { searchParams } = new URL(request.url);
    const tagInput = searchParams.get('tag');
    console.log("tagInput", tagInput)
    if (!tagInput) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing "tag" parameter' },
        { status: 400 }
      );
    }

    // Support multiple tags separated by comma
    const tagsToProcess = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    console.log("tagsToProcess", tagsToProcess)
    // 3. WHITELIST VALIDATION
    const invalidTags = tagsToProcess.filter(tag => !ALLOWED_TAGS.has(tag));
    if (invalidTags.length > 0) {
      logger.error('Forbidden tags detected', { requestId, invalidTags, clientIp });
      return NextResponse.json(
        { error: 'Forbidden', message: `Tags not allowed: ${invalidTags.join(', ')}` },
        { status: 403 }
      );
    }

    // 4. EXECUTION (Atomic Revalidation)
    // Next.js 16 requires a profile ('max' for stale-while-revalidate)
    tagsToProcess.forEach(tag => {
      revalidateTag(tag, 'max');
    });

    logger.info('Cache revalidation successful', {
      requestId,
      tags: tagsToProcess,
      clientIp
    });

    return NextResponse.json({
      revalidated: true,
      tags: tagsToProcess,
      now: Date.now(),
      requestId
    }, { status: 200 });

  } catch (err: any) {
    // 5. SECURE ERROR HANDLING
    // We log the internal error for maintainers but return a generic response to the client.
    logger.error('Internal Revalidation Error', {
      requestId,
      error: err.message,
      stack: err.stack
    });

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to process revalidation' },
      { status: 500 }
    );
  }
}
