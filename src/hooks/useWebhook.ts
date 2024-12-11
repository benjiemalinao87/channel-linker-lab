export const useWebhook = () => {
  const sendRegistrationWebhook = async (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      console.log("Sending webhook for user registration:", userData);
      const response = await fetch("https://hkdk.events/8ti3hp2rjf7i3r", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      console.log("Webhook response:", response.status);
      return response.ok;
    } catch (error) {
      console.error("Webhook error:", error);
      return false;
    }
  };

  return { sendRegistrationWebhook };
};