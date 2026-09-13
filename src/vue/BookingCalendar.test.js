import { createApp, nextTick } from 'vue';
import BookingCalendar from './BookingCalendar.vue';

describe('BookingCalendar', () => {
  let container;
  let app;

  beforeEach(() => {
    // Only fake Date so Vue's scheduler still runs normally.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 13, 9, 0)); // Sunday 13 September 2026, local time
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    app?.unmount();
    container.remove();
    vi.useRealTimers();
  });

  it('shows availability on the matching day and emits that same date', async () => {
    const onSelected = vi.fn();
    app = createApp(BookingCalendar, {
      availability: { dates: { '2026-09-14': ['08:00'] } },
      onSelected,
    });
    app.mount(container);

    const available = [...container.querySelectorAll('.cal-available')];
    expect(available.map(cell => cell.textContent.trim())).toEqual(['14']);

    available[0].click();
    await nextTick();
    expect(onSelected).toHaveBeenLastCalledWith({ date: '2026-09-14', time: null });

    container.querySelector('.cal-slot').click();
    expect(onSelected).toHaveBeenLastCalledWith({ date: '2026-09-14', time: '08:00' });
  });
});
