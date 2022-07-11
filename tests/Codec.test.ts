import { CodecV1, CodecV2 } from "../src"

function encodeAndDecodeV2(codec: CodecV2, value: string) {
    return codec.decode(codec.encode(value))
}

describe("Codec V2", () => {
    test("Without version", () => {
        let codec = new CodecV2("superkey")
        expect(encodeAndDecodeV2(codec, "mysupertext")).toBe("mysupertext")
    })
    test("With version", () => {
        let codec = new CodecV2("superkey", CodecV2.KUBE_KEY_VERSION)
        expect(encodeAndDecodeV2(codec, "mysupertext")).toBe("mysupertext")
    })
})

describe("Codec V1", () => {
    test("Test run 2 times", () => {
        let codec = new CodecV1("superkey")
        expect(codec.run(codec.run("mysupertext"))).toBe("mysupertext")
    })
})
