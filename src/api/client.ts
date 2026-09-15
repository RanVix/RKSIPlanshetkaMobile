const BASE_URL = "https://planshetka.yarovich.ru/api/v2";

interface ApiErrorResponse {
  detail?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const method = options?.method || "GET";

  console.log(`[API Request] ${method} -> ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse = {};
      try {
        errorData = await response.json();
      } catch {
        console.error(
          `[API Error] ${method} ${endpoint} | Failed to parse error response as JSON.`,
        );
      }

      const errorMessage =
        errorData.detail || `Ошибка сервера: Status ${response.status}`;

      console.error(
        `[API Error] ${method} ${endpoint} | Code: ${response.status} | Detail:`,
        errorMessage,
      );

      throw new ApiError(response.status, errorMessage, errorData.detail);
    }

    const data: T = await response.json();
    console.log(
      `[API Success] ${method} ${endpoint} | Items count:`,
      Array.isArray(data) ? data.length : 1,
    );
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`[API Network Error] ${method} ${endpoint}:`, error);
    throw new Error(
      "Не удалось соединиться с сервером. Проверьте подключение к интернету.",
    );
  }
}
