import axios, { type AxiosRequestConfig } from "axios";
import errorHandler from "./errorHandler";

async function apiRequest<T>(
  config: AxiosRequestConfig,
): Promise<T | undefined> {
  try {
    const { data } = await axios<T>(config);
    return data;
  } catch (error) {
    errorHandler(error);
  }
}

export default apiRequest;
