// All credits to EternalFest for this one ❤️
// Almost copy pasted from https://gitlab.com/eternalfest/loader/-/blob/master/src/main/mt/serializer/SimpleSerializer.hx

// Used in Hammerfest and PioupiouZ

export class CodecV1_5 {
    /**
     * Serialization key (weak encryption)
     */
    private key: string

    /**
     * Current mask (on 32 bits)
     */
    private mask: number

    private byteShift: number = 0

    /**
     * Circular Redundancy Check
     */
    private crc: number = 0

    /**
     * Currently encoded string.
     */
    private encoded: string = ""

    constructor(key: string) {
        this.key = key
        this.mask = 0
        for (let i = 0; i < key.length; i++) {
            this.mask = (this.mask * 51 + key.charCodeAt(i)) & -1
        }
    }

    /**
     * Return the Circular Redundancy Check (CRC)
     */
    private getCrc(): string {
        var result: string = ""
        for (let i = 0; i < 5; i++) {
            result += CodecV1_5.charset.charAt((this.crc >> (6 * i)) & 63)
        }
        return result
    }

    public serialize(obj: any): string {
        this.byteShift = 0
        this.crc = 0
        this.encoded = ""
        this.write(obj)
        this.encoded += this.getCrc()
        return this.encoded
    }

    public deserialize(encoded: string): any | undefined {
        this.byteShift = 0
        this.crc = 0
        this.encoded = encoded
        var result: any = this.read()
        if (this.encoded != this.getCrc()) {
            return undefined
        }
        return result
    }

    private writeString(string: string) {
        for (let i = 0; i < string.length; i++) {
            this.writeCharacter(string.charAt(i))
        }
    }

    /**
     * Write a character to the encoded string.
     */
    private writeCharacter(character: string) {
        var plainValue = CodecV1_5.charset.indexOf(character, 0)
        if (plainValue < 0) {
            this.encoded += character
            return
        }

        var cipheredValue = plainValue ^ ((this.mask >> this.byteShift) & 63)
        this.crc = (this.crc * 51 + cipheredValue) ^ -1
        this.encoded += CodecV1_5.charset.charAt(cipheredValue)
        this.byteShift = (this.byteShift + 6) % 28
    }

    /**
     * Read the next character of the encoded string.
     * This shortens the encoded string (the character is consumed).
     */
    private readCharacter(): string {
        var character: string = this.encoded.charAt(0)
        this.encoded = this.encoded.substring(1, this.encoded.length)
        var cipheredValue = CodecV1_5.charset.indexOf(character, 0)
        if (cipheredValue < 0) {
            return character
        }
        this.crc = (this.crc * 51 + cipheredValue) ^ -1
        var plainValue = cipheredValue ^ ((this.mask >> this.byteShift) & 63)
        this.byteShift = (this.byteShift + 6) % 28
        return CodecV1_5.charset.charAt(plainValue)
    }

    private readString(): string {
        var result: string = ""
        while (true) {
            var nextCharacter = this.readCharacter()
            if (nextCharacter == null) {
                return "" // FIXME null ?
            } else if (nextCharacter == ":") {
                break
            } else {
                result += nextCharacter
            }
        }
        return result
    }

    private writeArray(array: Array<any>) {
        // TODO: Specify radix
        this.writeString(String(array.length))
        this.writeString(":")
        var nullCount: number = 0

        for (let i = 0; i < array.length; i++) {
            if (array[i] == null) {
                nullCount++
                continue
            }
            if (nullCount > 1) {
                // TODO: Specify radix
                this.writeString(CodecV1_5.controlChars.charAt(11) + String(nullCount) + ":")
                nullCount = 0
            } else if (nullCount == 1) {
                this.write(null)
                nullCount = 0
            }
            this.write(array[i])
        }
        if (nullCount > 0) {
            // TODO: Specify radix
            this.writeString(CodecV1_5.controlChars.charAt(11) + String(nullCount) + ":")
        }
    }

    private writeObject(object: any) {
        for (let key in object) {
            this.writeString(key)
            this.writeString(":")
            this.write(object[key])
        }
        this.writeString(":")
    }

    private write(value: any) {
        if (value == null) {
            this.writeString(CodecV1_5.controlChars.charAt(1))
        } else if (Array.isArray(value)) {
            this.writeString(CodecV1_5.controlChars.charAt(2))
            this.writeArray(value)
        } else if (typeof value === "string") {
            this.writeString(CodecV1_5.controlChars.charAt(3))
            this.writeString(value)
            this.writeString(":")
        } else if (typeof value === "number") {
            var floatValue: number = value
            if (Number.isNaN(floatValue)) {
                this.writeString(CodecV1_5.controlChars.charAt(4))
            } else if (floatValue == Number.POSITIVE_INFINITY) {
                this.writeString(CodecV1_5.controlChars.charAt(5))
            } else if (floatValue == Number.NEGATIVE_INFINITY) {
                this.writeString(CodecV1_5.controlChars.charAt(6))
            } else {
                var intValue: number = Math.trunc(floatValue)
                this.writeString(CodecV1_5.controlChars.charAt(7))
                if (intValue < 0) {
                    this.writeString(CodecV1_5.controlChars.charAt(1))
                }
                // TODO: Specify radix
                this.writeString(String(intValue < 0 ? -intValue : intValue))
                this.writeString(":")
            }
        } else if (typeof value === "boolean") {
            if (value) {
                this.writeString(CodecV1_5.controlChars.charAt(8))
            } else {
                this.writeString(CodecV1_5.controlChars.charAt(9))
            }
        } else {
            this.writeString(CodecV1_5.controlChars.charAt(10))
            this.writeObject(value)
        }
    }

    private readArray(): Array<any> {
        // TODO: specify radix
        var arrayLength = parseInt(this.readString())
        var result: Array<any> = []
        for (let i = 0; i < arrayLength; i++) {
            result.push(this.read())
        }
        return result
    }

    private readObject(): any {
        var result: any = {}
        while (true) {
            var key: string = this.readString()
            if (key == null) {
                return null
            }
            if (key == "") {
                break
            }
            var value = this.read()
            result[key] = value
        }
        return result
    }

    private read(): any {
        var controlChar = this.readCharacter()
        if (controlChar == CodecV1_5.controlChars.charAt(1)) {
            return null
        } else if (controlChar == CodecV1_5.controlChars.charAt(2)) {
            return this.readArray()
        } else if (controlChar == CodecV1_5.controlChars.charAt(3)) {
            return this.readString()
        } else if (controlChar == CodecV1_5.controlChars.charAt(4)) {
            return Number.NaN
        } else if (controlChar == CodecV1_5.controlChars.charAt(5)) {
            return Number.POSITIVE_INFINITY
        } else if (controlChar == CodecV1_5.controlChars.charAt(6)) {
            return Number.NEGATIVE_INFINITY
        } else if (controlChar == CodecV1_5.controlChars.charAt(7)) {
            var signChar: string = this.readCharacter()
            var number: string = this.readString()
            if (signChar == CodecV1_5.controlChars.charAt(1)) {
                // TODO: specify radix
                return -parseInt(number)
            } else {
                // The signChar was in fact the first digit
                // TODO: specify radix
                return parseInt(signChar + number)
            }
        } else if (controlChar == CodecV1_5.controlChars.charAt(8)) {
            return true
        } else if (controlChar == CodecV1_5.controlChars.charAt(9)) {
            return false
        } else if (controlChar == CodecV1_5.controlChars.charAt(10)) {
            return this.readObject()
        } else {
            return null
        }
    }

    public static controlChars: string = "$uasxIintfoj"
    public static charset: string = ":_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
}
