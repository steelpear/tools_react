import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/','/ats','/idfinder','/operators','/users']
}

export default function middleware(req){
  const cookie = req.cookies.get('_jkNhfyGtr5-kJh5y7Ujhs')
  const url = req.url

  if (!cookie) {return NextResponse.redirect(new URL('/auth', req.url))}
  if (cookie && url.includes('/auth')) {return NextResponse.redirect(new URL('/', req.url))}
}
