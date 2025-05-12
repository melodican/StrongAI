import { toast } from "react-toastify";
export const successType = "success";

export const toastMessages = (msg, type) => {
  if (type === successType) {
    toast.dismiss();
    toast.success(msg);
  } else {
    toast.dismiss();
    toast.error(msg);
  }
};
