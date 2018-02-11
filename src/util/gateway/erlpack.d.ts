declare module 'erlpack' {
    const pack: (data: any) => Buffer;
    const unpack: (data: Buffer, size?: number, skipVersion?: boolean) => any;
}
