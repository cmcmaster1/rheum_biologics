import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useEffect } from 'react';

import { useSchedules } from '../../hooks/useSchedules';
import { useSearchStore } from '../../store/searchStore';

export const ScheduleSelect = () => {
  const { data: schedules } = useSchedules();
  const scheduleYear = useSearchStore((state) => state.scheduleYear);
  const scheduleMonth = useSearchStore((state) => state.scheduleMonth);
  const setFilter = useSearchStore((state) => state.setFilter);

  useEffect(() => {
    if (!schedules || schedules.length === 0) {
      return;
    }

    const currentSelection = schedules.find(
      (schedule) =>
        schedule.schedule_year === scheduleYear && schedule.schedule_month === scheduleMonth
    );

    if (!currentSelection) {
      const latest = schedules.find((schedule) => schedule.latest) ?? schedules[0];
      setFilter('scheduleYear', latest.schedule_year);
      setFilter('scheduleMonth', latest.schedule_month);
    }
  }, [schedules, scheduleMonth, scheduleYear, setFilter]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const [yearPart, monthPart] = value.split('|');
    setFilter('scheduleYear', Number(yearPart));
    setFilter('scheduleMonth', monthPart);
  };

  const selectedValue = scheduleYear && scheduleMonth ? `${scheduleYear}|${scheduleMonth}` : '';

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="schedule-select-label">PBS Schedule</InputLabel>
      <Select
        labelId="schedule-select-label"
        label="PBS Schedule"
        value={selectedValue}
        onChange={handleChange}
      >
        {schedules?.map((schedule) => (
          <MenuItem
            key={schedule.schedule_code}
            value={`${schedule.schedule_year}|${schedule.schedule_month}`}
          >
            {schedule.schedule_month} {schedule.schedule_year}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
