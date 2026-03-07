import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn("Twilio credentials are missing in the environment variables!");
}

/**
 * Format a phone number to WhatsApp E.164 format.
 * Assuming standard 10-digit Indian numbers since this seems like a local project.
 * You might need to adjust this depending on the phone number format.
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  // Let's ensure it has country code if not present, default to India +91
  phone = phone.replace(/\D/g, ""); // Remove non-digits
  if (phone.length === 10) {
    phone = `91${phone}`;
  }
  if (!phone.startsWith("+")) {
    phone = `+${phone}`;
  }
  return `whatsapp:${phone}`;
};

/**
 * Utility to send a WhatsApp message using Twilio
 */
export const sendWhatsAppMessage = async (to, message, mediaUrl = null) => {
  if (!client || !twilioWhatsAppNumber) {
    console.error("Twilio is not configured properly. Message not sent:", message);
    return false;
  }

  try {
    const formattedNumber = formatPhoneNumber(to);
    if (!formattedNumber) {
      console.error("Invalid phone number provided:", to);
      return false;
    }

    const messageOptions = {
      body: message,
      from: twilioWhatsAppNumber,
      to: formattedNumber,
    };

    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    const response = await client.messages.create(messageOptions);

    console.log(`WhatsApp message sent to ${formattedNumber}. SID: ${response.sid}`);
    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
};

/**
 * Send template for new appointment confirmation
 */
export const sendAppointmentConfirmation = async (appointment) => {
  const { firstName, lastName, appointment_date, appointment_time, doctor, phone } = appointment;

  const message = `Hello ${firstName} ${lastName},\n\nYour appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been successfully submitted for ${appointment_date} at ${appointment_time}.\n\nYour request is currently *Pending* approval.\n\nThank you for choosing Rahat Clinic!`;

  return await sendWhatsAppMessage(phone, message);
};

/**
 * Send template for appointment status update
 */
export const sendAppointmentStatusUpdate = async (appointment) => {
  const { firstName, lastName, appointment_date, appointment_time, doctor, phone, status } = appointment;

  let statusMessage = "";
  if (status === "Accepted") {
    statusMessage = `Great news! Your appointment has been *Accepted*. We look forward to seeing you.`;
  } else if (status === "Rejected") {
    statusMessage = `We're sorry to inform you that your appointment request has been *Rejected*. Please contact the clinic for more details or to reschedule.`;
  } else {
    statusMessage = `Your appointment status has been updated to: *${status}*.`;
  }

  const message = `Hello ${firstName} ${lastName},\n\nUpdate regarding your appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${appointment_date} at ${appointment_time}:\n\n${statusMessage}\n\nThank you,\nRahat Clinic`;

  return await sendWhatsAppMessage(phone, message);
};

/**
 * Send template for rescheduled appointment
 */
export const sendAppointmentReschedule = async (appointment) => {
  const { firstName, lastName, appointment_date, appointment_time, doctor, phone } = appointment;

  const message = `Hello ${firstName} ${lastName},\n\nYour appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been *Rescheduled* to:\n\nNew Date: ${appointment_date}\nNew Time: ${appointment_time}\n\nThe status is now *Pending* approval again.\n\nThank you,\nRahat Clinic`;

  return await sendWhatsAppMessage(phone, message);
};

/**
 * Send template for appointment report or prescription
 */
export const sendAppointmentReport = async (appointment) => {
  const { firstName, lastName, phone, doctor, appointmentNotes, prescription } = appointment;

  let message = `Hello ${firstName} ${lastName},\n\nYour appointment report/prescription from Dr. ${doctor.firstName} ${doctor.lastName} is now available:\n`;

  if (appointmentNotes) {
    message += `\n*Doctor's Notes:*\n${appointmentNotes}\n`;
  }

  if (prescription) {
    message += `\n*Prescription:*\n${prescription}\n`;
  }

  message += `\nWe wish you good health!\nRahat Clinic`;

  return await sendWhatsAppMessage(phone, message);
};
