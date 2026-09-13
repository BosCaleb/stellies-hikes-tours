import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrolling; App scrolls to the top on every route change.
window.scrollTo = () => {};
