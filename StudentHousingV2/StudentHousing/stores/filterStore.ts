import { Filter } from "@/typings";

class FilterStore {
  static instance: FilterStore | null = null;
  private filters: Record<string, Filter>;
  private listeners: ((filters: Record<string, any>) => void)[];

  constructor() {
    // Initialize your filter state
    this.filters = {};
    this.listeners = [];
  }

  // Get the singleton instance
  static getInstance() {
    if (!FilterStore.instance) {
      FilterStore.instance = new FilterStore();
    }
    return FilterStore.instance;
  }

  // Set a filter value
  setFilter(filterType: string, value: Filter) {
    this.filters = {
      ...this.filters,
      [filterType]: value,
    };
    this.notifyListeners();
  }

  setFilters(filters: Record<string, Filter>) {
    this.filters = filters;
    this.notifyListeners();
  }

  // Remove a filter
  removeFilter(filterType: string) {
    const newFilters = { ...this.filters };
    delete newFilters[filterType];
    this.filters = newFilters;
    this.notifyListeners();
  }

  // Get all filters
  getFilters() {
    return this.filters;
  }

  // Get a specific filter
  getFilter(filterType: string) {
    return this.filters[filterType];
  }

  // Clear all filters
  clearFilters() {
    this.filters = {};
    this.notifyListeners();
  }

  // Add a listener to detect changes
  addListener(callback: (filters: Record<string, any>) => void) {
    this.listeners.push(callback);
    return () => this.removeListener(callback);
  }

  // Remove a listener
  removeListener(callback: (filters: Record<string, any>) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  // Notify all listeners of changes
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.filters));
  }
}

// Export the singleton instance getter
export default FilterStore.getInstance;
