const chatbotService = require("./chatbotService");
const { getStudentByUserId } = require("../../models/studentContextModel");

function getUserId(req) {
  return req.user?.userId ?? req.user?.user_id ?? req.user?.id;
}

async function getStudent(req, res) {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const student = await getStudentByUserId(userId);
  if (!student) {
    res.status(404).json({ message: "Student profile not found" });
    return null;
  }

  return student;
}

async function getChat(req, res) {
  try {
    const student = await getStudent(req, res);
    if (!student) return;

    const payload = await chatbotService.getChatState(student, getUserId(req));
    res.json(payload);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function sendMessage(req, res) {
  try {
    const student = await getStudent(req, res);
    if (!student) return;

    const payload = await chatbotService.sendStudentMessage(
      student,
      getUserId(req),
      req.body?.message,
    );
    res.status(201).json(payload);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function clearChat(req, res) {
  try {
    const student = await getStudent(req, res);
    if (!student) return;

    const payload = await chatbotService.clearStudentChat(student);
    res.json(payload);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  getChat,
  sendMessage,
  clearChat,
};
