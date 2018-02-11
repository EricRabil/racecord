export interface Store {
    initialize? (): Promise<void>;
    destructure? (): Promise<void>;
    [key: string]: any;
}
