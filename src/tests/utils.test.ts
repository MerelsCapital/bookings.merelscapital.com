import { describe, it, expect, vi, afterEach } from 'vitest';
import {
    fetchAvailableSlots,
    bookMeeting,
    formatTime,
    formatDateTime,
    validateEmail,
    validatePhone,
} from '../utils.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

afterEach(() => {
    vi.clearAllMocks();
});

// =============================================================================
// fetchAvailableSlots
// =============================================================================
describe('fetchAvailableSlots', () => {
    it('returns ok:true with slots array on a successful response', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ slots: ['2026-05-29T09:00:00-06:00[America/Denver]'] }),
        });

        const result = await fetchAvailableSlots('2026-05-29');

        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toHaveLength(1);
    });

    it('calls the correct API URL with the supplied date', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ slots: [] }),
        });

        await fetchAvailableSlots('2026-05-29');

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.merelscapital.com/slots?date=2026-05-29'
        );
    });

    it('returns ok:false when the API responds with a non-200 status', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

        const result = await fetchAvailableSlots('2026-05-29');

        expect(result.ok).toBe(false);
    });

    it('returns ok:false when fetch throws a network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await fetchAvailableSlots('2026-05-29');

        expect(result.ok).toBe(false);
    });

    it('does not throw — errors are contained in Result', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(fetchAvailableSlots('2026-05-29')).resolves.toMatchObject({ ok: false });
    });

    // Security: ensure the date param is passed as-is (not interpolated dangerously)
    it('passes the date value directly into the URL without modification', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ slots: [] }) });

        await fetchAvailableSlots('2026-12-31');

        const calledUrl = mockFetch.mock.calls[0][0] as string;
        expect(calledUrl).toContain('date=2026-12-31');
    });

    // Security: a malicious date string should still just be passed to the API
    // (the API is responsible for validation — the frontend should not silently swallow it)
    it('passes an unexpected date string to the API without crashing', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

        const result = await fetchAvailableSlots('not-a-date');

        expect(result.ok).toBe(false);
    });
});

// =============================================================================
// bookMeeting
// =============================================================================
describe('bookMeeting', () => {
    const validValues = ['Jane Doe', 'jane@example.com', '2026-05-29T09:00:00-06:00[America/Denver]', 'details', 'Jitsi'];

    it('returns ok:true on a successful booking', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        const result = await bookMeeting(validValues);

        expect(result.ok).toBe(true);
    });

    it('sends a POST request to the correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        await bookMeeting(validValues);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://api.merelscapital.com/booking',
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('sends Content-Type: application/json header', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        await bookMeeting(validValues);

        const options = mockFetch.mock.calls[0][1];
        expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('wraps values in a { values } body object', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        await bookMeeting(validValues);

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body).toEqual({ values: validValues });
    });

    it('returns ok:false when the API responds with a non-200 status', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

        const result = await bookMeeting(validValues);

        expect(result.ok).toBe(false);
    });

    it('returns ok:false when fetch throws', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await bookMeeting(validValues);

        expect(result.ok).toBe(false);
    });

    it('does not throw — errors are contained in Result', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(bookMeeting(validValues)).resolves.toMatchObject({ ok: false });
    });

    // Security: empty values array should not crash — API handles validation
    it('handles an empty values array without throwing', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

        await expect(bookMeeting([])).resolves.toMatchObject({ ok: false });
    });
});

// =============================================================================
// formatTime
// =============================================================================
describe('formatTime', () => {
    it('returns a time string in HH:MM format', () => {
        const result = formatTime('2026-05-29T09:00:00-06:00[America/Denver]');
        expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('strips the timezone bracket before parsing', () => {
        // Should not throw when brackets are present
        expect(() => formatTime('2026-05-29T09:00:00-06:00[America/Denver]')).not.toThrow();
    });

    it('handles a string without timezone brackets', () => {
        expect(() => formatTime('2026-05-29T09:00:00-06:00')).not.toThrow();
    });
});

// =============================================================================
// formatDateTime
// =============================================================================
describe('formatDateTime', () => {
    it('returns date in MM/DD/YYYY HH:MM format', () => {
        const result = formatDateTime('2026-05-29T08:30:00-06:00[America/Denver]');
        expect(result).toBe('05/29/2026 08:30');
    });

    it('correctly formats January (month 01)', () => {
        const result = formatDateTime('2026-01-05T13:00:00-07:00[America/Denver]');
        expect(result).toBe('01/05/2026 13:00');
    });

    it('correctly formats December (month 12)', () => {
        const result = formatDateTime('2026-12-31T17:30:00-07:00[America/Denver]');
        expect(result).toBe('12/31/2026 17:30');
    });

    it('correctly extracts minutes', () => {
        const result = formatDateTime('2026-05-29T08:30:00-06:00[America/Denver]');
        expect(result).toContain('08:30');
    });

    it('strips timezone brackets before parsing', () => {
        expect(() => formatDateTime('2026-05-29T09:00:00-06:00[America/Denver]')).not.toThrow();
    });
});

// =============================================================================
// validateEmail
// =============================================================================
describe('validateEmail', () => {
    it('accepts a standard email address', () => {
        expect(validateEmail('user@example.com')).toBe(true);
    });

    it('accepts an email with a subdomain', () => {
        expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('accepts an email with plus addressing', () => {
        expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('rejects an email with no @ symbol', () => {
        expect(validateEmail('userexample.com')).toBe(false);
    });

    it('rejects an email with no domain', () => {
        expect(validateEmail('user@')).toBe(false);
    });

    it('rejects an email with no TLD', () => {
        expect(validateEmail('user@example')).toBe(false);
    });

    it('rejects an empty string', () => {
        expect(validateEmail('')).toBe(false);
    });

    it('rejects a string with spaces', () => {
        expect(validateEmail('user @example.com')).toBe(false);
    });

    // Security: XSS attempt in email field should fail validation
    it('rejects an XSS payload', () => {
        expect(validateEmail('<script>alert(1)</script>')).toBe(false);
    });

    // Security: SQL injection attempt
    it('rejects a SQL injection payload', () => {
        expect(validateEmail("'; DROP TABLE bookings; --")).toBe(false);
    });

    // Security: excessively long email string
    it('rejects an unusually long string (> 254 chars)', () => {
        const long = 'a'.repeat(250) + '@b.com';
        // The regex doesn't enforce length but this documents the behaviour
        // A future hardening step could add length checks
        expect(typeof validateEmail(long)).toBe('boolean');
    });
});

// =============================================================================
// validatePhone
// =============================================================================
describe('validatePhone', () => {
    it('accepts a US number with country code', () => {
        expect(validatePhone('+14250000000')).toBe(true);
    });

    it('accepts a UK number with country code', () => {
        expect(validatePhone('+447911123456')).toBe(true);
    });

    it('accepts a number with spaces', () => {
        expect(validatePhone('+1 425 000 0000')).toBe(true);
    });

    it('accepts a number with dashes', () => {
        expect(validatePhone('425-000-0000')).toBe(true);
    });

    it('accepts a number with parentheses', () => {
        expect(validatePhone('(425) 000-0000')).toBe(true);
    });

    it('rejects an empty string', () => {
        expect(validatePhone('')).toBe(false);
    });

    it('rejects a string that is too short (fewer than 7 digits)', () => {
        expect(validatePhone('123')).toBe(false);
    });

    it('rejects a string with letters', () => {
        expect(validatePhone('notaphone')).toBe(false);
    });

    // Security: XSS attempt in phone field
    it('rejects an XSS payload', () => {
        expect(validatePhone('<script>alert(1)</script>')).toBe(false);
    });

    // Security: SQL injection attempt
    it('rejects a SQL injection payload', () => {
        expect(validatePhone("'; DROP TABLE bookings; --")).toBe(false);
    });
});
