import {createServerClient} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({request});
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
          response = NextResponse.next({request});
          cookiesToSet.forEach(({name, value, options}) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        }
      }
    }
  );

  const {data} = await supabase.auth.getClaims();
  const pathname = request.nextUrl.pathname;
  const isPublic = pathname === '/' || pathname.startsWith('/api/health') || /^\/(es|en|fr|pt|ar)\/login/.test(pathname);

  if (!data?.claims && !isPublic) {
    const locale = pathname.split('/')[1];
    const safeLocale = ['es','en','fr','pt','ar'].includes(locale) ? locale : 'es';
    const url = request.nextUrl.clone();
    url.pathname = `/${safeLocale}/login`;
    return NextResponse.redirect(url);
  }

  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
