import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const createChatThreadIfNotExists = async (caseId, clientId, mediatorId) => {
  const chatId = `case_${caseId}`;

  const chatDocRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatDocRef);

  if (!chatSnap.exists()) {
    await setDoc(chatDocRef, {
      caseId,
      participants: [clientId, mediatorId],
      createdAt: Date.now(),
      messages: [
        {
          senderId: "system",
          text: "Chat started. Case has been accepted.",
          timestamp: Date.now(),
          system: true,
        },
      ],
    });
  }
};
