"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodecV1 = void 0;
var CodecV1 = (function () {
    function CodecV1(sid) {
        this.key = [];
        for (var i = 0; i < sid.length; i++) {
            var k = sid.charCodeAt(i);
            if (k >= 48 && k <= 57) {
                k = k - 48 + 52;
            }
            else if (k >= 65 && k <= 90) {
                k = k - 65;
            }
            else if (k >= 97 && k <= 122) {
                k = k - 97 + 26;
            }
            else {
                continue;
            }
            this.key.push(k);
        }
    }
    CodecV1.prototype.run = function (input) {
        var buffer = "", key = this.key;
        for (var i = 0; i < input.length; i++) {
            var v1 = input.charCodeAt(i), v2 = key[(i + input.length) % key.length], v3 = v1 ^ v2;
            if (v3 == 0) {
                var v4 = input.charCodeAt(i);
                buffer += String.fromCharCode(v4);
            }
            else {
                buffer += String.fromCharCode(v3);
            }
        }
        return buffer;
    };
    return CodecV1;
}());
exports.CodecV1 = CodecV1;
//# sourceMappingURL=CodecV1.js.map