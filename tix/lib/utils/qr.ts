import { customAlphabet } from "nanoid"

// Generate a unique ticket number
const generateTicketNumber = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 12)

// Generate a unique QR code string
const generateQRCode = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 32)

export function createTicketNumber(): string {
  const prefix = "TKT"
  const number = generateTicketNumber()
  return `${prefix}-${number.slice(0, 4)}-${number.slice(4, 8)}-${number.slice(8)}`
}

export function createQRCode(ticketId: string): string {
  const uniquePart = generateQRCode()
  return `${ticketId}:${uniquePart}`
}

export function parseQRCode(qrCode: string): { ticketId: string; uniquePart: string } | null {
  const parts = qrCode.split(":")
  if (parts.length !== 2) return null
  return {
    ticketId: parts[0],
    uniquePart: parts[1],
  }
}
