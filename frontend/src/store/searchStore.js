import { create } from 'zustand';
const defaultState = {
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
export const useSearchStore = create((set) => ({
    ...defaultState,
    setFilter: (key, value) => set((state) => {
        if (key === 'specialty') {
            return { ...state, specialty: value, page: 1 };
        }
        if (key === 'scheduleYear') {
            return { ...state, scheduleYear: value, page: 1 };
        }
        if (key === 'scheduleMonth') {
            return { ...state, scheduleMonth: value, page: 1 };
        }
        const nextValues = Array.isArray(value) ? value : [];
        return { ...state, [key]: nextValues, page: 1 };
    }),
    setSpecialty: (specialty) => set((state) => ({ ...state, specialty, page: 1 })),
    setSpecialtyAndReset: (specialty) => set(() => ({
        ...defaultState,
        specialty
    })),
    resetFilters: (specialty) => set((state) => ({
        ...defaultState,
        specialty: specialty ?? state.specialty
    })),
    setPage: (page) => set((state) => ({ ...state, page }))
}));
