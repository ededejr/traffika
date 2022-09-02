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
  -d, --duration  duration in milliseconds                              [number]
  -w, --maxWait   max delay in milliseconds              [number] [default: 200]
  -s, --sync      run requests synchronously          [boolean] [default: false]
```

##### examples

##### send 10 requests to a localhost server in parallel

```sh
traffika run http://localhost:4000 -v -l=10
```

outputs:
```sh
[run] sent: 200 GET http://localhost:4000/?tfk=62943-DB5PZOZXLZMGIJDK
[run] sent: 200 GET http://localhost:4000/?tfk=62943-UY3PBS3B1N7MOORC
[run] sent: 200 GET http://localhost:4000/?tfk=62943-0ET0PZ6BMAYN01PO
[run] sent: 200 GET http://localhost:4000/?tfk=62943-38DUZS2H8HEC40EY
[run] sent: 200 GET http://localhost:4000/?tfk=62943-K8O86MXAW9SDD04A
[run] sent: 200 GET http://localhost:4000/?tfk=62943-SOOPDPLBI7NZ1IKA
[run] sent: 200 GET http://localhost:4000/?tfk=62943-YJLR1IRVC0XZU49B
[run] sent: 200 GET http://localhost:4000/?tfk=62943-NTI3TAYCAJH9OEV2
[run] sent: 200 GET http://localhost:4000/?tfk=62943-UH00M0IUWOJJ66BC
[run] sent: 200 GET http://localhost:4000/?tfk=62943-LQ7TYPNW2BBR3KNP

Summary:
  count: 10 requests
  average: 26ms
  fastest: 22ms
  slowest: 39ms
```

running without the `-v` flag omits the individual requests:

```sh
Summary:
  count: 10 requests
  average: 26ms
  fastest: 22ms
  slowest: 39ms
```

##### send requests to a localhost server in series
```sh
traffika run http://localhost:4000 -v -l=10 -s
```

##### send requests to a localhost server for 10 seconds
```sh
traffika run http://localhost:4000 -v -d=10000
```

if the `-d` and `-l` flags are both passed, `-d` takes precedence