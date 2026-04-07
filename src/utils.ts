import type { Result } from './Result.js';

export async function fetchAvailableSlots(selectedDate: string): Promise<Result<string[], Error>> {
    try {
        const res = await fetch(`http://api.merelscapital.com:3000/slots?date=${selectedDate}`);
        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        return { ok: true, value: data.slots };
    }
    catch (error) {
        return { ok: false, error: new Error('Failed to fetch available slots') };
    }
}

export async function bookMeeting(values: string[]): Promise<Result<boolean, Error>> {
    try {
        const res = await fetch(`http://api.merelscapital.com:3000/booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values }),
        });
        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        return { ok: true, value: data };
    }
    catch (error) {
        return { ok: false, error: new Error('Failed to create booking') };
    }
}

export function formatTime(time: string): string {
    const isoStr = time.replace(/\[.*\]$/, '')
    const date = new Date(isoStr)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(time: string): string {
    const isoStr = time.replace(/\[.*\]$/, '')
    const [datePart, timePart] = isoStr.split('T')
    const [year, month, day] = datePart.split('-')
    const hhmm = timePart.slice(0, 5)
    return `${month}/${day}/${year} ${hhmm}`
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhone(phone: string): boolean {
    return /^\+?[\d\s\-().]{7,15}$/.test(phone)
}
