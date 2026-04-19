// Navigation Types for AndhraEssence Mobile App

import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  index: undefined;
  login: undefined;
  register: undefined;
};

export type TabStackParamList = {
  index: undefined;
  search: undefined;
  cart: undefined;
  orders: undefined;
  profile: undefined;
  onboarding: undefined;
};

export type RootStackParamList = {
  index: undefined;
  "(tabs)": NavigatorScreenParams<TabStackParamList>;
  auth: NavigatorScreenParams<AuthStackParamList>;
  restaurant: {
    id: string;
  };
  checkout: undefined;
  order: {
    id: string;
  };
  "screens/admin/AdminDashboardScreen": undefined;
  "screens/restaurant/RestaurantDashboardScreen": undefined;
  "screens/rider/RiderDashboardScreen": undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
