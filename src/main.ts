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

function renderTimeSlots(slots: Result<string[], Error>, selectedDate: string) {
    if(slots.ok) {
        const slotHTML = slots.value.map(slot => `
            <button class="slot-btn" data-time="${slot}">
                ${formatSlotTime(slot)}
            </button>`).join('')
  
    return `
      <div style="max-width: 800px; margin: 2rem auto; padding: 2rem; font-family: system-ui;">
        <h1 style="font-size: 2.5rem; color: #0066cc; text-align: center;">Available Slots • ${selectedDate}</h1>
        
        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap;">
          <label style="font-size: 1.1rem;">
            Pick a date:
            <input 
              type="date" 
              id="date-picker" 
              value="${selectedDate}"
              style="margin-left: 0.5rem; padding: 0.5rem; font-size: 1rem;"
            />
          </label>
        </div>

        <div id="slots-container" style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
          ${slotHTML || '<p style="grid-column: 1 / -1; text-align: center; color: #999;">No slots available on this date.</p>'}
        </div>

        <p id="selected-slot" style="margin-top: 2rem; text-align: center; font-size: 1.2rem; min-height: 2rem;"></p>
      </div>
    `
    }
    else{
        return `
            <div style="max-width: 800px; margin: 2rem auto; padding: 2rem; font-family: system-ui;">
            <h1 style="font-size: 2.5rem; color: #cc0000; text-align: center;">Error Loading Slots</h1>
            <p style="text-align: center; color: #999;">${slots.error.message}</p>
            </div>
        ` 
    }
}

async function loadAndRender(date: string) {
    const slots = await fetchAvailableSlots(date)
    app.innerHTML = renderTimeSlots(slots, date)

    // Re-attach event listeners after render
    const datePicker = document.getElementById('date-picker') as HTMLInputElement
    const slotsContainer = document.getElementById('slots-container') as HTMLDivElement
    const selectedDisplay = document.getElementById('selected-slot') as HTMLParagraphElement

    datePicker.addEventListener('change', async (e) => {
        const newDate = (e.target as HTMLInputElement).value
        await loadAndRender(newDate)
    })

    // Click handler for each slot button
    slotsContainer.addEventListener('click', (e) => {
        
        const btn = (e.target as HTMLElement).closest('.slot-btn')
        if (btn) {
            const time = btn.getAttribute('data-time')
            console.log((e.target as HTMLElement).getAttribute('data-time'));
            // TODO: Later, trigger next page of info gathering for booking, then booking API call
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