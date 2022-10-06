const { ConfigBuilder } = require("../src/index");
const assert = require("assert");


function assertResolve(input, expected) {
    const builder = new ConfigBuilder();
    builder.loadRawRemotes(input);
    if(!expected){
        return console.log(builder.getRemotes());
    }
    assert.deepEqual(builder.getRemotes(), expected);
}


describe('attempt resolving', function () {

    it("resolves a simple config with remotes", async function () {
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

    it("resolves a complex config (without combine)", async function () {
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
