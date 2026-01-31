const DeliveryLog = require("../models/DeliveryLog");
const nodemailer = require("nodemailer");

// Optional Twilio client (only used if env vars provided)
let twilioClient = null;
try {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    const twilio = require("twilio");
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
} catch (err) {
  console.warn("Twilio not available:", err.message);
}

// create nodemailer transporter only if SMTP env present
let mailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Helper: write delivery log
const logDelivery = async ({
  announcement,
  member,
  channel,
  success,
  response,
}) => {
  try {
    // Helper to strip functions/circular refs
    const safePlain = (obj) => {
      if (!obj || typeof obj !== "object") return obj;
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (e) {
        return { error: "unserializable_response", message: e.message };
      }
    };

    // Sanitize response to avoid BSON circular structure errors
    let sanitizedResponse = response;
    if (response && response.sid) {
      // Extract only safe fields from Twilio-style response wrappers
      sanitizedResponse = {
        success: response.success || false,
        provider: response.provider,
        sid: response.sid,
        status: response.status,
        info: response.info
          ? {
              sid: response.info.sid,
              status: response.info.status,
              errorCode: response.info.errorCode,
              errorMessage: response.info.errorMessage,
              to: response.info.to,
              from: response.info.from,
            }
          : null,
      };
    } else if (response && typeof response === "object") {
      // Generic objects (e.g. { note, detail: polled })
      sanitizedResponse = safePlain(response);
    }
    await DeliveryLog.create({
      announcement,
      member,
      channel,
      success,
      response: sanitizedResponse,
    });
  } catch (err) {
    console.error("Failed to write delivery log", err);
  }
};

// Real WhatsApp via Twilio (if configured)
const realSendWhatsApp = async (member, message) => {
  if (!twilioClient)
    return {
      success: false,
      provider: "whatsapp",
      info: "twilio_not_configured",
    };
  try {
    const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+123...'
    // Normalize WhatsApp number: ensure it has country code
    let num = String(member.whatsappNumber || "").replace(/[^\d+]/g, "");
    if (!num.startsWith("+")) {
      if (num.length === 10) {
        num = "+91" + num; // India default for 10-digit numbers
      } else if (num.length > 10) {
        num = "+" + num;
      } else {
        num = "+91" + num;
      }
    }
    const to = num ? `whatsapp:${num}` : null;
    if (!from || !to)
      return {
        success: false,
        provider: "whatsapp",
        info: "missing_from_or_to",
      };
    const sent = await twilioClient.messages.create({
      from,
      to,
      body: message,
    });
    return {
      success: true,
      provider: "whatsapp",
      sid: sent.sid,
      status: sent.status,
      info: sent,
    };
  } catch (err) {
    return { success: false, provider: "whatsapp", info: err.message || err };
  }
};

// Real SMS via Twilio (if configured)
const realSendSMS = async (member, message) => {
  if (!twilioClient)
    return { success: false, provider: "sms", info: "twilio_not_configured" };
  try {
    const from =
      process.env.TWILIO_SMS_FROM || process.env.TWILIO_WHATSAPP_FROM;
    // Use phoneNumber for SMS, or fallback to whatsappNumber
    const phoneToUse = member.phoneNumber || member.whatsappNumber;
    let to = null;
    if (phoneToUse) {
      // Normalize: ensure it starts with + and country code
      let num = String(phoneToUse).replace(/[^\d+]/g, "");
      // If it doesn't start with +, prepend +91 (India default)
      if (!num.startsWith("+")) {
        if (num.length === 10) {
          // Assume India for 10-digit numbers
          num = "+91" + num;
        } else if (num.length > 10) {
          num = "+" + num;
        } else {
          num = "+91" + num;
        }
      }
      to = num;
    }
    if (!from || !to)
      return { success: false, provider: "sms", info: "missing_from_or_to" };
    console.log(`[SMS] Sending from ${from} to ${to}`);
    const sent = await twilioClient.messages.create({
      from,
      to,
      body: message,
    });
    return {
      success: true,
      provider: "sms",
      sid: sent.sid,
      status: sent.status,
      info: sent,
    };
  } catch (err) {
    return { success: false, provider: "sms", info: err.message || err };
  }
};

// Real email via SMTP (nodemailer)
const realSendEmail = async (member, message) => {
  if (!mailTransporter)
    return { success: false, provider: "email", info: "smtp_not_configured" };
  try {
    const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
    const to = member.email;
    if (!to)
      return { success: false, provider: "email", info: "missing_recipient" };
    const info = await mailTransporter.sendMail({
      from: mailFrom,
      to,
      subject: "Announcement",
      text: message,
    });
    return { success: true, provider: "email", info };
  } catch (err) {
    return { success: false, provider: "email", info: err.message || err };
  }
};

// Legacy mocks (fallback when real providers not configured)
const mockSend = async (member, message, provider, successProbability) => {
  const success = Math.random() < successProbability;
  return { success, provider, info: success ? "sent_mock" : "failed_mock" };
};

// public wrappers used below: will choose real provider if configured otherwise mock
const sendWhatsApp = async (member, message) => {
  if (twilioClient) return realSendWhatsApp(member, message);
  return mockSend(member, message, "whatsapp", 0.8);
};

const sendSMS = async (member, message) => {
  if (twilioClient) return realSendSMS(member, message);
  return mockSend(member, message, "sms", 0.9);
};

const sendEmail = async (member, message) => {
  if (mailTransporter) return realSendEmail(member, message);
  return mockSend(member, message, "email", 0.95);
};

// (logDelivery helper defined above)

const pollTwilioMessageStatus = async (
  sid,
  timeoutMs = 120000,
  intervalMs = 15000,
) => {
  if (!twilioClient) return null;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const msg = await twilioClient.messages(sid).fetch();
      const status = msg.status; // queued, sending, sent, delivered, failed, undelivered
      if (status === "delivered" || status === "read")
        return { final: true, status, info: msg };
      if (status === "failed" || status === "undelivered")
        return { final: true, status, info: msg };
      // otherwise still pending, wait and poll
    } catch (err) {
      return { final: false, status: "error", info: err.message || err };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { final: false, status: "timeout", info: null };
};

const attemptSendWithFallback = async (announcement, member) => {
  const message = `${announcement.title}\n\n${announcement.message}`;
  console.log(
    `[Dispatch] Attempting send to ${member.name} (${member.whatsappNumber})`,
  );

  // 1. WhatsApp - send then wait for delivery for configured time
  console.log(`[WhatsApp] Attempting send to ${member.whatsappNumber}`);
  let res = await sendWhatsApp(member, message);
  console.log(`[WhatsApp] Response:`, res);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "whatsapp",
    success: !!res.success,
    response: res,
  });

  // If Twilio was used and returned sid, poll for final delivery status
  if (twilioClient && res && res.sid) {
    console.log(`[WhatsApp] Polling SID ${res.sid} for delivery status`);
    const waitMs = parseInt(process.env.WAIT_WHATSAPP_MS || "120000", 10); // default 2 minutes
    const pollInterval = parseInt(
      process.env.WHATSAPP_POLL_INTERVAL_MS || "15000",
      10,
    );
    const polled = await pollTwilioMessageStatus(res.sid, waitMs, pollInterval);
    console.log(`[WhatsApp] Poll result:`, polled);
    if (
      polled &&
      polled.final &&
      (polled.status === "delivered" || polled.status === "read")
    ) {
      console.log(
        `[WhatsApp] ✓ Delivered successfully (will still send SMS backup)`,
      );
      await logDelivery({
        announcement: announcement._id,
        member: member._id,
        channel: "whatsapp",
        success: true,
        response: polled.info,
      });
    } else {
      console.log(
        `[WhatsApp] ✗ Not delivered within window, falling back to SMS`,
      );
      await logDelivery({
        announcement: announcement._id,
        member: member._id,
        channel: "whatsapp",
        success: false,
        response: { note: "not_delivered_within_window", detail: polled },
      });
    }
  } else if (res && res.success) {
    // for mocks or non-twilio positive response, treat as success
    console.log(`[WhatsApp] ✓ Mock success`);
    return { channel: "whatsapp", success: true, response: res };
  } else {
    console.log(`[WhatsApp] ✗ Failed, falling back to SMS`);
  }

  // 2. SMS
  console.log(`[SMS] Attempting send to ${member.whatsappNumber}`);
  res = await sendSMS(member, message);
  console.log(`[SMS] Response:`, res);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "sms",
    success: !!res.success,
    response: res,
  });

  if (res && res.success && (!res.sid || !twilioClient)) {
    console.log(`[SMS] ✓ Success`);
    return { channel: "sms", success: true, response: res };
  }

  // If Twilio was used for SMS and returned sid, check delivery
  if (res && res.sid && twilioClient) {
    console.log(`[SMS] Checking delivery status for SID ${res.sid}`);
    try {
      const fetched = await twilioClient.messages(res.sid).fetch();
      console.log(
        `[SMS] Status: ${fetched.status}, to: ${fetched.to}, errorCode: ${fetched.errorCode}, errorMessage: ${fetched.errorMessage}`,
      );
      if (fetched.status === "delivered" || fetched.status === "sent") {
        console.log(`[SMS] ✓ Delivered/sent`);
        await logDelivery({
          announcement: announcement._id,
          member: member._id,
          channel: "sms",
          success: true,
          response: fetched,
        });
        return { channel: "sms", success: true, response: fetched };
      }
      console.log("[SMS] ✗ Not delivered, falling back to email");
    } catch (err) {
      console.log(`[SMS] Error checking status:`, err.message);
      // ignore and fall through to email
    }
  }

  // 3. Email
  console.log(`[Email] Attempting send to ${member.email}`);
  res = await sendEmail(member, message);
  console.log(`[Email] Response:`, res);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "email",
    success: !!res.success,
    response: res,
  });
  console.log(
    `[Email] ✓ Email fallback used (success=${res.success || false})`,
  );
  return { channel: "email", success: res.success, response: res };
};

const dispatchAnnouncement = async (announcement, members) => {
  if (!members || members.length === 0) {
    console.warn("No members to notify for announcement", announcement._id);
    return;
  }

  // dispatch in parallel with concurrency limits in real world
  await Promise.all(
    members.map((m) => attemptSendWithFallback(announcement, m)),
  );
};

module.exports = { dispatchAnnouncement, attemptSendWithFallback };
