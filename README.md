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

### Testing

Anytime you make a change to the main.nr circuit, you need to run:

```sh
./build-circuit-to-contract.sh
# ensure you have the oracle running before running this
cd circuits && nargo prove --oracle-resolver=http://127.0.0.1:5555
cd ../contracts && bun hardhat test
```

Note: this might seem broken, but it does take a while. Have a look at your activity monitor if you dare lol

### Acknowledgements:

This would not be possible without the awesome work done by Vlayer and their noir libaries
