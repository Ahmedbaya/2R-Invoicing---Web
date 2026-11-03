import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'exceljs', '@react-pdf/renderer'],
}

export default nextConfig