import QRCode, { QRCodeErrorCorrectionLevel, QRCodeToDataURLOptions } from 'qrcode';

/**
 * Generate a QR code for a given Bitcoin address
 * @param btcAddress Bitcoin address to generate QR code for
 * @returns Base64 encoded data URL of the QR code image
 */
export async function generateQRCode(btcAddress: string): Promise<string> {
  try {
    // Generate QR code with Bitcoin URI format for better wallet compatibility
    const btcUri = `bitcoin:${btcAddress}`;
    
    // Options for generating the QR code
    const options: QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'H' as QRCodeErrorCorrectionLevel, // High error correction capability
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    };

    // Generate QR code as a base64 data URL
    const dataUrl = await QRCode.toDataURL(btcUri, options);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Validate if a string is a valid Bitcoin address
 * @param address Bitcoin address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidBitcoinAddress(address: string): boolean {
  // Basic validation for Bitcoin addresses
  // More comprehensive validation would require a specialized library
  const btcRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
  return btcRegex.test(address);
}
