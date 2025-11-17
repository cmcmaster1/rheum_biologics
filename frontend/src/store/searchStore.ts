import { create } from 'zustand';

export type FilterKey =
  | 'scheduleYear'
  | 'scheduleMonth'
  | 'drug'
  | 'brand'
  | 'formulation'
  | 'indication'
  | 'treatmentPhase'
  | 'hospitalType'
  | 'pbsCode'
  | 'specialty';

export type FilterState = {
  specialty: 'rheumatology' | 'dermatology' | 'gastroenterology';
  scheduleYear?: number;
  scheduleMonth?: string;
  drug: string[];
  brand: string[];
  formulation: string[];
  indication: string[];
  treatmentPhase: string[];
  hospitalType: string[];
  pbsCode: string[];
  limit: number;
  page: number;
};

type FilterActions = {
  setFilter: (key: FilterKey, value: string[] | number | string | undefined) => void;
  setSpecialty: (specialty: FilterState['specialty']) => void;
  setSpecialtyAndReset: (specialty: FilterState['specialty']) => void;
  resetFilters: (specialty?: FilterState['specialty']) => void;
  setPage: (page: number) => void;
};

const defaultState: FilterState = {
  specialty: 'rheumatology',
  scheduleYear: undefined,
  scheduleMonth: undefined,
  drug: [],
  brand: [],
  formulation: [],
  indication: [],
  treatmentPhase: [],
  hospitalType: [],
  pbsCode: [],
  limit: 25,
  page: 1
};

export const useSearchStore = create<FilterState & FilterActions>((set) => ({
  ...defaultState,
  setFilter: (key, value) =>
    set((state) => {
      if (key === 'specialty') {
        return { ...state, specialty: value as FilterState['specialty'], page: 1 };
      }
      if (key === 'scheduleYear') {
        return { ...state, scheduleYear: value as number | undefined, page: 1 };
      }
      if (key === 'scheduleMonth') {
        return { ...state, scheduleMonth: value as string | undefined, page: 1 };
      }
      const nextValues = Array.isArray(value) ? value : [];
      return { ...state, [key]: nextValues, page: 1 };
    }),
  setSpecialty: (specialty) => set((state) => ({ ...state, specialty, page: 1 })),
  setSpecialtyAndReset: (specialty) =>
    set(() => ({
      ...defaultState,
      specialty
    })),
  resetFilters: (specialty) =>
    set((state) => ({
      ...defaultState,
      specialty: specialty ?? state.specialty
    })),
  setPage: (page) => set((state) => ({ ...state, page }))
}));
