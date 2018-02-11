declare module 'zlib-sync' {
    class Inflate {
       constructor(options: {chunkSize?: number, flush?: number, to?: string});
       push(data: any, flush?: any): any;
       result: any;
       msg?: string;
       err?: number;
       chunkSize: number;
       windowBits: number;
    }

    const Z_SYNC_FLUSH: number;
}