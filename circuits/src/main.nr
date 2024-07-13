use dep::ethereum::receipt::{get_receipt, TxReceiptWithinBlock};
use dep::ethereum::transaction::{get_transaction, TransactionWithinBlock};
use dep::ethereum::misc::{types::{Address}, option::make_option};

global MAX_DATA_LEN = 1000;

fn main(
    chain_id: pub Field,
    block_number: pub Field,
    tx_index: pub Field,
    value: pub U128,
    to: pub Option<Address>,
    block_hash: pub [u8; 32],
) {
    // receipt debug, handy if needed
    // let receipt = get_receipt(chain_id, block_number as u64, tx_index);
    // println(receipt);

    let transaction: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(chain_id, block_number as u64, tx_index);

    // check that the recipient of the transaction is the same as the one passed in
    assert(transaction.transaction.to == to);

    // check that the value of the transaction is 2 ETH
    assert(transaction.transaction.value == value);

    // check that the block hash is the same as the one passed in
    assert(transaction.block_hash == block_hash);
}

#[test]
fn test_main() {
    // 0x13E5E5deA5620A8f4B5C430339795cb5BaB6676e
    let address = make_option([19, 229, 229, 222, 165, 98, 10, 143, 75, 92, 67, 3, 57, 121, 92, 181, 186, 182, 103, 110], true );
    
    // 2 with 18 decimals 
    let value = U128::from_integer(2_000_000_000_000_000_000);

    // the block hash (idk why this syntax, it kinda sucks)
    // 0xe58e296c754c47a64a396d353e38c35146db30957449e747dbe97db0e77b4e61
    let block_hash = [246, 35, 195, 117, 89, 89, 20, 126, 85, 250, 18, 12, 184, 54, 216, 194, 60, 187, 151, 128, 33, 152, 77, 212, 11, 6, 50, 3, 204, 239, 153, 16];
    main(11155111, 6298444, 21, value, address, block_hash);
}