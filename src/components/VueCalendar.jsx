import { useEffect, useRef } from 'react';
import { createApp } from 'vue';
import BookingCalendar from '../vue/BookingCalendar.vue';

/**
 * React wrapper that mounts a Vue 3 component (BookingCalendar) into a div.
 * The Vue app receives `availability` as a prop and emits `selected` events
 * back to React via the onSelected callback.
 */
export default function VueCalendar({ availability, onSelected }) {
  const containerRef = useRef(null);
  const vueAppRef = useRef(null);
  const callbackRef = useRef(onSelected);
  callbackRef.current = onSelected;

  useEffect(() => {
    if (!containerRef.current) return;

    const vueApp = createApp(BookingCalendar, {
      availability,
      onSelected: (val) => callbackRef.current?.(val),
    });
    vueApp.mount(containerRef.current);
    vueAppRef.current = vueApp;

    return () => {
      vueApp.unmount();
      vueAppRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update props when availability changes (re-mount to pass new props)
  useEffect(() => {
    if (!containerRef.current || !vueAppRef.current) return;
    // Re-mount with new availability
    vueAppRef.current.unmount();
    const vueApp = createApp(BookingCalendar, {
      availability,
      onSelected: (val) => callbackRef.current?.(val),
    });
    vueApp.mount(containerRef.current);
    vueAppRef.current = vueApp;

    return () => {
      vueApp.unmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability]);

  return <div ref={containerRef} />;
}
