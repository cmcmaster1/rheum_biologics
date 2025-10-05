import { create } from 'zustand';

export type FilterKey =
  | 'scheduleYear'
  | 'scheduleMonth'
  | 'drug'
  | 'brand'
  | 'formulation'
  | 'indication'
  | 'treatmentPhase'
  | 'hospitalType';

export type FilterState = {
  scheduleYear?: number;
  scheduleMonth?: string;
  drug: string[];
  brand: string[];
  formulation: string[];
  indication: string[];
  treatmentPhase: string[];
  hospitalType: string[];
  limit: number;
  page: number;
};

type FilterActions = {
  setFilter: (key: FilterKey, value: string[] | number | string | undefined) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
};

const defaultState: FilterState = {
  scheduleYear: undefined,
  scheduleMonth: undefined,
  drug: [],
  brand: [],
  formulation: [],
  indication: [],
  treatmentPhase: [],
  hospitalType: [],
  limit: 25,
  page: 1
};

export const useSearchStore = create<FilterState & FilterActions>((set) => ({
  ...defaultState,
  setFilter: (key, value) =>
    set((state) => {
      if (key === 'scheduleYear') {
        return { ...state, scheduleYear: value as number | undefined, page: 1 };
      }
      if (key === 'scheduleMonth') {
        return { ...state, scheduleMonth: value as string | undefined, page: 1 };
      }
      const nextValues = Array.isArray(value) ? value : [];
      return { ...state, [key]: nextValues, page: 1 };
    }),
  resetFilters: () => set(() => ({ ...defaultState })),
  setPage: (page) => set((state) => ({ ...state, page }))
}));
