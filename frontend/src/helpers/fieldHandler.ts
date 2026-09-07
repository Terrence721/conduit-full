import type { ChangeEvent, Dispatch, SetStateAction } from "react";

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

function fieldHandler<T>(setForm: Dispatch<SetStateAction<T>>) {
  return (field: StringKeys<T>) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };
}

export default fieldHandler;
