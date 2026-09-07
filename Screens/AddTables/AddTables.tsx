import AddTableFooter from '@/components/AddTable/AddTableFooter';
import type { AddTableFormRef } from '@/components/AddTable/AddTableForm';
import AddTableForm, { AddTableData } from '@/components/AddTable/AddTableForm';
import AddTableHeader from '@/components/AddTable/AddTableHeader';
import { useAuth } from '@/contexts/AuthContext';
import { createTable } from '@/services/authApi';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';

export default function AddTableScreen() {
  // Ref to access AddTableForm's submit method
  const formRef = useRef<AddTableFormRef>(null);
  const { token } = useAuth();
  const formDataRef = useRef<AddTableData | null>(null);

  const handleFormSubmit = (data: AddTableData) => {
    formDataRef.current = data;
  };

  const handleSave = async () => {
    // Trigger the form submit, which calls handleFormSubmit
    if (formRef.current) {
      formRef.current.submitForm?.();
    }

    if (!token) {
      console.log('Authentication', 'User not logged in. Please log in first.');
      return;
    }

    if (!formDataRef.current) {
      Alert.alert('Validation', 'Please enter the table details.');
      return;
    }

    // formDataRef.current is guaranteed non-null after the check above
    const formData = formDataRef.current;
    await (async () => {
      try {
        // Convert AddTableData to API payload shape
        const payload = {
          table_number: formData.tableNumber,
          table_name: formData.tableName,
          seating_capacity: formData.seatingCapacity,
          area: formData.area,
          floor: formData.floor,
          table_type: formData.tableType,
          status: formData.status,
          is_active: formData.isActive,
        };
        // Log what’s being sent
        const resp = await createTable(payload, token ?? '');
        if (resp.success) {
          Alert.alert('Success', 'Table saved successfully.', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        } else {
          Alert.alert('Error', resp.message || 'Failed to save table.');
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    })();
  };

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-[#FCFBFD]'
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className='flex-1'>
        <AddTableHeader onBack={() => router.back()} />

        <AddTableForm ref={formRef} onSubmit={handleFormSubmit} />

        <AddTableFooter onCancel={() => router.back()} onSave={handleSave} />
      </View>
    </KeyboardAvoidingView>
  );
}
