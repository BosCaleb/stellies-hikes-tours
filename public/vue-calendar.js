// Vue Booking Calendar component — cal.diy-inspired date/time picker
// Uses Vue 3 global build (window.Vue) with template strings (no SFC needed)
(function () {
  const { createApp, defineComponent, ref, computed } = Vue;

  const BookingCalendar = defineComponent({
    name: 'BookingCalendar',
    props: {
      availability: { type: Object, default: () => ({}) },
    },
    emits: ['selected'],
    setup(props, { emit }) {
      const viewMonth = ref(new Date());
      const selectedDate = ref(null);
      const selectedTime = ref(null);
      const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

      const today = computed(() => {
        const t = new Date(); t.setHours(0, 0, 0, 0); return t;
      });
      const maxDate = computed(() => {
        const d = new Date(today.value); d.setDate(d.getDate() + 30); return d;
      });

      const monthLabel = computed(() =>
        viewMonth.value.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
      );
      const canGoPrev = computed(() => {
        const first = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth(), 1);
        return first > today.value;
      });
      const canGoNext = computed(() => {
        const last = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 0);
        return last < maxDate.value;
      });

      const calendarCells = computed(() => {
        const year = viewMonth.value.getFullYear();
        const month = viewMonth.value.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;
        const cells = [];
        for (let i = 0; i < startDay; i++) cells.push({ date: null });
        for (let d = 1; d <= lastDay.getDate(); d++) {
          const dateObj = new Date(year, month, d);
          dateObj.setHours(0, 0, 0, 0);
          const key = dateObj.toISOString().slice(0, 10);
          const isPast = dateObj < today.value;
          const isAfterMax = dateObj > maxDate.value;
          const hasSlots = props.availability.dates && props.availability.dates[key];
          cells.push({
            date: d, dateKey: key,
            available: !isPast && !isAfterMax && hasSlots,
            selected: selectedDate.value === key,
          });
        }
        return cells;
      });

      const availableSlots = computed(() => {
        if (!selectedDate.value || !props.availability.dates) return [];
        return props.availability.dates[selectedDate.value] || [];
      });

      function prevMonth() {
        if (!canGoPrev.value) return;
        viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() - 1, 1);
      }
      function nextMonth() {
        if (!canGoNext.value) return;
        viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1);
      }
      function selectDate(key) {
        selectedDate.value = key;
        selectedTime.value = null;
        emit('selected', { date: key, time: null });
      }
      function selectTime(time) {
        selectedTime.value = time;
        emit('selected', { date: selectedDate.value, time });
      }
      function formatDate(key) {
        const d = new Date(key + 'T00:00:00');
        return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
      }

      return {
        viewMonth, selectedDate, selectedTime, weekdays,
        monthLabel, canGoPrev, canGoNext, calendarCells, availableSlots,
        prevMonth, nextMonth, selectDate, selectTime, formatDate,
      };
    },
    template: `
      <div class="vue-calendar">
        <div class="cal-header">
          <button class="cal-nav-btn" @click="prevMonth" :disabled="!canGoPrev">‹</button>
          <span class="cal-month-label">{{ monthLabel }}</span>
          <button class="cal-nav-btn" @click="nextMonth" :disabled="!canGoNext">›</button>
        </div>
        <div class="cal-weekdays">
          <span v-for="d in weekdays" :key="d">{{ d }}</span>
        </div>
        <div class="cal-grid">
          <div
            v-for="(cell, i) in calendarCells"
            :key="i"
            class="cal-cell"
            :class="{
              'cal-empty': !cell.date,
              'cal-available': cell.available,
              'cal-selected': cell.selected,
              'cal-disabled': cell.date && !cell.available,
            }"
            @click="cell.available && selectDate(cell.dateKey)"
          >
            <span v-if="cell.date" class="cal-day-num">{{ cell.date }}</span>
          </div>
        </div>
        <div v-if="selectedDate" class="cal-timeslots">
          <h4 class="cal-timeslots-title">Available times — {{ formatDate(selectedDate) }}</h4>
          <div class="cal-slot-list">
            <button
              v-for="slot in availableSlots"
              :key="slot"
              class="cal-slot"
              :class="{ 'cal-slot-selected': selectedTime === slot }"
              @click="selectTime(slot)"
            >{{ slot }}</button>
          </div>
        </div>
        <div v-else class="cal-hint">
          Pick a date with available slots to continue.
        </div>
      </div>
    `,
  });

  // Expose globally for React wrapper
  window.BookingCalendar = BookingCalendar;
  window.VueCreateApp = createApp;
})();
