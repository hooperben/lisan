# eth-global-brussels

My hackathon repo for eth global brussels 2024

### Notes

To get the oracle in noir communicating with the outside world:

```

cd client
bun run dev
cd ..

cd circuits
nargo test --oracle-resolver http://localhost:3000/api/hello --show-output
```

### Acknowledgements:

This would not be possible without the awesome work done by Vlayer and their noir libaries
