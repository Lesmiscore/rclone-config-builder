
// https://github.com/python/cpython/blob/0d68879104dfb392d31e52e25dcb0661801a0249/Lib/shlex.py#L321-L332
function shellEscape(s) {
    if (!s)
        return "''";
    if (!/[^\w@%+=:,./-]/.test(s))
        return s;
    return `'${s.replace(/'/g, `'"'"'`)}'`
}

module.exports = {
    shellEscape,
}
