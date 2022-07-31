"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodecV1_5 = void 0;
var CodecV1_5 = (function () {
    function CodecV1_5(key) {
        this.byteShift = 0;
        this.crc = 0;
        this.encoded = "";
        this.key = key;
        this.mask = 0;
        for (var i = 0; i < key.length; i++) {
            this.mask = (this.mask * 51 + key.charCodeAt(i)) & -1;
        }
    }
    CodecV1_5.prototype.getCrc = function () {
        var result = "";
        for (var i = 0; i < 5; i++) {
            result += CodecV1_5.charset.charAt((this.crc >> (6 * i)) & 63);
        }
        return result;
    };
    CodecV1_5.prototype.serialize = function (obj) {
        this.byteShift = 0;
        this.crc = 0;
        this.encoded = "";
        this.write(obj);
        this.encoded += this.getCrc();
        return this.encoded;
    };
    CodecV1_5.prototype.deserialize = function (encoded) {
        this.byteShift = 0;
        this.crc = 0;
        this.encoded = encoded;
        var result = this.read();
        if (this.encoded != this.getCrc()) {
            return undefined;
        }
        return result;
    };
    CodecV1_5.prototype.writeString = function (string) {
        for (var i = 0; i < string.length; i++) {
            this.writeCharacter(string.charAt(i));
        }
    };
    CodecV1_5.prototype.writeCharacter = function (character) {
        var plainValue = CodecV1_5.charset.indexOf(character, 0);
        if (plainValue < 0) {
            this.encoded += character;
            return;
        }
        var cipheredValue = plainValue ^ ((this.mask >> this.byteShift) & 63);
        this.crc = (this.crc * 51 + cipheredValue) ^ -1;
        this.encoded += CodecV1_5.charset.charAt(cipheredValue);
        this.byteShift = (this.byteShift + 6) % 28;
    };
    CodecV1_5.prototype.readCharacter = function () {
        var character = this.encoded.charAt(0);
        this.encoded = this.encoded.substring(1, this.encoded.length);
        var cipheredValue = CodecV1_5.charset.indexOf(character, 0);
        if (cipheredValue < 0) {
            return character;
        }
        this.crc = (this.crc * 51 + cipheredValue) ^ -1;
        var plainValue = cipheredValue ^ ((this.mask >> this.byteShift) & 63);
        this.byteShift = (this.byteShift + 6) % 28;
        return CodecV1_5.charset.charAt(plainValue);
    };
    CodecV1_5.prototype.readString = function () {
        var result = "";
        while (true) {
            var nextCharacter = this.readCharacter();
            if (nextCharacter == null) {
                return "";
            }
            else if (nextCharacter == ":") {
                break;
            }
            else {
                result += nextCharacter;
            }
        }
        return result;
    };
    CodecV1_5.prototype.writeArray = function (array) {
        this.writeString(String(array.length));
        this.writeString(":");
        var nullCount = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i] == null) {
                nullCount++;
                continue;
            }
            if (nullCount > 1) {
                this.writeString(CodecV1_5.controlChars.charAt(11) + String(nullCount) + ":");
                nullCount = 0;
            }
            else if (nullCount == 1) {
                this.write(null);
                nullCount = 0;
            }
            this.write(array[i]);
        }
        if (nullCount > 0) {
            this.writeString(CodecV1_5.controlChars.charAt(11) + String(nullCount) + ":");
        }
    };
    CodecV1_5.prototype.writeObject = function (object) {
        for (var key in object) {
            this.writeString(key);
            this.writeString(":");
            this.write(object[key]);
        }
        this.writeString(":");
    };
    CodecV1_5.prototype.write = function (value) {
        if (value == null) {
            this.writeString(CodecV1_5.controlChars.charAt(1));
        }
        else if (Array.isArray(value)) {
            this.writeString(CodecV1_5.controlChars.charAt(2));
            this.writeArray(value);
        }
        else if (typeof value === "string") {
            this.writeString(CodecV1_5.controlChars.charAt(3));
            this.writeString(value);
            this.writeString(":");
        }
        else if (typeof value === "number") {
            var floatValue = value;
            if (Number.isNaN(floatValue)) {
                this.writeString(CodecV1_5.controlChars.charAt(4));
            }
            else if (floatValue == Number.POSITIVE_INFINITY) {
                this.writeString(CodecV1_5.controlChars.charAt(5));
            }
            else if (floatValue == Number.NEGATIVE_INFINITY) {
                this.writeString(CodecV1_5.controlChars.charAt(6));
            }
            else {
                var intValue = Math.trunc(floatValue);
                this.writeString(CodecV1_5.controlChars.charAt(7));
                if (intValue < 0) {
                    this.writeString(CodecV1_5.controlChars.charAt(1));
                }
                this.writeString(String(intValue < 0 ? -intValue : intValue));
                this.writeString(":");
            }
        }
        else if (typeof value === "boolean") {
            if (value) {
                this.writeString(CodecV1_5.controlChars.charAt(8));
            }
            else {
                this.writeString(CodecV1_5.controlChars.charAt(9));
            }
        }
        else {
            this.writeString(CodecV1_5.controlChars.charAt(10));
            this.writeObject(value);
        }
    };
    CodecV1_5.prototype.readArray = function () {
        var arrayLength = parseInt(this.readString());
        var result = [];
        for (var i = 0; i < arrayLength; i++) {
            result.push(this.read());
        }
        return result;
    };
    CodecV1_5.prototype.readObject = function () {
        var result = {};
        while (true) {
            var key = this.readString();
            if (key == null) {
                return null;
            }
            if (key == "") {
                break;
            }
            var value = this.read();
            result[key] = value;
        }
        return result;
    };
    CodecV1_5.prototype.read = function () {
        var controlChar = this.readCharacter();
        if (controlChar == CodecV1_5.controlChars.charAt(1)) {
            return null;
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(2)) {
            return this.readArray();
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(3)) {
            return this.readString();
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(4)) {
            return Number.NaN;
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(5)) {
            return Number.POSITIVE_INFINITY;
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(6)) {
            return Number.NEGATIVE_INFINITY;
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(7)) {
            var signChar = this.readCharacter();
            var number = this.readString();
            if (signChar == CodecV1_5.controlChars.charAt(1)) {
                return -parseInt(number);
            }
            else {
                return parseInt(signChar + number);
            }
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(8)) {
            return true;
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(9)) {
            return false;
        }
        else if (controlChar == CodecV1_5.controlChars.charAt(10)) {
            return this.readObject();
        }
        else {
            return null;
        }
    };
    CodecV1_5.controlChars = "$uasxIintfoj";
    CodecV1_5.charset = ":_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return CodecV1_5;
}());
exports.CodecV1_5 = CodecV1_5;
//# sourceMappingURL=CodecV1_5.js.map