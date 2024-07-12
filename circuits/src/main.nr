use dep::ethereum::receipt::{get_receipt, TxReceiptWithinBlock};
use dep::ethereum::transaction::{get_transaction, TransactionWithinBlock};

global MAX_DATA_LEN = 1000;

fn main() {
    let receipt = get_receipt(11155111, 6298444, 21);

    println(receipt);

    let transaction: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(11155111, 6298444, 21);

    println(transaction);
}

#[test]
fn test_main() {
    // main(1, 2);
    main();

    // Uncomment to make test fail
    // main(1, 1);
}
