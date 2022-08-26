### traffika

a cli tool for sending test traffic to a given target

```
traffika <command>

Commands:
  traffika run <target>  send requests to target

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]

Not enough non-option arguments: got 0, need at least 1
```

#### run
```
traffika run <target>

send requests to target

Options:
      --version   Show version number                                  [boolean]
      --help      Show help                                            [boolean]
      --target    target url                                 [string] [required]
  -v, --verbose   verbose output                      [boolean] [default: false]
  -l, --limit     limit requests                        [number] [default: 1000]
  -d, --duration  duration in seconds                                   [number]
  -w, --maxWait   max delay in milliseconds              [number] [default: 200]

Not enough non-option arguments: got 0, need at least 1
```