<template>
  <div class="vue-calendar">
    <!-- Calendar header -->
    <div class="cal-header">
      <button class="cal-nav-btn" @click="prevMonth" :disabled="!canGoPrev">‹</button>
      <span class="cal-month-label">{{ monthLabel }}</span>
      <button class="cal-nav-btn" @click="nextMonth" :disabled="!canGoNext">›</button>
    </div>

    <!-- Day labels -->
    <div class="cal-weekdays">
      <span v-for="d in weekdays" :key="d">{{ d }}</span>
    </div>

    <!-- Calendar grid -->
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

    <!-- Time slots -->
    <div v-if="selectedDate" class="cal-timeslots">
      <h4 class="cal-timeslots-title">Available times — {{ formatDate(selectedDate) }}</h4>
      <div class="cal-slot-list">
        <button
          v-for="slot in availableSlots"
          :key="slot"
          class="cal-slot"
          :class="{ 'cal-slot-selected': selectedTime === slot }"
          @click="selectTime(slot)"
        >
          {{ slot }}
        </button>
      </div>
    </div>

    <div v-else class="cal-hint">
      Pick a date with available slots to continue.
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingCalendar',
  props: {
    availability: { type: Object, default: () => ({}) },
  },
  emits: ['selected'],
  data() {
    return {
      viewMonth: new Date(),
      selectedDate: null,
      selectedTime: null,
      weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    };
  },
  computed: {
    monthLabel() {
      return this.viewMonth.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
    },
    today() {
      const t = new Date(); t.setHours(0, 0, 0, 0); return t;
    },
    maxDate() {
      const d = new Date(this.today); d.setDate(d.getDate() + 30); return d;
    },
    canGoPrev() {
      const firstOfMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth(), 1);
      return firstOfMonth > this.today;
    },
    canGoNext() {
      const lastOfMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 0);
      return lastOfMonth < this.maxDate;
    },
    calendarCells() {
      const year = this.viewMonth.getFullYear();
      const month = this.viewMonth.getMonth();
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
        const isPast = dateObj < this.today;
        const isAfterMax = dateObj > this.maxDate;
        const hasSlots = this.availability.dates && this.availability.dates[key];
        cells.push({
          date: d,
          dateKey: key,
          available: !isPast && !isAfterMax && hasSlots,
          selected: this.selectedDate === key,
        });
      }
      return cells;
    },
    availableSlots() {
      if (!this.selectedDate || !this.availability.dates) return [];
      return this.availability.dates[this.selectedDate] || [];
    },
  },
  methods: {
    prevMonth() {
      if (!this.canGoPrev) return;
      this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() - 1, 1);
    },
    nextMonth() {
      if (!this.canGoNext) return;
      this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1);
    },
    selectDate(key) {
      this.selectedDate = key;
      this.selectedTime = null;
      this.emitSelection();
    },
    selectTime(time) {
      this.selectedTime = time;
      this.emitSelection();
    },
    emitSelection() {
      this.$emit('selected', { date: this.selectedDate, time: this.selectedTime });
    },
    formatDate(key) {
      const d = new Date(key + 'T00:00:00');
      return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
    },
  },
};
</script>

<style scoped>
.vue-calendar {
  font-family: var(--font-body, "Figtree", system-ui, sans-serif);
  color: var(--color-text, #201e1d);
}
.cal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.cal-nav-btn {
  width: 36px; height: 36px; border: 1px solid var(--color-divider, #dcd3c4);
  background: transparent; border-radius: 999px; cursor: pointer;
  font-size: 18px; color: var(--color-text, #201e1d);
}
.cal-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.cal-nav-btn:not(:disabled):hover { background: var(--color-accent-100, #fff2eb); }
.cal-month-label {
  font-family: var(--font-heading, "Caprasimo", sans-serif);
  font-size: 18px;
}
.cal-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr);
  text-align: center; margin-bottom: 6px;
}
.cal-weekdays span {
  font-size: 11px; font-weight: 600; color: var(--color-neutral-600, #82796a);
  text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 0;
}
.cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
}
.cal-cell {
  aspect-ratio: 1; display: grid; place-items: center;
  border-radius: 8px; cursor: default; font-size: 14px;
  transition: background 0.12s;
}
.cal-empty { visibility: hidden; }
.cal-day-num { font-weight: 500; }
.cal-disabled { color: var(--color-neutral-400, #c0b6a5); }
.cal-available { cursor: pointer; }
.cal-available:hover { background: var(--color-accent-100, #fff2eb); }
.cal-available .cal-day-num { color: var(--color-accent-700, #8c491a); font-weight: 600; }
.cal-selected { background: var(--color-accent, #c67139) !important; }
.cal-selected .cal-day-num { color: var(--color-bg, #f5ead8) !important; }
.cal-timeslots { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--color-divider, #dcd3c4); }
.cal-timeslots-title { font-family: var(--font-heading, "Caprasimo", sans-serif); font-size: 16px; margin: 0 0 12px; }
.cal-slot-list { display: flex; flex-wrap: wrap; gap: 8px; }
.cal-slot {
  padding: 10px 18px; border: 1px solid var(--color-divider, #dcd3c4);
  background: transparent; border-radius: 999px; cursor: pointer;
  font-size: 14px; font-family: inherit; color: var(--color-text, #201e1d);
  transition: all 0.12s;
}
.cal-slot:hover { border-color: var(--color-accent, #c67139); background: var(--color-accent-100, #fff2eb); }
.cal-slot-selected { background: var(--color-accent, #c67139) !important; color: var(--color-bg, #f5ead8) !important; border-color: var(--color-accent, #c67139) !important; }
.cal-hint { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--color-divider, #dcd3c4); font-size: 14px; color: var(--color-neutral-600, #82796a); }
</style>
