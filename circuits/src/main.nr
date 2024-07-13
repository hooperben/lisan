use dep::ethereum::receipt::{get_receipt, TxReceiptWithinBlock};
use dep::ethereum::transaction::{get_transaction, TransactionWithinBlock};

global MAX_DATA_LEN = 1000;

fn main(
    chainId: pub Field,
    blockNumber: pub Field,
    txIndex: pub Field,
    block_hash: pub [u8; 32]
) {
    // 11155111, 6298444, 21
    // let receipt = get_receipt(chainId, blockNumber, txIndex);

    let transaction: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(chainId, blockNumber as u64, txIndex);

    // see handy-python-scripts/txhash-to-bytes.py

    assert(transaction.block_hash == block_hash);
    // assert(transaction.block_hash == [246, 35, 195, 117, 89, 89, 20, 126, 85, 250, 18, 12, 184, 54, 216, 194, 60, 187, 151, 128, 33, 152, 77, 212, 11, 6, 50, 3, 204, 239, 153, 16]);
    // assert(transaction.block_hash == [0xf6, 0x23, 0xc3, 0x75, 0x59, 0x59, 0x14, 0x7e, 0x55, 0xfa, 0x12, 0x0c, 0xb8, 0x36, 0xd8, 0xc2, 0x3c, 0xbb, 0x97, 0x80, 0x21, 0x98, 0x4d, 0xd4, 0x0b, 0x06, 0x32, 0x03, 0xcc, 0xef, 0x99, 0x10]);
}

#[test]
fn test_main() {
    // main(1, 2);
    let block_hash = [246, 35, 195, 117, 89, 89, 20, 126, 85, 250, 18, 12, 184, 54, 216, 194, 60, 187, 151, 128, 33, 152, 77, 212, 11, 6, 50, 3, 204, 239, 153, 16];
    main(11155111, 6298444, 21, block_hash);

    // Uncomment to make test fail
    // main(1, 1);
}