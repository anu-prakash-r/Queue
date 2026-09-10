import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type AddTableData = {
  tableNumber: string;
  tableName: string;
  seatingCapacity: number;
  area: string;
  floor: string;
  tableType: string;
  status: TableStatus;
  description: string;
  remarks: string;
  isActive: boolean;
};

export type AddTableFormRef = {
  submitForm: () => AddTableData | null;
  setFormData: (data: AddTableData) => void;
};

type AddTableFormProps = {
  onSubmit?: (data: AddTableData) => void;
};

const statusOptions: {
  label: TableStatus;
  color: string;
}[] = [
  {
    label: 'Available',
    color: '#2FA83F',
  },
  {
    label: 'Occupied',
    color: '#E31B23',
  },
  {
    label: 'Reserved',
    color: '#2374D8',
  },
  {
    label: 'Maintenance',
    color: '#F28C00',
  },
];

const areaOptions = [
  'Dining Area',
  'Dining Hall',
  'Terrace Area',
  'Outdoor Area',
];

const floorOptions = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];

const tableTypeOptions = ['Standard', 'Premium', 'VIP'];

const AddTableForm = forwardRef<AddTableFormRef, AddTableFormProps>(
  function AddTableForm({ onSubmit }, ref) {
    const [tableNumber, setTableNumber] = useState('');
    const [tableName, setTableName] = useState('');
    const [seatingCapacity, setSeatingCapacity] = useState(1);

    const [area, setArea] = useState('Dining Area');
    const [floor, setFloor] = useState('Floor 1');
    const [tableType, setTableType] = useState('');
    const [status, setStatus] = useState<TableStatus>('Available');
    const [description, setDescription] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);

    const [floorDropdownOpen, setFloorDropdownOpen] = useState(false);

    const [showValidation, setShowValidation] = useState(false);

    const closeDropdowns = () => {
      setAreaDropdownOpen(false);
      setFloorDropdownOpen(false);
    };

    const handleTableNumberChange = (value: string) => {
      setTableNumber(value);
    };

    const decreaseCapacity = () => {
      setSeatingCapacity(previous => Math.max(1, previous - 1));
    };

    const increaseCapacity = () => {
      setSeatingCapacity(previous => Math.min(20, previous + 1));
    };

    const handleAreaSelect = (selectedArea: string) => {
      setArea(selectedArea);
      setAreaDropdownOpen(false);
    };

    const handleFloorSelect = (selectedFloor: string) => {
      setFloor(selectedFloor);
      setFloorDropdownOpen(false);
    };

    const handleSubmit = (): AddTableData | null => {
      setShowValidation(true);

      const trimmedTableNumber = tableNumber.trim();

      if (!trimmedTableNumber || !area || !floor || !tableType || !status) {
        return null;
      }

      const data: AddTableData = {
        tableNumber: trimmedTableNumber,
        tableName: tableName.trim(),
        seatingCapacity,
        area,
        floor,
        tableType,
        status,
        description,
        remarks,
        isActive,
      };

      onSubmit?.(data);

      return data;
    };

    const applyFormData = (data: AddTableData) => {
      setTableNumber(data.tableNumber ?? '');
      setTableName(data.tableName ?? '');

      setSeatingCapacity(
        Math.min(Math.max(Number(data.seatingCapacity) || 1, 1), 20),
      );

      setArea(data.area || 'Dining Area');
      setFloor(data.floor || 'Floor 1');
      setTableType(data.tableType ?? '');
      setStatus(data.status ?? 'Available');
      setDescription(data.description ?? '');
      setRemarks(data.remarks ?? '');
      setIsActive(data.isActive ?? true);
      setShowValidation(false);
    };

    useImperativeHandle(
      ref,
      () => ({
        submitForm: handleSubmit,
        setFormData: applyFormData,
      }),
      [
        tableNumber,
        tableName,
        seatingCapacity,
        area,
        floor,
        tableType,
        status,
        description,
        remarks,
        isActive,
        onSubmit,
      ],
    );

    const tableNumberError = showValidation && !tableNumber.trim();

    const areaError = showValidation && !area;

    const floorError = showValidation && !floor;

    const tableTypeError = showValidation && !tableType;

    const statusError = showValidation && !status;

    return (
      <View className='flex-1 bg-[#FCFBFD]'>
        <ScrollView
          className='flex-1 bg-[#FCFBFD]'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 25,
            paddingBottom: 30,
          }}
        >
          {(areaDropdownOpen || floorDropdownOpen) && (
            <Pressable
              onPress={closeDropdowns}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 5,
              }}
            />
          )}

          <View className='mb-5'>
            <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
              Table Number
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <TextInput
              value={tableNumber}
              onChangeText={handleTableNumberChange}
              placeholder='Enter table number'
              placeholderTextColor='#77718A'
              className={`h-[44px] rounded-xl border bg-white px-4 text-[14px] text-[#17132F] ${
                tableNumberError ? 'border-[#E31B23]' : 'border-[#D8D2E2]'
              }`}
            />

            {tableNumberError && (
              <Text className='mt-1 text-[12px] text-[#E31B23]'>
                Table number is required.
              </Text>
            )}
          </View>

          <View className='mb-5'>
            <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
              Table Name
              <Text className='text-[#514B68]'> (Optional)</Text>
            </Text>

            <TextInput
              value={tableName}
              onChangeText={setTableName}
              placeholder='Enter table name'
              placeholderTextColor='#77718A'
              className='h-[44px] rounded-xl border border-[#D8D2E2] bg-white px-4 text-[14px] text-[#17132F]'
            />
          </View>

          <View className='mb-5'>
            <Text className='text-[14px] font-medium text-[#17132F]'>
              Seating Capacity
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <View className='flex-row items-center'>
              <View className='h-[50px] w-[250px] flex-row overflow-hidden rounded-xl border border-[#D8D2E2] bg-white'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={decreaseCapacity}
                  className='w-[50px] items-center justify-center border-r border-[#D8D2E2]'
                  hitSlop={10}
                >
                  <Entypo name='minus' size={24} color='black' />
                </TouchableOpacity>

                <View className='flex-1 items-center justify-center'>
                  <Text className='text-[16px] font-medium text-[#17132F]'>
                    {seatingCapacity}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={increaseCapacity}
                  className='w-[50px] items-center justify-center border-l border-[#D8D2E2]'
                  hitSlop={10}
                >
                  <Entypo name='plus' size={24} color='black' />
                </TouchableOpacity>
              </View>

              <View className='ml-4 flex-1 items-center justify-center'>
                <MaterialIcons
                  name='table-restaurant'
                  size={40}
                  color='#171717'
                />

                <Text className='text-[14px] font-medium text-[#17132F]'>
                  {seatingCapacity} Seater
                </Text>
              </View>
            </View>
          </View>

          <View
            className='mb-5'
            style={{
              zIndex: 20,
              elevation: 20,
            }}
          >
            <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
              Area / Section
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setAreaDropdownOpen(previous => !previous);
                setFloorDropdownOpen(false);
                Keyboard.dismiss();
              }}
              hitSlop={10}
              className={`h-[44px] flex-row items-center justify-between rounded-xl border bg-white px-4 ${
                areaError ? 'border-[#E31B23]' : 'border-[#D8D2E2]'
              }`}
            >
              <Text className='text-[14px] text-[#17132F]'>{area}</Text>

              <MaterialIcons
                name={
                  areaDropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
                size={22}
                color='#35116B'
              />
            </TouchableOpacity>

            {areaError && (
              <Text className='mt-1 text-[12px] text-[#E31B23]'>
                Area is required.
              </Text>
            )}

            {areaDropdownOpen && (
              <View
                className='absolute left-0 right-0 overflow-hidden rounded-xl border border-[#D8D2E2] bg-white'
                style={{
                  top: 70,
                  zIndex: 100,
                  elevation: 10,
                }}
              >
                {areaOptions.map(item => {
                  const selected = area === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.7}
                      onPress={() => handleAreaSelect(item)}
                      className={`h-[45px] flex-row items-center justify-between px-4 ${
                        selected ? 'bg-[#F4F0F8]' : 'bg-white'
                      }`}
                      hitSlop={10}
                    >
                      <Text
                        className={`text-[14px] ${
                          selected
                            ? 'font-semibold text-[#35116B]'
                            : 'text-[#17132F]'
                        }`}
                      >
                        {item}
                      </Text>

                      {selected && (
                        <MaterialIcons name='check' size={20} color='#35116B' />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View
            className='mb-5'
            style={{
              zIndex: 10,
              elevation: 10,
            }}
          >
            <Text className='mb-2 text-[14px] font-medium text-[#17132F]'>
              Floor
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setFloorDropdownOpen(previous => !previous);
                setAreaDropdownOpen(false);
                Keyboard.dismiss();
              }}
              hitSlop={10}
              className={`h-[44px] flex-row items-center justify-between rounded-xl border bg-white px-4 ${
                floorError ? 'border-[#E31B23]' : 'border-[#D8D2E2]'
              }`}
            >
              <Text className='text-[14px] text-[#17132F]'>{floor}</Text>

              <MaterialIcons
                name={
                  floorDropdownOpen
                    ? 'keyboard-arrow-up'
                    : 'keyboard-arrow-down'
                }
                size={22}
                color='#35116B'
              />
            </TouchableOpacity>

            {floorError && (
              <Text className='mt-1 text-[12px] text-[#E31B23]'>
                Floor is required.
              </Text>
            )}

            {floorDropdownOpen && (
              <View
                className='absolute left-0 right-0 overflow-hidden rounded-xl border border-[#D8D2E2] bg-white'
                style={{
                  top: 70,
                  zIndex: 100,
                  elevation: 10,
                }}
              >
                {floorOptions.map(item => {
                  const selected = floor === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.7}
                      onPress={() => handleFloorSelect(item)}
                      className={`h-[45px] flex-row items-center justify-between px-4 ${
                        selected ? 'bg-[#F4F0F8]' : 'bg-white'
                      }`}
                      hitSlop={10}
                    >
                      <Text
                        className={`text-[14px] ${
                          selected
                            ? 'font-semibold text-[#35116B]'
                            : 'text-[#17132F]'
                        }`}
                      >
                        {item}
                      </Text>

                      {selected && (
                        <MaterialIcons name='check' size={20} color='#35116B' />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View className='mb-5'>
            <Text className='mb-4 text-[14px] font-medium text-[#17132F]'>
              Table Type
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <View
              className={`rounded-xl ${
                tableTypeError ? 'border border-[#E31B23] p-2' : ''
              }`}
            >
              <View className='flex-row gap-8'>
                {tableTypeOptions.map(type => {
                  const selected = tableType === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      activeOpacity={0.7}
                      onPress={() => setTableType(type)}
                      className='flex-row items-center'
                      hitSlop={10}
                    >
                      <View
                        className={`h-[21px] w-[21px] items-center justify-center rounded-full border-2 ${
                          selected ? 'border-[#4B197C]' : 'border-[#B9B1C9]'
                        }`}
                      >
                        {selected && (
                          <View className='h-[11px] w-[11px] rounded-full bg-[#4B197C]' />
                        )}
                      </View>

                      <Text className='ml-2 text-[16px] text-[#292640]'>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {tableTypeError && (
              <Text className='mt-1 text-[12px] text-[#E31B23]'>
                Table type is required.
              </Text>
            )}
          </View>

          <View className='mb-5'>
            <Text className='mb-3 text-[14px] font-medium text-[#17132F]'>
              Status
              <Text className='text-[#E31B23]'> *</Text>
            </Text>

            <View
              className={
                statusError ? 'rounded-xl border border-[#E31B23] p-2' : ''
              }
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 8,
                }}
              >
                {statusOptions.map(item => {
                  const selected = status === item.label;

                  return (
                    <TouchableOpacity
                      key={item.label}
                      activeOpacity={0.7}
                      onPress={() => setStatus(item.label)}
                      className={`h-[45px] min-w-[95px] items-center justify-center rounded-lg border px-3 ${
                        selected
                          ? 'border-[#35116B] bg-[#F7F3FA]'
                          : 'border-[#D8D2E2] bg-white'
                      }`}
                      hitSlop={10}
                    >
                      <View className='flex-row items-center'>
                        <View
                          className='mr-2 h-[12px] w-[12px] rounded-full'
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        <Text
                          className='text-[11px] font-bold text-[#17132F]'
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {statusError && (
              <Text className='mt-1 text-[12px] text-[#E31B23]'>
                Status is required.
              </Text>
            )}
          </View>

          <View className='mb-5'>
            <View className='mb-2 flex-row'>
              <Text className='text-[14px] font-medium text-[#17132F]'>
                Description
              </Text>

              <Text className='ml-1 text-[14px] font-medium text-[#514B68]'>
                (Optional)
              </Text>
            </View>

            <View className='h-[118px] rounded-xl border border-[#D8D2E2] bg-white'>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder='Enter table description...'
                placeholderTextColor='#77718A'
                multiline
                maxLength={100}
                textAlignVertical='top'
                className='flex-1 px-4 pt-4 text-[14px] text-[#17132F]'
              />

              <Text className='absolute bottom-2 right-3 text-[13px] text-[#77718A]'>
                {description.length}/100
              </Text>
            </View>
          </View>

          <View className='mb-5'>
            <View className='mb-2 flex-row'>
              <Text className='text-[14px] font-medium text-[#17132F]'>
                Remarks
              </Text>

              <Text className='ml-1 text-[14px] font-medium text-[#514B68]'>
                (Optional)
              </Text>
            </View>

            <View className='h-[118px] rounded-xl border border-[#D8D2E2] bg-white'>
              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder='Any internal notes...'
                placeholderTextColor='#77718A'
                multiline
                maxLength={100}
                textAlignVertical='top'
                className='flex-1 px-4 pt-4 text-[14px] text-[#17132F]'
              />

              <Text className='absolute bottom-2 right-3 text-[13px] text-[#77718A]'>
                {remarks.length}/100
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsActive(previous => !previous)}
            className='mb-5 flex-row items-center'
            hitSlop={10}
          >
            <View
              className={`h-[20px] w-[20px] items-center justify-center rounded-[3px] ${
                isActive ? 'bg-[#35116B]' : 'border border-[#A9A2B5] bg-white'
              }`}
            >
              {isActive && (
                <MaterialIcons name='check' size={18} color='#FFFFFF' />
              )}
            </View>

            <Text className='ml-3 text-[14px] text-[#292640]'>
              Make this table active
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  },
);

export default AddTableForm;
