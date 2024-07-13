use dep::ethereum::receipt::{get_receipt, TxReceiptWithinBlock};
use dep::ethereum::transaction::{get_transaction, TransactionWithinBlock};

global MAX_DATA_LEN = 1000;

fn main(
    chain_id: pub Field,
    block_number: pub Field,
    tx_index: pub Field,
    value: pub U128,
    block_hash: pub [u8; 32],
) {
    // receipt debug, handy if needed
    // let receipt = get_receipt(chain_id, block_number as u64, tx_index);
    // println(receipt);

    let transaction: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(chain_id, block_number as u64, tx_index);

    // check that the value of the transaction is 2 ETH
    assert(transaction.transaction.value == value);

    // check that the block hash is the same as the one passed in
    assert(transaction.block_hash == block_hash);

}

#[test]
fn test_main() {

    // 2 with 18 decimals 
    let value = U128::from_integer(2_000_000_000_000_000_000);

    // the block hash (idk why this syntax, it kinda sucks)
    let block_hash = [246, 35, 195, 117, 89, 89, 20, 126, 85, 250, 18, 12, 184, 54, 216, 194, 60, 187, 151, 128, 33, 152, 77, 212, 11, 6, 50, 3, 204, 239, 153, 16];
    main(11155111, 6298444, 21, value, block_hash);
}