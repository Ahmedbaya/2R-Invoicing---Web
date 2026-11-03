import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE = 'session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set and at least 32 characters long')
  return s
}
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('hex')

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export function passwordOk(input: string): boolean {
  const expected = process.env.APP_PASSWORD
  if (!expected) throw new Error('APP_PASSWORD is not set')
  return safeEqual(sign('pw:' + input), sign('pw:' + expected)) // hashes, so the length does not leak
}

export async function startSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE
  const jar = await cookies()
  jar.set(COOKIE, `${exp}.${sign(String(exp))}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function endSession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies()
  const v = jar.get(COOKIE)?.value
  if (!v) return false
  const [exp, sig] = v.split('.')
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false
  return Number(exp) > Date.now() / 1000
}

/** Called by every data function, so no page or download works without a login. */
export async function requireAuth() {
  if (!(await isAuthed())) redirect('/login')
}