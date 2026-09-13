describe('api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('serves bundled hikes, tours and schedule-based availability on the static site', async () => {
    vi.stubEnv('MODE', 'static');
    vi.resetModules();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { api, STATIC_SITE } = await import('./api.js');

    expect(STATIC_SITE).toBe(true);
    expect(api.createBooking).toBeUndefined();

    const hikes = await api.getHikes();
    expect(hikes.map(h => h.id)).toContain('paarl-rock');
    expect((await api.getTour('pniel-heritage')).name).toBe('Pniel Heritage Walk');
    await expect(api.getHike('no-such-hike')).rejects.toThrow('404');

    const paarlRock = hikes.find(h => h.id === 'paarl-rock');
    const { dates } = await api.getAvailability('hike', 'paarl-rock');
    expect(Object.keys(dates).length).toBeGreaterThan(0);
    for (const [key, slots] of Object.entries(dates)) {
      expect(paarlRock.daysOfWeek).toContain(new Date(`${key}T00:00:00Z`).getUTCDay());
      expect(slots).toEqual(paarlRock.timeSlots);
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses the HTTP API in normal builds', async () => {
    const { api, STATIC_SITE } = await import('./api.js');

    expect(STATIC_SITE).toBe(false);
    expect(typeof api.createBooking).toBe('function');
  });
});
