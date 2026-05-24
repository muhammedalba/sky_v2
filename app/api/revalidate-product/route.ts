import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body?.slug;
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    // Revalidate both the specific product page and the products list
    await revalidateTag(`product-${slug}`, {});
    await revalidateTag('products', {});

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[revalidate-product] error', err);
    return NextResponse.json({ error: 'failed to revalidate' }, { status: 500 });
  }
}
