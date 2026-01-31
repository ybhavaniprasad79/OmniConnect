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
    await DeliveryLog.create({
      announcement,
      member,
      channel,
      success,
      response,
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
    const to = member.whatsappNumber
      ? `whatsapp:${member.whatsappNumber}`
      : null;
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
    const to = member.whatsappNumber
      ? `+${member.whatsappNumber}`.replace(/^\+?\+/, "+")
      : null;
    if (!from || !to)
      return { success: false, provider: "sms", info: "missing_from_or_to" };
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

  // 1. WhatsApp - send then wait for delivery for configured time
  let res = await sendWhatsApp(member, message);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "whatsapp",
    success: !!res.success,
    response: res,
  });

  // If Twilio was used and returned sid, poll for final delivery status
  if (twilioClient && res && res.sid) {
    const waitMs = parseInt(process.env.WAIT_WHATSAPP_MS || "120000", 10); // default 2 minutes
    const pollInterval = parseInt(
      process.env.WHATSAPP_POLL_INTERVAL_MS || "15000",
      10,
    );
    const polled = await pollTwilioMessageStatus(res.sid, waitMs, pollInterval);
    if (
      polled &&
      polled.final &&
      (polled.status === "delivered" || polled.status === "read")
    ) {
      await logDelivery({
        announcement: announcement._id,
        member: member._id,
        channel: "whatsapp",
        success: true,
        response: polled.info,
      });
      return { channel: "whatsapp", success: true, response: polled.info };
    }
    // not delivered within wait window -> proceed to SMS
    await logDelivery({
      announcement: announcement._id,
      member: member._id,
      channel: "whatsapp",
      success: false,
      response: { note: "not_delivered_within_window", detail: polled },
    });
  } else if (res && res.success) {
    // for mocks or non-twilio positive response, treat as success
    return { channel: "whatsapp", success: true, response: res };
  }

  // 2. SMS
  res = await sendSMS(member, message);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "sms",
    success: !!res.success,
    response: res,
  });
  if (res.success && (!res.sid || !twilioClient))
    return { channel: "sms", success: true, response: res };

  // If Twilio was used for SMS and returned sid, we could poll similarly, but for now use immediate result
  if (res && res.sid && twilioClient) {
    try {
      const fetched = await twilioClient.messages(res.sid).fetch();
      if (fetched.status === "delivered") {
        await logDelivery({
          announcement: announcement._id,
          member: member._id,
          channel: "sms",
          success: true,
          response: fetched,
        });
        return { channel: "sms", success: true, response: fetched };
      }
    } catch (err) {
      // ignore and fall through to email
    }
  }

  // 3. Email
  res = await sendEmail(member, message);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "email",
    success: !!res.success,
    response: res,
  });
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
