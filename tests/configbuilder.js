const { ConfigBuilder } = require("../src/index");
const assert = require("assert");


function assertResolve(input, expected) {
    const builder = new ConfigBuilder();
    builder.loadRawRemotes(input);
    if (!expected) {
        return console.log(builder.getRemotes());
    }
    assert.deepEqual(builder.getRemotes(), expected);
}


describe('attempt resolving', function () {

    it("resolves a simple config with remotes", function () {
        assertResolve({
            "test-memory": {
                "type": "memory",
            },
            "onedrive-my": {
                "type": "onedrive",
                "token": "***token***",
                "drive_id": "***drive_id***",
                "drive_type": "business",
            },
        }, {
            "test-memory": {
                "type": "memory",
            },
            "onedrive-my": {
                "type": "onedrive",
                "token": "***token***",
                "drive_id": "***drive_id***",
                "drive_type": "business",
            },
        });
    });

    it("resolves a config with nested remotes", function () {
        assertResolve({
            "sqfs-union": {
                "type": "union",
                "upstreams": [
                    "queue/:ro",
                    "done/:ro",
                    {
                        "type": "crypt",
                        "remote": {
                            "type": "memory"
                        },
                        "filename_encryption": "off",
                        "directory_name_encryption": "false",
                        "password": "xtQ3DAvNBi87vip07G468lDIbFdVch3XIyjI",
                    }
                ]
            },
        }, {
            '____sqfs-union_crypt_1_memory_1': { type: 'memory' },
            '__sqfs-union_crypt_1': {
                type: 'crypt',
                remote: '____sqfs-union_crypt_1_memory_1:',
                filename_encryption: 'off',
                directory_name_encryption: 'false',
                password: 'xtQ3DAvNBi87vip07G468lDIbFdVch3XIyjI'
            },
            'sqfs-union': {
                type: 'union',
                upstreams: 'queue/:ro done/:ro __sqfs-union_crypt_1:'
            }
        });
    });

    it("resolves a config with combine backend", function () {
        assertResolve({
            // test 1: upstreams is just string
            "by-string": {
                "type": "combine",

                "upstreams": "hello=:memory: world=remote:",
            },
            // test 2: upstreams is object, but no inline backend
            "by-object-no-inline": {
                "type": "combine",

                "upstreams": {
                    "hello": ":memory:",
                    "world": "remote:",
                },
            },
            // test 3: upstreams is object, and all of them are inline backend
            "by-object-all-inline": {
                "type": "combine",

                "upstreams": {
                    "hello": {
                        "type": "memory",
                    },
                    "world": {
                        "type": "union",
                        "upstreams": [
                            // test 6: array of remotes without inline
                            "queue/:ro",
                            "done/:ro",
                        ],
                        "@path": "test/",
                    },
                },
            },
            // test 4: upstreams is object, but not all of them are inline backend
            "by-object-some-inline": {
                "type": "combine",

                "upstreams": {
                    "hello": {
                        "type": "memory",
                    },
                    "world": {
                        "type": "union",
                        "upstreams": [
                            // test 6: array of remotes without inline
                            "queue/:ro",
                            "done/:ro",
                        ],
                        "@path": "test/",
                    },
                    "foo": "bar:",
                },
            },
        }, {
            'by-string': { type: 'combine', upstreams: 'hello=:memory: world=remote:' },
            'by-object-no-inline': { type: 'combine', upstreams: 'hello=:memory: world=remote:' },
            '__by-object-all-inline_memory_1': { type: 'memory' },
            '__by-object-all-inline_union_1': { type: 'union', upstreams: 'queue/:ro done/:ro' },
            'by-object-all-inline': {
                type: 'combine',
                upstreams: 'hello=__by-object-all-inline_memory_1: world=__by-object-all-inline_union_1:test/'
            },
            '__by-object-some-inline_memory_1': { type: 'memory' },
            '__by-object-some-inline_union_1': { type: 'union', upstreams: 'queue/:ro done/:ro' },
            'by-object-some-inline': {
                type: 'combine',
                upstreams: 'hello=__by-object-some-inline_memory_1: world=__by-object-some-inline_union_1:test/ foo=bar:'
            }
        });
    });

    it("resolves a config with a union with one backend", function () {
        assertResolve({
            "sqfs-union": {
                "type": "union",
                /*
                 * NB: this specification is invalid according to rclone itself -
                 * $ rclone --union-upstreams=:memory: ls :union:
                 * Failed to create file system for ":union:": union can't point to a single upstream - check the value of the upstreams setting
                 */
                "upstreams": {
                    "type": "crypt",
                    "remote": {
                        "type": "memory"
                    },
                    "filename_encryption": "off",
                    "directory_name_encryption": "false",
                    "password": "xtQ3DAvNBi87vip07G468lDIbFdVch3XIyjI",
                },
            },
        }, {
            '____sqfs-union_crypt_1_memory_1': { type: 'memory' },
            '__sqfs-union_crypt_1': {
                type: 'crypt',
                remote: '____sqfs-union_crypt_1_memory_1:',
                filename_encryption: 'off',
                directory_name_encryption: 'false',
                password: 'xtQ3DAvNBi87vip07G468lDIbFdVch3XIyjI'
            },
            'sqfs-union': {
                type: 'union',
                upstreams: '__sqfs-union_crypt_1:'
            }
        });
    });

    it("resolves a complex config (without combine)", function () {
        // https://forum.rclone.org/t/local-and-hasher-dont-work-nicely-each-other/33179/3?u=lesmiscore
        assertResolve({
            // test 1: simple remote
            "sqfs-union": {
                "type": "union",
                "upstreams": [
                    // test 2: string remotes inside array (no new backend)
                    "queue/:ro",
                    "done/:ro",
                    // test 3: inline backend in remotes
                    {
                        "type": "crypt",
                        "remote": {
                            "type": "memory"
                        },
                        "filename_encryption": "off",
                        "directory_name_encryption": "false",
                        "password": "xtQ3DAvNBi87vip07G468lDIbFdVch3XIyjI",
                    }
                ]
            },
            "sqfs-hasher": {
                "type": "hasher",
                // test 4: string remotes outside array (no new backend)
                "remote": "sqfs-union:",
                "hashes": "md5,sha1,sha256",
                "max_age": "off",
                "auto_size": "1000G",
            },


            "sqfs-hasher-nodummy": {
                "type": "hasher",
                // test 5: inline backend, for single
                "remote": {
                    "type": "union",
                    "upstreams": [
                        // test 6: array of remotes without inline
                        "queue/:ro",
                        "done/:ro",
                    ],
                    "@path": "test/",
                },
                "hashes": "md5,sha1,sha256",
                "max_age": "off",
                "auto_size": "1000G",
            },
        }, {
            '____sqfs-union_crypt_1_memory_1': { type: 'memory' },
            '__sqfs-union_crypt_1': {
                type: 'crypt',
                remote: '____sqfs-union_crypt_1_memory_1:',
                filename_encryption: 'off',
                directory_name_encryption: 'false',
                password: 'xtQ3DAvNBi87vip07G468lDIbFdVch3XIyjI'
            },
            'sqfs-union': {
                type: 'union',
                upstreams: 'queue/:ro done/:ro __sqfs-union_crypt_1:'
            },
            'sqfs-hasher': {
                type: 'hasher',
                remote: 'sqfs-union:',
                hashes: 'md5,sha1,sha256',
                max_age: 'off',
                auto_size: '1000G'
            },
            '__sqfs-hasher-nodummy_union_1': { type: 'union', upstreams: 'queue/:ro done/:ro' },
            'sqfs-hasher-nodummy': {
                type: 'hasher',
                remote: '__sqfs-hasher-nodummy_union_1:test/',
                hashes: 'md5,sha1,sha256',
                max_age: 'off',
                auto_size: '1000G'
            }
        });
    });
});
