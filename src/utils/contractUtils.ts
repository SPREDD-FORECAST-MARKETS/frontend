import { keccak256, toBytes } from "viem";

/**
 * Convert a marketId string to bytes32 format for smart contract calls
 * @param marketId - The marketId as a string (can be hex or regular string)
 * @returns bytes32 formatted string for contract calls
 */
export function marketIdToBytes32(marketId: string): `0x${string}` {
  if (!marketId) {
    throw new Error("MarketId cannot be empty");
  }

  // If it's already a valid 32-byte hex string, return as-is
  if (marketId.startsWith("0x") && marketId.length === 66) {
    return marketId as `0x${string}`;
  }

  // If it's a shorter hex string, pad it to 32 bytes
  if (marketId.startsWith("0x") && marketId.length < 66) {
    return marketId.padEnd(66, "0") as `0x${string}`;
  }

  // If it's a regular string, convert it to bytes32 via keccak256 hash
  // This is the most common case for user-readable marketIds
  const marketIdBytes = toBytes(marketId);
  const hashedMarketId = keccak256(marketIdBytes);
  
  return hashedMarketId;
}

/**
 * Convert bytes32 back to a readable string (for display purposes)
 * Note: This only works if the original was converted via keccak256
 * @param bytes32Value - The bytes32 value from contract
 * @returns original string if possible, otherwise the hex representation
 */
export function bytes32ToMarketId(bytes32Value: string): string {
  if (!bytes32Value || bytes32Value === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return "";
  }
  
  // Return the hex representation - we can't reverse keccak256
  return bytes32Value;
}

/**
 * Validate if a marketId string is properly formatted
 * @param marketId - The marketId to validate
 * @returns true if valid, false otherwise
 */
export function isValidMarketId(marketId: string): boolean {
  if (!marketId || typeof marketId !== "string") {
    return false;
  }

  // Accept any non-empty string - we can convert it to bytes32
  return marketId.length > 0;
}

/**
 * Convert basis points (1e6 = 100%) to regular percentage
 * @param basisPoints - Value in basis points from smart contract
 * @returns percentage as a number (0-100)
 */
export function basisPointsToPercentage(basisPoints: number): number {
  return (basisPoints / 1e6) * 100;
}

/**
 * Convert percentage to basis points for smart contract calls
 * @param percentage - Percentage as a number (0-100) 
 * @returns value in basis points
 */
export function percentageToBasisPoints(percentage: number): number {
  return Math.round((percentage / 100) * 1e6);
}