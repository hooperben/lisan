# eth-global-brussels

My hackathon repo for eth global brussels 2024

### Notes

To get the oracle in noir communicating with the outside world:

```

cd client
bun run dev
cd ..

cd circuits
nargo test --oracle-resolver=http://127.0.0.1:5555 --show-output
```

### Acknowledgements:

This would not be possible without the awesome work done by Vlayer and their noir libaries
