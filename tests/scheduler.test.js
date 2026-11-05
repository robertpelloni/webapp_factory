import { describe, it, expect, vi } from 'vitest';
import * as schedulerPkg from '../src/scheduler.js';
import cron from 'node-cron';

describe('Scheduler Module', () => {

  it('should explicitly register the node-cron daemon correctly', () => {
     // Spy on cron.schedule
     const cronSpy = vi.spyOn(cron, 'schedule').mockImplementation(() => {
        return { start: vi.fn(), stop: vi.fn() };
     });

     schedulerPkg.startScheduler();

     expect(cronSpy).toHaveBeenCalled();
     // Ensure it registers the 6-hour interval
     expect(cronSpy).toHaveBeenCalledWith('0 */6 * * *', expect.any(Function));

     cronSpy.mockRestore();
  });

});
