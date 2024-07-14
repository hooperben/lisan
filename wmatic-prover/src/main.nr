use dep::ethereum::receipt::{get_receipt, TxReceiptWithinBlock};
use dep::ethereum::transaction::{get_transaction, TransactionWithinBlock};

use dep::token::token::ERC20Token;
use dep::ethereum::uint256::U256;
use dep::ethereum::misc::{types::{Address}, option::make_option};


global MIN_BALANCE = U128::from_integer(100_000_000_000_000_000); // 0.1 MATIC

fn main(
    wallet_address: Address, block_number: pub u64
) {
    let WMATIC = ERC20Token {
        // https://amoy.polygonscan.com/address/0x5FB56a765FD7Eb53223f8b7d748f343a58af1FD9
        address: [0x5F, 0xB5, 0x6a, 0x76, 0x5F, 0xD7, 0xEb, 0x53, 0x22, 0x3f, 0x8b, 0x7d, 0x74, 0x8f, 0x34, 0x3a, 0x58, 0xaf, 0x1F, 0xD9],
        balances_slot: U256::from_field(3),
        allowances_slot: U256::from_field(4),
        chain_id: 80002
    };

    let wallet_balance = WMATIC.get_balance(wallet_address, block_number, false);

    let greater_than_zero = U128::from_integer(0) < wallet_balance;

    assert(greater_than_zero, "Has never had wmatic");
}

// #[test]
// fn test_main() 
//     // 0x13E5E5deA5620A8f4B5C430339795cb5BaB6676e
//     let address = [0x13, 0xE5, 0xE5, 0xde, 0xA5, 0x62, 0x0A, 0x8f, 0x4B, 0x5C, 0x43, 0x03, 0x39, 0x79, 0x5c, 0xb5, 0xBa, 0xB6, 0x67, 0x6e];
//     let block_number = 9446274;

//     main(address, block_number);
// }