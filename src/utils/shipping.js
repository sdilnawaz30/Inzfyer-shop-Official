export async function getShipping({ pincode, subtotal, config }) {
  try {
    const cleanPin = String(pincode).replace(/\D/g, '');
    if (cleanPin.length !== 6) return { isValid: false, error: 'Invalid 6-digit Pincode' };

    // In a real app, you would use an API like India Post to resolve the pincode to a state.
    // For now, simple mock: TN starts with 6
    const isTN = cleanPin.startsWith('6');
    const state = isTN ? 'Tamil Nadu' : 'Other State';

    let rate = isTN ? (config?.tnRate ?? 55) : (config?.otherRate ?? 85);
    
    if (subtotal >= (config?.freeThreshold ?? 1000)) {
      rate = 0;
    }

    return { isValid: true, rate, state, error: '' };
  } catch (error) {
    return { isValid: false, error: 'Failed to calculate shipping' };
  }
}