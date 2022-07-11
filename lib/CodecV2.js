"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodecV2 = void 0;
var CodecV2 = (function () {
    function CodecV2(key, keyVersion) {
        if (keyVersion === void 0) { keyVersion = ""; }
        this.keyPrefix = keyVersion;
        this.key = key;
        this.permutations = this.computePermutation();
    }
    Object.defineProperty(CodecV2.prototype, "fullKey", {
        get: function () {
            return this.keyPrefix + this.key;
        },
        enumerable: false,
        configurable: true
    });
    CodecV2.prototype.computePermutation = function () {
        var _a;
        var perm = new Uint8Array(256);
        for (var i = 0; i < 256; i++)
            perm[i] = i & 0x7f;
        var j = 0;
        for (var i = 0; i < 256; i++) {
            j += perm[i] + this.fullKey.charCodeAt(i % this.fullKey.length);
            j &= 0x7f;
            _a = [perm[j], perm[i]], perm[i] = _a[0], perm[j] = _a[1];
        }
        return perm;
    };
    CodecV2.encodeCrc = function (crc) {
        return String.fromCharCode(CodecV2.BASE64_CHARS.charCodeAt(crc & 63), CodecV2.BASE64_CHARS.charCodeAt((crc >> 6) & 63), CodecV2.BASE64_CHARS.charCodeAt((crc >> 12) & 63), CodecV2.BASE64_CHARS.charCodeAt((crc >> 18) & 63));
    };
    CodecV2.prototype.encode = function (buffer) {
        var crc1 = this.permutations[0];
        var crc2 = this.permutations[1];
        var stringBuilder = "";
        for (var i = 0; i < buffer.length; i++) {
            var b = buffer.charCodeAt(i);
            var test_1 = b ^ this.permutations[i & 255];
            stringBuilder += String.fromCharCode(test_1 == 0 ? b : test_1);
            crc1 = (crc1 + test_1) % 65521;
            crc2 = (crc2 + crc1) % 65521;
        }
        var crc = crc1 ^ (crc2 << 8);
        return stringBuilder + CodecV2.encodeCrc(crc);
    };
    CodecV2.prototype.decode = function (buffer) {
        var crcCheck = buffer.slice(-4);
        buffer = buffer.slice(0, -4);
        var crc1 = this.permutations[0];
        var crc2 = this.permutations[1];
        var stringBuilder = "";
        for (var i = 0; i < buffer.length; i++) {
            var b = buffer.charCodeAt(i);
            var test_2 = b ^ this.permutations[i & 255];
            var crcSave = test_2 == 0 ? 0 : b;
            stringBuilder += String.fromCharCode(test_2 == 0 ? b : test_2);
            crc1 = (crc1 + crcSave) % 65521;
            crc2 = (crc2 + crc1) % 65521;
        }
        var crc = crc1 ^ (crc2 << 8);
        if (CodecV2.encodeCrc(crc) != crcCheck)
            throw new Error("FCHK (".concat(CodecV2.encodeCrc(crc), " != ").concat(crcCheck, ")"));
        return stringBuilder;
    };
    CodecV2.BASE64_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    CodecV2.SNAKE_KEY_VERSION = "0";
    CodecV2.FEVER_KEY_VERSION = "1";
    CodecV2.KUBE_KEY_VERSION = "77e352";
    return CodecV2;
}());
exports.CodecV2 = CodecV2;
//# sourceMappingURL=CodecV2.js.map