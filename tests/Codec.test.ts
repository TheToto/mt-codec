import { CodecV1, CodecV1_5, CodecV2 } from "../src"

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

describe("Codec V1.5", () => {
    test("PioupiouZ string", () => {
        let codec = new CodecV1_5("$RJrjk05eeJrzp5Pazre7z9an788baz61kBKJ1EZ4")
        expect(codec.deserialize("xNOpZUjm:_wKLIAOTqZhMxyRY4bCkElD5hR")).toBe("httpXX__wwwYYpioupiouzYYcom_")
        console.log(codec.deserialize("xNOpZUjm:AeNLIAOTqZhMxyRY4bCkE_MMUj"))
        console.log(codec.deserialize("xNOpZUjm:_wKLIAOTqZhMxyRY4bCkElD5hR"))
        console.log(codec.deserialize("xNOpZUjm:AaPpI3VZsWqWDvaYiv:bF95c3qB"))
        console.log(codec.deserialize("xNOpZUjm:_wKLIAOTqZhMxyRY4bCkElD5hR"))
        console.log(codec.serialize(""))
    })

    test("Run serialize/deserialize", () => {
        let codec = new CodecV1_5("mysuperkey")
        expect(codec.deserialize(codec.serialize("mysupertext"))).toBe("mysupertext")
    })
})

describe("Codec V1", () => {
    test("Test run 2 times", () => {
        let codec = new CodecV1("superkey")
        expect(codec.run(codec.run("mysupertext"))).toBe("mysupertext")
    })
})
