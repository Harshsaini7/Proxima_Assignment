import { toast } from 'react-toastify';

export const notify = {
  success: (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  },

  error: (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  },

  info: (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  },

  warning: (message) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }
};

// Mock email notification
export const sendEmailNotification = (to, subject, message) => {
  console.log('=== EMAIL NOTIFICATION ===');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  console.log('========================');

  notify.info(`Email notification sent to ${to}`);

  return {
    success: true,
    message: 'Email notification sent (mock)'
  };
};

// Mock SMS notification
export const sendSMSNotification = (to, message) => {
  console.log('=== SMS NOTIFICATION ===');
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log('========================');

  notify.info(`SMS notification sent to ${to}`);

  return {
    success: true,
    message: 'SMS notification sent (mock)'
  };
};
