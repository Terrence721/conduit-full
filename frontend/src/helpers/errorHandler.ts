function toast(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<string>("conduit:toast", { detail: message }),
  );
}

function errorHandler(error: unknown): void {
  // axios errors: surface the server-provided message when one exists.
  const axiosError = error as {
    isAxiosError?: boolean;
    response?: { status?: number; data?: { errors?: { body?: string[] } } };
  };

  if (axiosError?.isAxiosError) {
    if (!axiosError.response) {
      console.error(error);
      toast("Network error. Please try again.");
      return;
    }

    const status = axiosError.response.status ?? 0;
    const message = axiosError.response.data?.errors?.body?.[0];

    if ([401, 403, 404, 422, 500].includes(status) && message) {
      toast(message);
      throw message;
    }

    toast("Something went wrong. Please try again.");
    console.dir(error);
    return;
  }

  if (error instanceof Error) {
    console.error(error);
    toast(error.message);
  }
}

export default errorHandler;
