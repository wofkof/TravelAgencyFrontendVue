export const senderTypeMap = {
  Member: "本人",
  Employee: "客服",
};

export const callTypeMap = {
  audio: "語音",
  video: "視訊",
};

export const callStatusMap = {
  completed: "已完成",
  missed: "未接",
  rejected: "已拒絕",
};

export function getCallTypeText(type) {
  return callTypeMap[type] || type;
}

export function getCallStatusText(status) {
  return callStatusMap[status] || status;
}

export function getSenderTypeText(senderType) {
  return senderTypeMap[senderType] || senderType;
}
