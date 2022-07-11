export declare class CodecV2 {
    private static BASE64_CHARS;
    static readonly SNAKE_KEY_VERSION: string;
    static readonly FEVER_KEY_VERSION: string;
    static readonly KUBE_KEY_VERSION: string;
    private readonly permutations;
    private readonly key;
    private readonly keyPrefix;
    get fullKey(): string;
    constructor(key: string, keyVersion?: string);
    private computePermutation;
    private static encodeCrc;
    encode(buffer: string): string;
    decode(buffer: string): string;
}
