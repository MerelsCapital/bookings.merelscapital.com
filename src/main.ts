import './style.css'
import type { Result } from './Result.js';
import { fetchAvailableSlots, bookMeeting, formatTime, formatDateTime, validateEmail, validatePhone } from './utils.js';

declare global {
    interface Window {
        uetq: unknown[];
    }
}

const app = document.getElementById('app') as HTMLDivElement


function renderTimeSlots(slots: Result<string[], Error>, selectedDate: string) {
    if (slots.ok) {
        const slotHTML = slots.value.map(slot => `
            <button class="slot-btn" data-time="${slot}" style="display: flex; align-items: center; gap: 0.75rem; background: white; color: #1a1a1a; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); font-size: 1rem; font-weight: 600; cursor: pointer; text-align: left;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${formatTime(slot)}
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <select id="meeting-type" style="border: none; outline: none; font-size: 1rem; font-weight: 600; width: 100%; background: transparent; cursor: pointer;">
                        <option value="Zoom">Zoom</option>    
                        <option value="Jitsi">Jitsi</option>
                        <option value="Phone">Phone</option>
                    </select>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
                    <svg id="contact-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                    <input id="contact" type="email" placeholder="Email address" style="border: none; outline: none; font-size: 1rem; font-weight: 600; width: 100%; background: transparent;" />
                </div>
                <p id="contact-error" style="display: none; color: #cc0000; font-size: 0.85rem; margin: -0.25rem 0 0 1.25rem;">Please enter a valid email address.</p>

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

function renderThankYou(name: string, time: string) {
    return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui; background: #f5f5f5;">
        <div style="background: white; border-radius: 24px; padding: 2rem; width: 100%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); text-align: center;">
            <div style="background: #f0f0f0; border-radius: 16px; padding: 1.25rem 1.5rem; text-align: center; margin-bottom: 1.5rem;">
                <h1 style="font-size: 1.4rem; font-weight: 700; margin: 0 0 0.25rem;">Booking Confirmed</h1>
                <p style="color: #888; margin: 0; font-size: 0.95rem;">We look forward to speaking with you.</p>
            </div>

            <div style="background: #f0f0f0; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.75rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p style="font-size: 1.1rem; font-weight: 700; margin: 0 0 0.25rem; color: #1a1a1a;">Thank you, ${name}!</p>
                <p style="color: #888; margin: 0; font-size: 0.95rem;">Your meeting is booked for</p>
                <p style="font-size: 1rem; font-weight: 700; color: #1B2774; margin: 0.5rem 0 0;">${formatDateTime(time)}</p>
            </div>

            <p style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #444; margin: 0 0 0.75rem;">WHAT HAPPENS NEXT</p>

            <div style="display: flex; flex-direction: column; gap: 0.75rem; text-align: left;">
                <div style="display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                    <span style="font-size: 0.95rem; font-weight: 600; color: #444;">A confirmation email is on its way</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #eee; border-radius: 999px; padding: 0.85rem 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B2774" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style="font-size: 0.95rem; font-weight: 600; color: #444;">Add the calendar invite from the email</span>
                </div>
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

            const meetingTypeSelect = document.getElementById('meeting-type') as HTMLSelectElement
            const contactInput = document.getElementById('contact') as HTMLInputElement
            const contactIcon = document.getElementById('contact-icon') as unknown as SVGElement
            const contactError = document.getElementById('contact-error') as HTMLParagraphElement

            const phoneIcon = `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16z"/>`
            const emailIcon = `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>`

            meetingTypeSelect.addEventListener('change', () => {
                if (meetingTypeSelect.value === 'Phone') {
                    contactInput.type = 'phone'
                    contactInput.placeholder = 'Phone number'
                    contactError.textContent = 'Please enter a valid phone number.'
                    contactIcon.innerHTML = phoneIcon
                } else {
                    contactInput.type = 'email'
                    contactInput.placeholder = 'Email address'
                    contactError.textContent = 'Please enter a valid email address.'
                    contactIcon.innerHTML = emailIcon
                }
                contactError.style.display = 'none'
                contactInput.style.color = ''
            })

            document.getElementById('submit-btn')!.addEventListener('click', async () => {
                const name = (document.getElementById('name') as HTMLInputElement).value
                const meetingType = meetingTypeSelect.value
                const contact = contactInput.value
                const details = (document.getElementById('details') as HTMLTextAreaElement).value

                const contactValid = meetingType === 'Phone' ? validatePhone(contact) : validateEmail(contact)

                if (!contactValid) {
                    contactError.style.display = 'block'
                    contactInput.style.color = '#cc0000'
                    return
                }
                contactError.style.display = 'none'
                contactInput.style.color = ''

                if (time !== null && name !== null && contact !== null && details !== null) {
                    const values: string[] = [name, contact, time, details, meetingType];
                    window.uetq = window.uetq || [];
                    window.uetq.push('set', { pid: {
                        email: meetingType !== 'Phone' ? contact : '',
                        phone: meetingType === 'Phone' ? contact : '',
                    }});
                    const booked = await bookMeeting(values);
                    if (booked.ok) {
                        window.uetq.push('event', 'booking_complete', {
                            event_category: 'booking',
                            event_label: meetingType,
                        })
                        app.innerHTML = renderThankYou(name, time ?? '')
                    }
                }
            })
        }
    })
}



// Initial load (next business day’s date)
const tomorrow = new Date("2026-05-29");
loadAndRender(tomorrow.toISOString().split('T')[0])