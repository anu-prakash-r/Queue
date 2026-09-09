import { baseApi } from './baseApi';

export type SendOtpPayload = {
  mobile_number: string;
};

export type SendOtpResponse = {
  success?: boolean;
  message?: string;
};

export type VerifyOtpPayload = {
  mobile_number: string;
  otp: string;
};

export type VerifyOtpResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  data?: {
    token?: string;
  };
};

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
  success: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<SendOtpResponse, SendOtpPayload>({
      query: (body) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpPayload>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),

    adminLogin: builder.mutation<AdminLoginResponse, AdminLoginPayload>({
      query: (body) => ({
        url: '/auth/admin-login',
        method: 'POST',
        body,
      }),
    }),

    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/auth/me',
      providesTags: ['Profile'],
    }),

    createTable: builder.mutation<CreateTableResponse, CreateTablePayload>({
      query: (body) => ({
        url: '/tables',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tables'],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useAdminLoginMutation,
  useGetProfileQuery,
  useCreateTableMutation,
} = authApi;
