import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Customer Tab Stack
export type CustomerTabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

// Main Stack
export type RootStackParamList = {
  Auth: undefined;
  CustomerTabs: undefined;
  RestaurantDetail: { restaurantId: string };
  Checkout: undefined;
  Payment: { orderId: string };
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  AddressList: undefined;
  AddAddress: undefined;
  EditAddress: { addressId: string };
};

// Restaurant Owner Stack
export type RestaurantStackParamList = {
  RestaurantDashboard: undefined;
  MenuManagement: undefined;
  AddEditMenuItem: { itemId?: string; categoryId?: string };
  RestaurantOrders: { status?: string };
  OrderDetail: { orderId: string };
};

// Rider Stack
export type RiderStackParamList = {
  RiderDashboard: undefined;
  AvailableOrders: undefined;
  DeliveryMap: { orderId: string };
  Earnings: undefined;
};

// Admin Stack
export type AdminStackParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  RestaurantManagement: undefined;
  RiderManagement: undefined;
  Analytics: undefined;
  OrderDetail: { orderId: string };
};

// Screen Props Types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<CustomerTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type RestaurantStackScreenProps<T extends keyof RestaurantStackParamList> =
  NativeStackScreenProps<RestaurantStackParamList, T>;

export type RiderStackScreenProps<T extends keyof RiderStackParamList> =
  NativeStackScreenProps<RiderStackParamList, T>;

export type AdminStackScreenProps<T extends keyof AdminStackParamList> =
  NativeStackScreenProps<AdminStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
