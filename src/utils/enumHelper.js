export const senderTypeMap = {
  Member: "本人",
  Employee: "客服",
};

export function getSenderTypeText(senderType) {
  return senderTypeMap[senderType] || senderType;
}
