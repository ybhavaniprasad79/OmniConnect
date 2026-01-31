const DeliveryLog = require("../models/DeliveryLog");

// Mock providers - in real world replace these with SDK/API calls
const sendWhatsApp = async (member, message) => {
  // simulate success most of the time
  const success = Math.random() < 0.8;
  return { success, provider: "whatsapp", info: success ? "sent" : "failed" };
};

const sendSMS = async (member, message) => {
  const success = Math.random() < 0.9;
  return { success, provider: "sms", info: success ? "sent" : "failed" };
};

const sendEmail = async (member, message) => {
  const success = Math.random() < 0.95;
  return { success, provider: "email", info: success ? "sent" : "failed" };
};

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

const attemptSendWithFallback = async (announcement, member) => {
  const message = `${announcement.title}\n\n${announcement.message}`;

  // 1. WhatsApp
  let res = await sendWhatsApp(member, message);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "whatsapp",
    success: res.success,
    response: res,
  });
  if (res.success) return { channel: "whatsapp", success: true, response: res };

  // 2. SMS
  res = await sendSMS(member, message);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "sms",
    success: res.success,
    response: res,
  });
  if (res.success) return { channel: "sms", success: true, response: res };

  // 3. Email
  res = await sendEmail(member, message);
  await logDelivery({
    announcement: announcement._id,
    member: member._id,
    channel: "email",
    success: res.success,
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
