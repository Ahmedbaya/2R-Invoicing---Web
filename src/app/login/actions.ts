'use server'

import { redirect } from 'next/navigation'
import { endSession, passwordOk, startSession } from '@/lib/auth'

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  await new Promise((r) => setTimeout(r, 600)) // slows down password guessing
  if (!passwordOk(password)) redirect('/login?error=1')
  await startSession()
  redirect('/dashboard')
}

export async function logout() {
  await endSession()
  redirect('/login')
}