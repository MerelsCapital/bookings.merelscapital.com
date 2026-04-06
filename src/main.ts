import './style.css'
import type { Result } from './Result.js';

const app = document.getElementById('app') as HTMLDivElement

async function fetchAvailableSlots(selectedDate: string): Promise<Result<string[], Error>> {
    try{
        const res = await fetch(`http://api.merelscapital.com:3000/slots?date=${selectedDate}`);
        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        return { ok: true, value: data.slots };
    }
    catch(error){
        console.error("Error fetching slots:", error);
        let result: Result<string[], Error> = { ok: false, error: new Error('Failed to fetch available slots') };
        return result;
    }
}

async function bookMeeting(values: string[]): Promise<Result<boolean, Error>> {
    try{
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
    catch(error){
        let result: Result<string[], Error> = { ok: false, error: new Error('Failed to fetch available slots') };
        return result;
    }
}

function renderTimeSlots(slots: Result<string[], Error>, selectedDate: string) {
    if (slots.ok) {
        const slotHTML = slots.value.map(slot => `
            <button class="slot-btn" data-time="${slot}" style="display: flex; align-items: center; gap: 0.75rem; background: white; color: #1a1a1a; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); font-size: 1rem; font-weight: 600; cursor: pointer; text-align: left;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${formatSlotTime(slot)}
            </button>`).join('')

        return `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui; background: #f5f5f5;">
            <div style="background: white; border-radius: 24px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
                <div style="background: #f0f0f0; border-radius: 16px; padding: 1.25rem 1.5rem; text-align: center; margin-bottom: 1.5rem;">
                    <h1 style="font-size: 1.4rem; font-weight: 700; margin: 0 0 0.25rem;">Book a meeting</h1>
                    <p style="color: #888; margin: 0; font-size: 0.95rem;">Select an available time slot.</p>
                </div>

                <p style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #444; margin: 0 0 0.75rem;">PICK A DATE</p>

                <div style="display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 1.25rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input type="date" id="date-picker" value="${selectedDate}" style="border: none; outline: none; font-size: 1rem; font-weight: 600; font-color:width: 100%; background: transparent; cursor: pointer;" />
                </div>

                <p style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #444; margin: 0 0 0.75rem;">AVAILABLE TIMES</p>

                <div id="slots-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${slotHTML || '<p style="text-align: center; color: #999;">No slots available on this date.</p>'}
                </div>
            </div>
        </div>`
    }
    else {
        return `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui; background: #f5f5f5;">
            <div style="background: white; border-radius: 24px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); text-align: center;">
                <h1 style="font-size: 1.4rem; font-weight: 700; color: #1B2774;">Error Loading Slots</h1>
                <p style="color: #999;">${slots.error.message}</p>
            </div>
        </div>`
    }
}

function renderMeetingQuestions(selectedSlot: string) {
    return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui; background: #f5f5f5;">
        <div style="background: white; border-radius: 24px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
            <div style="background: #f0f0f0; border-radius: 16px; padding: 1.25rem 1.5rem; text-align: center; margin-bottom: 1.5rem;">
                <h1 style="font-size: 1.4rem; font-weight: 700; margin: 0 0 0.25rem;">Book a meeting</h1>
                <p style="color: #888; margin: 0; font-size: 0.95rem;">Fill in your details to confirm your booking.</p>
            </div>

            <p style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #444; margin: 0 0 0.75rem;">YOUR DETAILS</p>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    <input id="name" type="text" placeholder="Full name" style="border: none; outline: none; font-size: 1rem; font-weight: 600; width: 100%; background: transparent;" />
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                    <input id="email" type="email" placeholder="Email address" style="border: none; outline: none; font-size: 1rem; font-weight: 600; width: 100%; background: transparent;" />
                </div>
                <p id="email-error" style="display: none; color: #cc0000; font-size: 0.85rem; margin: -0.25rem 0 0 1.25rem;">Please enter a valid email address.</p>

                <div style="display: flex; align-items: flex-start; gap: 0.75rem; background: white; border: 1px solid #eee; border-radius: 20px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
                    <svg style="margin-top: 2px; flex-shrink: 0;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <textarea id="details" placeholder="What's on your mind?" rows="3" style="border: none; outline: none; font-size: 1rem; font-weight: 600; width: 100%; background: transparent; resize: none;"></textarea>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
                <button id="back-btn" data-slot="${selectedSlot}" style="background: white; color: #444; border: 1px solid #eee; border-radius: 999px; padding: 0.75rem 2rem; font-size: 1rem; font-weight: 700; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
                    Back
                </button>
                <button id="submit-btn" style="background: #1B2774; color: white; border: none; border-radius: 999px; padding: 0.75rem 2rem; font-size: 1rem; font-weight: 700; cursor: pointer;">
                    Submit
                </button>
            </div>
        </div>
    </div>`
}

async function loadAndRender(date: string) {
    const slots = await fetchAvailableSlots(date)
    app.innerHTML = renderTimeSlots(slots, date)

    // Re-attach event listeners after render
    const datePicker = document.getElementById('date-picker') as HTMLInputElement
    const slotsContainer = document.getElementById('slots-container') as HTMLDivElement
    //const selectedDisplay = document.getElementById('selected-slot') as HTMLParagraphElement

    datePicker.addEventListener('change', async (e) => {
        const newDate = (e.target as HTMLInputElement).value
        await loadAndRender(newDate)
    })

    slotsContainer.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.slot-btn')
        if (btn) {
            const time = btn.getAttribute('data-time')
            app.innerHTML = renderMeetingQuestions(time ?? '');
            document.getElementById('back-btn')!.addEventListener('click', () => {
                loadAndRender(date)
            })

            document.getElementById('submit-btn')!.addEventListener('click', () => {
                const name = (document.getElementById('name') as HTMLInputElement).value
                const emailInput = document.getElementById('email') as HTMLInputElement
                const emailError = document.getElementById('email-error') as HTMLParagraphElement
                const email = emailInput.value
                const details = (document.getElementById('details') as HTMLTextAreaElement).value
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                if (!emailValid) {
                    emailError.style.display = 'block'
                    emailInput.style.color = '#cc0000'
                    return
                }
                emailError.style.display = 'none'
                emailInput.style.color = ''
                if(time !== null && name !== null && email !== null && details !== null){
                    const values: string[] = [name, email, time, details];
                    bookMeeting(values);
                }
            })
        }
    })
}

function formatSlotTime(slotStr: string): string {
    const isoStr = slotStr.replace(/\[.*\]$/, '') // strip [America/Denver]
    const date = new Date(isoStr)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}


// Initial load (next business day’s date)
const tomorrow = new Date("2026-05-29");
loadAndRender(tomorrow.toISOString().split('T')[0])