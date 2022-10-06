const assert = require("assert");
const { shellEscape } = require("../src/util");

describe('tests functions in src/util', function () {
    // https://github.com/python/cpython/blob/0d68879104dfb392d31e52e25dcb0661801a0249/Lib/test/test_shlex.py#L326-L339
    it("tests shellEscape", function () {
        const safeUnquoted = 'abcdefghijklmnopqrstuvwxyz' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789' + '@%_-+=:,./';
        const unicodeSample = '\xe9\xe0\xdf'; // e + acute accent, a + grave, sharp s
        const unsafe = '"`$\\!' + unicodeSample;

        assert.equal(shellEscape(""), "''");
        assert.equal(shellEscape(safeUnquoted), safeUnquoted);
        assert.equal(shellEscape('test file name'), "'test file name'");

        for (const u of unsafe)
            assert.equal(shellEscape(`test${u}name`), `'test${u}name'`);
        for (const u of unsafe)
            assert.equal(shellEscape(`test${u}'name'`), `'test${u}'"'"'name'"'"''`);
    });
});
