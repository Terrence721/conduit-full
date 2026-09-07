import type { ChangeEvent, Dispatch, SetStateAction } from "react";

function fieldHandler<T, K extends keyof T>(
  setForm: Dispatch<SetStateAction<T>>,
  field: K,
) {
  return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };
}

export default fieldHandler;
