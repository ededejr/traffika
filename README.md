### traffika

a cli tool for sending test traffic to a given target

```
traffika <command>

Commands:
  traffika blast <target>  send requests to target on multiple threads
  traffika run <target>    send requests to target

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

#### run
```
traffika run <target>

send requests to target

Options:
      --version   Show version number                                  [boolean]
      --help      Show help                                            [boolean]
      --target    target url                                 [string] [required]
  -v, --verbose   enable verbose logs                 [boolean] [default: false]
      --debug     enable debug logs                   [boolean] [default: false]
  -l, --limit     limit requests                        [number] [default: 1000]
  -d, --duration  duration in milliseconds                              [number]
  -w, --maxWait   max delay in milliseconds              [number] [default: 200]
  -s, --sync      run requests synchronously          [boolean] [default: false]
```

##### examples

##### send 10 requests to a localhost server in parallel

```
traffika run http://localhost:4000 -v -l=10
```

outputs:
```
[run] sent: 200 GET http://localhost:4000/?tfk=16896-CZCZ64M9YFKZCB9K
[run] sent: 200 GET http://localhost:4000/?tfk=16896-3ANOEO8S9XXOCUNY
[run] sent: 200 GET http://localhost:4000/?tfk=16896-945TT0IZ10NU8TR2
[run] sent: 200 GET http://localhost:4000/?tfk=16896-3COA8HYMSB1X31EN
[run] sent: 200 GET http://localhost:4000/?tfk=16896-OHQ45CUVN0E554KC
[run] sent: 200 GET http://localhost:4000/?tfk=16896-BZIWA0Q6I2UB0LG3
[run] sent: 200 GET http://localhost:4000/?tfk=16896-QDJ43835A9Z84G30
[run] sent: 200 GET http://localhost:4000/?tfk=16896-MJJMSDWHGDF09BMT
[run] sent: 200 GET http://localhost:4000/?tfk=16896-MU2JZYRV1SJ32PQA
[run] sent: 200 GET http://localhost:4000/?tfk=16896-67YIMBBMS3S3HC4E

Summary:
  requests: 10
  average: 27ms
  fastest: 24ms
  slowest: 39ms
  status codes:
    - 200: 100.0%
```

running without the `-v` flag omits the individual requests:

```
Summary:
  requests: 10
  average: 27ms
  fastest: 24ms
  slowest: 39ms
  status codes:
    - 200: 100.0%
```

##### send requests to a localhost server in series
```
traffika run http://localhost:4000 -v -l=10 -s
```

##### send requests to a localhost server for 10 seconds
```
traffika run http://localhost:4000 -v -d=10000
```

if the `-d` and `-l` flags are both passed, `-d` takes precedence


#### blast
```
traffika blast <target>

send requests to target on multiple threads

Options:
      --version   Show version number                                  [boolean]
      --help      Show help                                            [boolean]
      --target    target url                                 [string] [required]
  -v, --verbose   verbose output                      [boolean] [default: false]
      --debug     enable debug logs                   [boolean] [default: false]
  -l, --limit     limit requests                        [number] [default: 1000]
  -w, --workers   max number of workers to use                          [number]
  -b, --batch     batch size for requests                [number] [default: 100]
  -d, --duration  duration in milliseconds                              [number]
```

#### examples

##### send 15 requests to a localhost server using 2 workers
```
traffika blast http://localhost:4000 -l 15 -w 2 -v
```

outputs:
```
[primary] setting up cluster...
[primary] detected 8 cores:
[primary]   - forked [1/8]
[primary]   - forked [2/8]
[primary] ready ✅
[w::16793] [command] start
[w::16793] started
[w::16792] [command] start
[w::16792] started
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-BXMG47XZKIUVX521
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-0Z8O8SAXHX8QZUTR
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-IWSE8PDGFXNZFD30
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-NQO7R1EXQPRL8T60
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-GJFLJINWA0LJOA5D
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-SX391AKJRPG4HZF5
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-HPUAKEBHEAOQVUE5
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-LOCENDERJWA80AM1
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-CVV5XCJ6KOKMEM1P
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-2ZJ30DVY1YFIJQUO
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-SDGGAHC9E0SUKVD7
[w::16792] sent: 200 GET http://localhost:4000/?tfk=16792-N4GGNOXHKW7J7IZV
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-NENUHF6O7GSMAK6P
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-I46JPI3F6ZE3I4Z8
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-ZBPM4NECZSZEODHP
[w::16793] sent: 200 GET http://localhost:4000/?tfk=16793-PWK0XCS2FNVLB7BN
[w::16793] [command] exit
[w::16792] [command] exit
[w::16793] exiting...
[w::16792] exiting...
[w::16793] exited
[w::16792] exited
[primary] exiting gracefully...

Summary:
  requests: 16
  average: 18ms
  fastest: 14ms
  slowest: 31ms
  status codes:
    - 200: 100.0%
```
