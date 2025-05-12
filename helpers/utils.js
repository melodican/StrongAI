import moment from "moment";

export const generateRandomId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};
export function formatTime(date, format = "h:mm A") {
  if (!date) return "";
  return moment.utc(date).local().format(format);
}


export const groupConversations = (conversations) => {
  const today = moment();
  const yesterday = moment().subtract(1, "day");
  const sevenDaysAgo = moment().subtract(7, "days");
  const startOfThisMonth = moment().startOf("month");
  const startOfLastMonth = moment().subtract(1, "month").startOf("month");
  const endOfLastMonth = moment().subtract(1, "month").endOf("month");

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    lastMonth: [],
    earlier: [],
  };

  conversations.forEach((conv) => {
    const createdAt = moment(conv.created_at);

    if (createdAt.isSame(today, "day")) {
      groups.today.push(conv);
    } else if (createdAt.isSame(yesterday, "day")) {
      groups.yesterday.push(conv);
    } else if (createdAt.isAfter(sevenDaysAgo)) {
      groups.thisWeek.push(conv);
    } else if (createdAt.isBetween(startOfThisMonth, today, null, "[]")) {
      groups.thisMonth.push(conv);
    } else if (
      createdAt.isBetween(startOfLastMonth, endOfLastMonth, null, "[]")
    ) {
      groups.lastMonth.push(conv);
    } else {
      groups.earlier.push(conv);
    }
  });

  return groups;
};

export const truncateString = (string, length = 20) => {
  if (!string) return "";
  return string?.length > length ? string.slice(0, length) + "..." : string;
};
