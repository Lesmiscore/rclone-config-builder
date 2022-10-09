# rclone-config-builder
Config builder in YAML for Rclone

# Installation

```
npm i -g rclone-config-builder
```


# Usage

```
rclone-config-builder convert source.yml [rclone.conf]
```

The path to rclone.conf may be omitted. [If omitted, it'll default to the rclone's config path.](https://rclone.org/docs/#config-config-file)

# Contents for YAML files

## Basics
Each root key corresponds to a backend. Use the same key-value for parameters. Obscure passwords as needed.

```yaml
remote:
  type: ftp
  host: example.com
  user: testaccount1
  pass: hZFA05qRteCkJTg2hS-qdkbG_RUbbOiz42kFT1qeCA
```

## Wrapping backends

For some backends that wraps other remotes, you can define "inline remotes", to define a remote on-demand, like this:

```yaml
crypt-remote:
  type: crypt
  remote:
    type: ftp
    host: example.com
    user: testaccount1
    pass: hZFA05qRteCkJTg2hS-qdkbG_RUbbOiz42kFT1qeCA
  password: e_YG9UDs5bYhWYILrgAXNjeVbW3j2oYS1z-gV_jL6w
  password2: L7yCBJUzQLGU-b_Pni6uHJ18eK-9yAowCrTFbgIuDwvXj3iE
```

This example defines a crypt remote, wrapping an inline ftp remote.
Note that you don't have to define the name for inline remotes. They're automatically created as needed.
It can also point to an another defined remote using string, like:

```yaml
crypt-remote:
  type: crypt
  remote: "myftpserver:"
  password: e_YG9UDs5bYhWYILrgAXNjeVbW3j2oYS1z-gV_jL6w
  password2: L7yCBJUzQLGU-b_Pni6uHJ18eK-9yAowCrTFbgIuDwvXj3iE
```

Don't forget to surround with double quotes, to prevent it from becoming a mapping.



For backends accepting multiple remotes (e.g. union), multiple remotes can be specified by array. Strings and inline remotes can be mixed in an array.
Like rclone.conf, you can also use the string, separated by spaces.

```yaml
union-remote1:
  upstreams:
    # Tip: Always quote by double quotes to prevent it from becoming mapping
    - "ftp1:"
    - "sftp2:"


union-remote2:
  upstreams:
    # Inline remotes are also accepted
    - "ftp1:"
    - type: crypt
      remote: "sftp2:"
      password: e_YG9UDs5bYhWYILrgAXNjeVbW3j2oYS1z-gV_jL6w
      password2: L7yCBJUzQLGU-b_Pni6uHJ18eK-9yAowCrTFbgIuDwvXj3iE


union-remote3:
  # String can be used too
  upstreams: "ftp1: sftp2:"
```

## Subdirectory for inline remotes

To specify subdirectories in inline remotes (i.e. point to children directory in remote), use `@path` key. It also accepts the path starting with slashes.

```yaml
crypt-remote:
  type: crypt
  remote:
    # This remote is referenced by a string like "remote:hello/world/subdir/"
    type: ftp
    host: example.com
    user: testaccount1
    pass: hZFA05qRteCkJTg2hS-qdkbG_RUbbOiz42kFT1qeCA
    "@type": "hello/world/subdir/"
  password: e_YG9UDs5bYhWYILrgAXNjeVbW3j2oYS1z-gV_jL6w
  password2: L7yCBJUzQLGU-b_Pni6uHJ18eK-9yAowCrTFbgIuDwvXj3iE
```

## Combine

For combine backend, each remotes are specified as a mapping:

```yaml
combine-remote:
  upstreams:
    testdir: "samba:"
    mydrive:
      type: drive
      client_id: apps.googleusercontent.com
      client_secret: UOehroMHJohWDriV11mcXHaZE8BOQQ
      scope: drive
      token: "{}"
```

This example defines a defined remote "samba:" to be in `testdir/` directory, and an inline remote to Google Drive to be in `mydrive/`.
