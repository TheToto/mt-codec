// Thanks to @Angelisium for this one ❤️
// https://gitlab.com/-/snippets/2310955

export class CodecV1 {
    private key: number[]

    constructor(sid: string) {
        this.key = []
        for (let i = 0; i < sid.length; i++) {
            let k = sid.charCodeAt(i)

            if (k >= 48 && k <= 57) {
                k = k - 48 + 52
            } else if (k >= 65 && k <= 90) {
                k = k - 65
            } else if (k >= 97 && k <= 122) {
                k = k - 97 + 26
            } else {
                continue
            }

            this.key.push(k)
        }
    }

    public run(input: string) {
        let buffer = "",
            key = this.key
        for (let i = 0; i < input.length; i++) {
            let v1 = input.charCodeAt(i),
                v2 = key[(i + input.length) % key.length],
                v3 = v1 ^ v2
            if (v3 == 0) {
                let v4 = input.charCodeAt(i)
                buffer += String.fromCharCode(v4)
            } else {
                buffer += String.fromCharCode(v3)
            }
        }
        return buffer
    }
}
