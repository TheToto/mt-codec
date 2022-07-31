export declare class CodecV1_5 {
    private key;
    private mask;
    private byteShift;
    private crc;
    private encoded;
    constructor(key: string);
    private getCrc;
    serialize(obj: any): string;
    deserialize(encoded: string): any | undefined;
    private writeString;
    private writeCharacter;
    private readCharacter;
    private readString;
    private writeArray;
    private writeObject;
    private write;
    private readArray;
    private readObject;
    private read;
    static controlChars: string;
    static charset: string;
}
