import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import Toast from 'react-native-toast-message';

import AddTableFooter from '@/components/AddTable/AddTableFooter';

import type {
  AddTableData,
  AddTableFormRef,
} from '@/components/AddTable/AddTableForm';

import AddTableForm from '@/components/AddTable/AddTableForm';

import AddTableHeader from '@/components/AddTable/AddTableHeader';

import { useAuth } from '@/contexts/AuthContext';

import { createTable } from '@/services/authApi';

import { updateTable } from '@/services/tableApi';

export default function AddTableScreen() {
  const formRef = useRef<AddTableFormRef>(null);

  const { token } = useAuth();

  const params = useLocalSearchParams<{
    mode?: string;
    id?: string;
    table?: string;
  }>();

  const isEditMode = params.mode === 'edit' && !!params.id;

  const [loading, setLoading] = useState(false);

  /**
   * Load table data passed from
   * the Tables screen.
   */
  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (!params.table) {
      return;
    }

    try {
      const table = JSON.parse(params.table);

      const tableTypeMap: Record<string, string> = {
        standard: 'Standard',

        premium: 'Premium',

        vip: 'VIP',
      };

      const statusMap: Record<string, AddTableData['status']> = {
        available: 'Available',

        occupied: 'Occupied',

        reserved: 'Reserved',

        maintenance: 'Maintenance',
      };

      const formData: AddTableData = {
        tableNumber: table.table_number ?? '',

        tableName: table.table_name ?? '',

        seatingCapacity: Number(table.seating_capacity ?? table.seats ?? 1),

        area: table.area ?? '',

        floor: table.floor ?? '',

        tableType:
          tableTypeMap[String(table.table_type ?? '').toLowerCase()] ??
          table.table_type ??
          '',

        status:
          statusMap[String(table.status ?? 'available').toLowerCase()] ??
          'Available',

        description: table.description ?? '',

        remarks: table.remarks ?? '',

        isActive: table.is_active ?? true,
      };

      /**
       * Wait one frame so the ref
       * is available.
       */
      setTimeout(() => {
        formRef.current?.setFormData(formData);
      }, 0);
    } catch (error) {
      console.log('FAILED TO LOAD TABLE DATA:', error);

      Toast.show({
        type: 'error',
        text1: 'Unable to load table details.',
        visibilityTime: 4000,
      });
    }
  }, [isEditMode, params.table]);

  const handleSave = async () => {
    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Authentication token not found.',
        visibilityTime: 4000,
      });

      return;
    }

    const formData = formRef.current?.submitForm();

    if (!formData) {
      Toast.show({
        type: 'error',
        text1: 'Please enter all required table details.',
        visibilityTime: 4000,
      });

      return;
    }

    const tableTypeMap: Record<string, string> = {
      Standard: 'standard',

      Premium: 'premium',

      VIP: 'vip',
    };

    const statusMap: Record<string, string> = {
      Available: 'available',

      Occupied: 'occupied',

      Reserved: 'reserved',

      Maintenance: 'maintenance',
    };

    /**
     * COMPLETE PAYLOAD
     *
     * All editable fields are sent.
     */
    const payload = {
      table_number: formData.tableNumber.trim(),

      table_name: formData.tableName.trim(),

      seating_capacity: formData.seatingCapacity,

      area: formData.area,

      floor: formData.floor,

      table_type: tableTypeMap[formData.tableType] ?? formData.tableType,

      status: statusMap[formData.status] ?? formData.status,

      is_active: formData.isActive,

      description: formData.description.trim(),

      remarks: formData.remarks.trim(),
    };

    try {
      setLoading(true);

      /**
       * EDIT
       */
      if (isEditMode) {
        const response = await updateTable(String(params.id), payload, token);

        if (response.success) {
          Toast.show({
            type: 'success',
            text1: 'Table updated successfully.',
            visibilityTime: 2500,
          });

          setTimeout(() => {
            router.back();
          }, 800);

          return;
        }

        const validationErrors = response.errors;

        let errorMessage = response.message ?? 'Failed to update table.';

        if (validationErrors && typeof validationErrors === 'object') {
          const firstError = Object.values(validationErrors)
            .flat()
            .find(error => typeof error === 'string');

          if (firstError) {
            errorMessage = firstError;
          }
        }

        Toast.show({
          type: 'error',
          text1: errorMessage,
          visibilityTime: 4000,
        });

        return;
      }

      /**
       * CREATE
       */
      const response = await createTable(payload, token);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Table created successfully.',
          visibilityTime: 2500,
        });

        setTimeout(() => {
          router.back();
        }, 800);

        return;
      }

      const validationErrors = response.errors;

      let errorMessage = response.message ?? 'Failed to save table.';

      if (validationErrors && typeof validationErrors === 'object') {
        const firstError = Object.values(validationErrors)
          .flat()
          .find(error => typeof error === 'string');

        if (firstError) {
          errorMessage = firstError;
        }
      }

      Toast.show({
        type: 'error',
        text1: errorMessage,
        visibilityTime: 4000,
      });
    } catch (error: unknown) {
      console.log('SAVE TABLE ERROR:', error);

      let message = isEditMode
        ? 'An unexpected error occurred while updating the table.'
        : 'An unexpected error occurred while saving the table.';

      if (error instanceof Error) {
        message = error.message;
      }

      Toast.show({
        type: 'error',
        text1: message,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-[#FCFBFD]'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className='flex-1'>
        <AddTableHeader onBack={handleBack} />

        <View className='flex-1'>
          <AddTableForm ref={formRef} />

          {loading && (
            <View
              className='absolute inset-0 items-center justify-center bg-black/10'
              pointerEvents='auto'
            >
              <View className='rounded-xl bg-white px-6 py-5'>
                <ActivityIndicator size='large' color='#35116B' />
              </View>
            </View>
          )}
        </View>

        <AddTableFooter onCancel={handleCancel} onSave={handleSave} />
      </View>
    </KeyboardAvoidingView>
  );
}
