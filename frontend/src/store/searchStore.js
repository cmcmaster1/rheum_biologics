import { create } from 'zustand';
const defaultState = {
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
        if (key === 'scheduleYear') {
            return { ...state, scheduleYear: value, page: 1 };
        }
        if (key === 'scheduleMonth') {
            return { ...state, scheduleMonth: value, page: 1 };
        }
        const nextValues = Array.isArray(value) ? value : [];
        return { ...state, [key]: nextValues, page: 1 };
    }),
    resetFilters: () => set(() => ({ ...defaultState })),
    setPage: (page) => set((state) => ({ ...state, page }))
}));
