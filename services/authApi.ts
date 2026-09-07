import { apiRequest } from '@/services/api';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export type SendOtpPayload = {
  mobile_number: string;
};

export type SendOtpResponse = {
  success?: boolean;
  message?: string;
};

// Payload for creating a new table
export type CreateTablePayload = {
  table_number: string;
  table_name: string;
  seating_capacity: number;
  area: string;
  floor: string;
  table_type: string;
  status: string;
  is_active: boolean;
};

export type CreateTableResponse = {
  success?: boolean;
  message?: string;
  data?: any; // adjust based on backend response structure
};

export async function sendOtp(
  payload: SendOtpPayload,
): Promise<SendOtpResponse> {
  return apiRequest<SendOtpResponse>('/auth/send-otp', {
    method: 'POST',
    body: payload,
  });
}
export type VerifyOtpPayload = {
  mobile_number: string;
  otp: string;
};

export type VerifyOtpResponse = {
  success?: boolean;
  message?: string;
  token?: string;
};

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResponse> {
  return apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: payload,
  });
}
export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: {
      email: string;
      id: number;
      name: string;
      role: string;
    };
  };
};

export async function adminLogin(
  payload: AdminLoginPayload,
): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>('/auth/admin-login', {
    method: 'POST',
    body: payload,
  });
}

export type ProfileResponse = {
  success?: boolean;
  message?: string;
  data?: {
    restaurant: {
      id: number;
      name: string;
    } | null;
    user: {
      id: number;
      name: string;
      email: string;
      mobile_number: string;
      role: string;
    };
  };
};

export function useProfile() {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    mobile: string;
    restaurant: string;
  } | null>(null);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit Profile clicked');
  };

  const handleRestaurant = () => {
    Alert.alert('Restaurant', 'Restaurant Details clicked');
  };

  return { profile, handleEditProfile, handleRestaurant };
}

export async function getProfile(token: string): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Create a new table
export async function createTable(
  payload: CreateTablePayload,
  token: string,
): Promise<CreateTableResponse> {
  return apiRequest<CreateTableResponse>('/tables', {
    method: 'POST',
    body: payload,
    headers: { Authorization: `Bearer ${token}` },
  });
}
