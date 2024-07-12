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
