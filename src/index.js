const structuredClone = require("@ungap/structured-clone");

/**
 * A reserved key for specifying path
 */
const RemotePathKey = "@path";

class ConfigBuilder {
    constructor(wrappingBackends = require("./wrapping_backends")) {
        this.wrappingBackends = wrappingBackends
        this.config = {}
    }

    /**
     * Resolves an unidentified remote entry to string
     * 
     * @params remote A remote entry
     * @params name Parent remote name (null for unknown)
     * @params newName The specified name (null for auto-generate)
     */
    resolveNewRemote(remote, parent = null, newName = null) {
        /* expected structure:
         * remote = "remote:test" OR
         * remote = {
         *   "type": "crypt",
         *   "remote": "remote:test",
         * } OR
         * remote = {
         *   "type": "crypt",
         *   "remote": "remote:encrypted",
         *   "@path": "hello",
         * }
         * 
         * they should resolve into like: (if name is "remote")
         * "remote:test"
         * "__remote_crypt_1:"
         * "__remote_crypt_2:hello"
         */
        if (typeof remote === "string") {
            // no need to give new name
            return remote;
        }
        parent = parent || "";
        if (!remote.type) {
            throw new Error("A remote requires \"type\" key");
        }
        if (parent && newName) {
            throw new Error("Conflict: children have names defined");
        } else if (newName) {
            if (newName in this.config) {
                throw new Error(`The remote name ${newName} has already been in use`);
            }
        } else {
            for (let i = 1; ; i++) {
                newName = `__${parent}_${remote.type}_${i}`;
                if (!(newName in this.config)) {
                    break;
                }
            }
        }

        remote = structuredClone(remote);
        const subdir = remote["@path"] || "";

        // resolve backends recursively
        if (remote.type in this.wrappingBackends) {
            const backendInfo = this.wrappingBackends[remote.type];
            if (backendInfo[0]) {
                // multiple
                for (const key of backendInfo.slice(1)) {
                    if (!remote[key])
                        continue;
                    // unfinished
                    remote[key] = undefined;
                }
            } else {
                // single
                for (const key of backendInfo.slice(1)) {
                    if (!remote[key])
                        continue;
                    remote[key] = this.resolveNewRemote(remote[key], newName);
                }
            }
        }

        this.config[newName] = remote;

        return `${newName}:${subdir}`;
    }
}