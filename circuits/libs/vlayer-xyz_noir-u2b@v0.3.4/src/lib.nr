pub fn u32_to_u8(num: u32) -> [u8; 4] {
    let mut out: [u8; 4] = [0; 4];
    for i in 0..4 {
        let shift: u8 = (24 - (i * 8));
        out[i] = (num >> shift) as u8;
    }

    out
}

#[test]
fn test_u32() {
    let small = u32_to_u8(10);
    assert(small.len() == 4);
    assert(small[0] == 0);
    assert(small[1] == 0);
    assert(small[2] == 0);
    assert(small[3] == 10);

    let two_byte = u32_to_u8(256);
    assert(two_byte[0] == 0x00);
    assert(two_byte[1] == 0x00);
    assert(two_byte[2] == 0x01);
    assert(two_byte[3] == 0x00);

    let ceil = u32_to_u8(4294967295);
    assert(ceil[0] == 0xff);
    assert(ceil[1] == 0xff);
    assert(ceil[2] == 0xff);
    assert(ceil[3] == 0xff);
}

pub fn u64_to_u8(num: u64) -> [u8; 8] {
    let mut out: [u8; 8] = [0; 8];
    for i in 0..8 {
        let shift: u8 = 56 - (i * 8);
        out[i] = (num >> shift) as u8;
    }

    out
}

#[test]
fn test_u64() {
    let small = u64_to_u8(10);
    assert(small.len() == 8);
    assert(small[0] == 0);
    assert(small[1] == 0);
    assert(small[2] == 0);
    assert(small[3] == 0);
    assert(small[4] == 0);
    assert(small[5] == 0);
    assert(small[6] == 0);
    assert(small[7] == 10);

    let two_byte = u64_to_u8(256);
    assert(two_byte[0] == 0x00);
    assert(two_byte[1] == 0x00);
    assert(two_byte[2] == 0x00);
    assert(two_byte[3] == 0x00);
    assert(two_byte[4] == 0x00);
    assert(two_byte[5] == 0x00);
    assert(two_byte[6] == 0x01);
    assert(two_byte[7] == 0x00);

    let random = u64_to_u8(0x1cbe443030);
    assert(random[0] == 0x00);
    assert(random[1] == 0x00);
    assert(random[2] == 0x00);
    assert(random[3] == 0x1c);
    assert(random[4] == 0xbe);
    assert(random[5] == 0x44);
    assert(random[6] == 0x30);
    assert(random[7] == 0x30);

    let ceil = u64_to_u8(18446744073709551615);
    assert(ceil[0] == 0xff);
    assert(ceil[1] == 0xff);
    assert(ceil[2] == 0xff);
    assert(ceil[3] == 0xff);
    assert(ceil[4] == 0xff);
    assert(ceil[5] == 0xff);
    assert(ceil[6] == 0xff);
    assert(ceil[7] == 0xff);
}
