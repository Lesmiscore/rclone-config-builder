
// https://github.com/python/cpython/blob/0d68879104dfb392d31e52e25dcb0661801a0249/Lib/shlex.py#L321-L332
function shellEscape(s) {
    if (!s)
        return "''";
    if (!/[^\w@%+=:,./-]/.test(s))
        return s;
    return `'${s.replace(/'/g, `'"'"'`)}'`
}

// reverse of "rclone obscure" for Node.js
const crypto = require("crypto");

const aesBlockSize = 16;

// https://github.com/rclone/rclone/blob/9bf78d0373ba33a15f61c1bb2a3fc7c62639aec0/fs/config/obscure/obscure.go#L17-L22
const key = Buffer.from([
    0x9c, 0x93, 0x5b, 0x48, 0x73, 0x0a, 0x55, 0x4d,
    0x6b, 0xfd, 0x7c, 0x63, 0xc8, 0x86, 0xa9, 0x2b,
    0xd3, 0x90, 0x19, 0x8e, 0xb8, 0x12, 0x8a, 0xfb,
    0xf4, 0xde, 0x16, 0x2b, 0x8b, 0x95, 0xf6, 0x38,
]);

function reveal(input) {
    const cipherText = Buffer.from(input, "base64");
    if (cipherText < aesBlockSize) {
        throw new Error("Input too short or malformed Base64")
    }
    const buf = cipherText.subarray(aesBlockSize);
    const iv = cipherText.subarray(0, aesBlockSize);
    const ctx = crypto.createCipheriv("aes-256-ctr", key, iv);
    return Buffer.concat([ctx.update(buf), ctx.final()]).toString("utf8");
}

module.exports = {
    shellEscape,
    reveal,
}
