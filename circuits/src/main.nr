

#[oracle(getAddressFromRPC)]
unconstrained fn get_address_from_rpc(input: [Field; 1]) -> [Field; 1] {}

unconstrained fn wrapper_fn(input: [Field; 1]) -> [Field; 1] {
    get_address_from_rpc(input)
}


fn main() {
    let returned_address = wrapper_fn([1]);

    println(returned_address);
}

#[test]
fn test_main() {
    // main(1, 2);
    main();


    // Uncomment to make test fail
    // main(1, 1);
}
