import {DEFAULT_COLUMNS, SORT_ORDER} from './common';

export type DashboardPreferences = {
    visibleColumns?: DEFAULT_COLUMNS[];
    sortColumn?: DEFAULT_COLUMNS;
    sortOrder?: SORT_ORDER;
};

export type DevicePreferences = {
    dashboard?: DashboardPreferences;
};

export type Preferences = {
    mobile?: DevicePreferences;
    computer?: DevicePreferences;
    loaded: boolean;
};
