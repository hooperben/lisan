def convert_tx_hash_to_hex_array(tx_hash):
    # Remove the '0x' prefix
    if tx_hash.startswith("0x"):
        tx_hash = tx_hash[2:]

    # Split the string into pairs of characters and convert to hexadecimal format
    hex_array = [f"0x{tx_hash[i:i+2]}" for i in range(0, len(tx_hash), 2)]

    return hex_array

# Example usage
tx_hash = "0xf623c3755959147e55fa120cb836d8c23cbb978021984dd40b063203ccef9910"
hex_array = convert_tx_hash_to_hex_array(tx_hash)

print(hex_array)

def convert_hex_array_to_tx_hash(hex_array):
    # Remove the '0x' prefix from each element in the array
    clean_hex_array = [hex_value[2:] if hex_value.startswith("0x") else hex_value for hex_value in hex_array]

    # Join the array into a single string
    tx_hash = ''.join(clean_hex_array)

    # Add the '0x' prefix
    return '0x' + tx_hash

# Example usage
hex_array = [
    '0xf6', '0x23', '0xc3', '0x75', '0x59', '0x59', '0x14', '0x7e',
    '0x55', '0xfa', '0x12', '0x0c', '0xb8', '0x36', '0xd8', '0xc2',
    '0x3c', '0xbb', '0x97', '0x80', '0x21', '0x98', '0x4d', '0xd4',
    '0x0b', '0x06', '0x32', '0x03', '0xcc', '0xef', '0x99', '0x10'
]

tx_hash = convert_hex_array_to_tx_hash(hex_array)

print(tx_hash)
