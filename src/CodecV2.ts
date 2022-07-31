// Used in many "recent" games like Muxxu and Twinoid games

export class CodecV2 {
    private static BASE64_CHARS: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"

    // Found in SWF Games
    // Many other games have just a empty string as `version`
    public static readonly SNAKE_KEY_VERSION: string = "0"
    public static readonly FEVER_KEY_VERSION: string = "1"
    public static readonly KUBE_KEY_VERSION: string = "77e352"

    private readonly permutations: Uint8Array // 256
    private readonly key: string
    private readonly keyPrefix: string

    get fullKey(): string {
        return this.keyPrefix + this.key
    }

    public constructor(key: string, keyVersion: string = "") {
        this.keyPrefix = keyVersion
        this.key = key

        this.permutations = this.computePermutation()
    }

    private computePermutation(): Uint8Array {
        let perm = new Uint8Array(256)
        for (let i = 0; i < 256; i++) perm[i] = i & 0x7f

        let j = 0
        for (let i = 0; i < 256; i++) {
            j += perm[i] + this.fullKey.charCodeAt(i % this.fullKey.length)
            j &= 0x7f
            ;[perm[i], perm[j]] = [perm[j], perm[i]]
        }
        return perm
    }

    private static encodeCrc(crc: number) {
        return String.fromCharCode(
            CodecV2.BASE64_CHARS.charCodeAt(crc & 63),
            CodecV2.BASE64_CHARS.charCodeAt((crc >> 6) & 63),
            CodecV2.BASE64_CHARS.charCodeAt((crc >> 12) & 63),
            CodecV2.BASE64_CHARS.charCodeAt((crc >> 18) & 63)
        )
    }

    public encode(buffer: string) {
        let crc1 = this.permutations[0]
        let crc2 = this.permutations[1]

        let stringBuilder = ""

        for (let i = 0; i < buffer.length; i++) {
            const b = buffer.charCodeAt(i)
            let test = b ^ this.permutations[i & 255]
            stringBuilder += String.fromCharCode(test == 0 ? b : test)
            crc1 = (crc1 + test) % 65521
            crc2 = (crc2 + crc1) % 65521
        }
        let crc = crc1 ^ (crc2 << 8)

        return stringBuilder + CodecV2.encodeCrc(crc)
    }

    public decode(buffer: string) {
        let crcCheck = buffer.slice(-4)
        buffer = buffer.slice(0, -4)

        let crc1 = this.permutations[0]
        let crc2 = this.permutations[1]

        let stringBuilder = ""

        for (let i = 0; i < buffer.length; i++) {
            const b = buffer.charCodeAt(i)
            let test = b ^ this.permutations[i & 255]
            let crcSave = test == 0 ? 0 : b
            stringBuilder += String.fromCharCode(test == 0 ? b : test)

            crc1 = (crc1 + crcSave) % 65521
            crc2 = (crc2 + crc1) % 65521
        }
        let crc = crc1 ^ (crc2 << 8)

        if (CodecV2.encodeCrc(crc) != crcCheck) throw new Error(`FCHK (${CodecV2.encodeCrc(crc)} != ${crcCheck})`)

        return stringBuilder
    }
}
