/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
  category: 'garment' | 'hat' | 'sunglasses' | 'bag' | 'accessory';
}

export interface OutfitLayer {
  garment: WardrobeItem | null; // null represents the base model layer
  poseImages: Record<string, string>; // Maps pose instruction to image URL
}

export interface LookbookEntry {
  id: string;
  imageUrl: string;
  timestamp: number;
  items: WardrobeItem[];
}
