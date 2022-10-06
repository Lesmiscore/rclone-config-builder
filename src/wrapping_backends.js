module.exports = {
    // type: array of [whether it accepts multiple paths, *keys which accepts a remote path]
    "alias": [false, "remote"], // https://rclone.org/alias/
    "cache": [false, "remote"], // https://rclone.org/cache/
    "chunker": [false, "remote"], // https://rclone.org/chunker/
    "combine": [true, "upstreams"], // https://rclone.org/combine/ this has a special notation
    "compress": [false, "remote"], // https://rclone.org/compress/
    "crypt": [false, "remote"], // https://rclone.org/crypt/
    "hasher": [false, "remote"], // https://rclone.org/hasher/
    "union": [true, "upstreams"], // https://rclone.org/union/
};
