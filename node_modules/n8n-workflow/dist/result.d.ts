export type ResultOk<T> = {
    ok: true;
    result: T;
};
export type ResultError<E> = {
    ok: false;
    error: E;
};
export type Result<T, E> = ResultOk<T> | ResultError<E>;
export declare const createResultOk: <T>(data: T) => ResultOk<T>;
export declare const createResultError: <E = unknown>(error: E) => ResultError<E>;
export declare const toResult: <T, E extends Error = Error>(fn: () => T) => Result<T, E>;
