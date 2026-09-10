import { Linking } from 'react-native';

const INDIA_COUNTRY_CODE = '91';

const normalizeNumber = (mobileNumber: string): string => {
  let digits = mobileNumber.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    digits = `${INDIA_COUNTRY_CODE}${digits}`;
  }

  return digits;
};

export async function openWhatsAppChat(mobileNumber: string): Promise<void> {
  const number = normalizeNumber(mobileNumber);

  if (!number) {
    return;
  }

  await Linking.openURL(`https://wa.me/${number}`);
}

export async function makeWhatsAppCall(mobileNumber: string): Promise<void> {
  const number = normalizeNumber(mobileNumber);

  if (!number) {
    return;
  }

  await Linking.openURL(`https://wa.me/call/${number}`);
}