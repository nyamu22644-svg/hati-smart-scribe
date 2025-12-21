import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

/**
 * HATI NOTIFICATION SERVICE
 * Sends email and WhatsApp notifications via Firebase Cloud Functions
 */

export const sendGuardianInvite = async (guardianEmail: string, guardianName: string, ownerName: string) => {
  try {
    const sendEmailNotification = httpsCallable(functions, 'sendGuardianInvite');
    await sendEmailNotification({
      guardianEmail,
      guardianName,
      ownerName
    });
    console.log(`✅ Guardian invite sent to ${guardianEmail}`);
  } catch (err: any) {
    console.error('Error sending guardian invite:', err.message);
    throw err;
  }
};

export const sendPaymentConfirmation = async (email: string, name: string, amount: number, planName: string) => {
  try {
    const sendEmailNotification = httpsCallable(functions, 'sendPaymentConfirmation');
    await sendEmailNotification({
      email,
      name,
      amount,
      planName
    });
    console.log(`✅ Payment confirmation sent to ${email}`);
  } catch (err: any) {
    console.error('Error sending payment confirmation:', err.message);
    throw err;
  }
};

export const sendCampaignNotification = async (recipients: string[], message: string, channel: 'email' | 'whatsapp') => {
  try {
    const sendCampaign = httpsCallable(functions, 'sendCampaign');
    await sendCampaign({
      recipients,
      message,
      channel
    });
    console.log(`✅ Campaign sent via ${channel} to ${recipients.length} recipients`);
  } catch (err: any) {
    console.error(`Error sending ${channel} campaign:`, err.message);
    throw err;
  }
};

export const sendEmergencyAlert = async (guardianEmail: string, ownerName: string, accessLink: string) => {
  try {
    const sendAlert = httpsCallable(functions, 'sendEmergencyAlert');
    await sendAlert({
      guardianEmail,
      ownerName,
      accessLink
    });
    console.log(`✅ Emergency alert sent to guardian`);
  } catch (err: any) {
    console.error('Error sending emergency alert:', err.message);
    throw err;
  }
};
