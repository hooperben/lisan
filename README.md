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

### Testnet Deployments

#### Amoy

| Contract               | Address                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Lisan                  | [0x5c37a27779c2C0CCc550B1Af3Ffe592Cd19582bb](https://sepolia.etherscan.io/address/0x5c37a27779c2C0CCc550B1Af3Ffe592Cd19582bb) |
| ProofOfSepoliaTransfer | [0xf5F126b398bAb455EecF05243707875248643498](https://sepolia.etherscan.io/address/0xf5F126b398bAb455EecF05243707875248643498) |
| UltraVerifier          | [0x8273CC3A0F4736FE5FB687B3652768e789572DFa](https://sepolia.etherscan.io/address/0x8273CC3A0F4736FE5FB687B3652768e789572DFa) |

#### Sepolia

| Contract | Address                                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Lisan    | [0xdEfbc7F979aD934a401e0c2A426243470f077313](https://sepolia.etherscan.io/address/0xdEfbc7F979aD934a401e0c2A426243470f077313) |

## Real Testnet Proofs

1. On polygon amoy, in transaction [0xbfc5a3cff200c3350d45c8993bfc026e4da281787677bc4131835983817dd527](https://amoy.polygonscan.com/tx/0xbfc5a3cff200c3350d45c8993bfc026e4da281787677bc4131835983817dd527), I was able to prove that transaction
   [0xe58e296c754c47a64a396d353e38c35146db30957449e747dbe97db0e77b4e61](https://sepolia.etherscan.io/tx/0xe58e296c754c47a64a396d353e38c35146db30957449e747dbe97db0e77b4e61) occured on ethereum sepolia.

### Acknowledgements:

This would not be possible without the awesome work done by Vlayer and their noir libaries
