import axios from "axios";

/**
 * Sends an OTP SMS to an Indian mobile number using Fast2SMS's OTP route.
 *
 * Fast2SMS "otp" route docs: https://docs.fast2sms.com/reference/send-otp
 * Message delivered to the user looks like: "Your OTP: 123456"
 *
 * Requires FAST2SMS_API_KEY to be set in .env
 */
export async function sendOtpSms(mobile, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    // Fail loudly in logs but don't crash the request — caller decides what to do.
    console.error("FAST2SMS_API_KEY is not set in environment variables.");
    throw new Error("SMS service is not configured");
  }

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        variables_values: otp,
        route: "otp",
        numbers: mobile
      },
      {
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    // Fast2SMS returns { return: true/false, request_id, message: [...] }
    if (!response.data || response.data.return !== true) {
      console.error("Fast2SMS rejected the request:", response.data);
      throw new Error("SMS provider failed to send OTP");
    }

    return response.data;
  } catch (error) {
    // Log full provider error for debugging, but throw a generic error upward
    if (error.response) {
      console.error("Fast2SMS API error:", error.response.status, error.response.data);
    } else {
      console.error("Fast2SMS request failed:", error.message);
    }
    throw new Error("Failed to send OTP SMS");
  }
}
