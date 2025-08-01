// Utility to control alert visibility
let alertsEnabled = true;

export const setAlertsEnabled = (enabled: boolean) => {
  alertsEnabled = enabled;
};

export const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (alertsEnabled) {
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons);
  }
};

export const isAlertsEnabled = () => alertsEnabled; 