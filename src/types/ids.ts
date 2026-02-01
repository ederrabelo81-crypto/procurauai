type Brand<K, T> = K & { __brand: T };

export type BusinessId = Brand<string, "BusinessId">;
