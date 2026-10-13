import { SafeZone } from '../types';

export interface ComputeTransformResult {
  scale: number;
  baseX: number;
  baseY: number;
  renderedWidth: number;
  renderedHeight: number;
  safeZoneRendered: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Computes scale and default center placement for an image such that
 * the safe zone is strictly 100% contained within the target format (W_f, H_f).
 * Image aspect ratio is strictly preserved (no stretching/distortion).
 */
export function computeSafeZonePlacement(
  targetWidth: number,
  targetHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  safeZone: SafeZone,
  userZoom: number = 1.0
): ComputeTransformResult {
  // Safe zone in natural image pixels
  const szX = (safeZone.x / 100) * naturalWidth;
  const szY = (safeZone.y / 100) * naturalHeight;
  const szW = Math.max(1, (safeZone.width / 100) * naturalWidth);
  const szH = Math.max(1, (safeZone.height / 100) * naturalHeight);
  const szCenterX = szX + szW / 2;
  const szCenterY = szY + szH / 2;

  // Maximum scale where the safe zone completely fits into (targetWidth, targetHeight)
  const maxScaleW = targetWidth / szW;
  const maxScaleH = targetHeight / szH;
  const maxSafeScale = Math.min(maxScaleW, maxScaleH);

  // Cover scale for the entire image
  const coverScale = Math.max(targetWidth / naturalWidth, targetHeight / naturalHeight);

  // If cover scale fits the safe zone, we can cover to fill background nicely.
  // Otherwise, scale down to maxSafeScale so safe zone is never clipped.
  const baseScale = Math.min(coverScale, maxSafeScale);

  // Apply user interactive zoom multiplier
  const finalScale = baseScale * Math.max(0.1, userZoom);

  // Rendered dimensions of the full image
  const renderedWidth = naturalWidth * finalScale;
  const renderedHeight = naturalHeight * finalScale;

  // Placement centering the safe zone at target center (targetWidth / 2, targetHeight / 2)
  const baseX = targetWidth / 2 - finalScale * szCenterX;
  const baseY = targetHeight / 2 - finalScale * szCenterY;

  // Relative coordinates of the safe zone within the format
  const szRenderedX = baseX + finalScale * szX;
  const szRenderedY = baseY + finalScale * szY;
  const szRenderedW = finalScale * szW;
  const szRenderedH = finalScale * szH;

  return {
    scale: finalScale,
    baseX,
    baseY,
    renderedWidth,
    renderedHeight,
    safeZoneRendered: {
      x: szRenderedX,
      y: szRenderedY,
      width: szRenderedW,
      height: szRenderedH,
    },
  };
}

/**
 * Checks if the safe zone is fully contained within the format boundaries
 * given additional user pan offsets (panX, panY).
 */
export function isSafeZoneFullyVisible(
  targetWidth: number,
  targetHeight: number,
  safeZoneRendered: { x: number; y: number; width: number; height: number },
  panX: number,
  panY: number
): boolean {
  const left = safeZoneRendered.x + panX;
  const right = left + safeZoneRendered.width;
  const top = safeZoneRendered.y + panY;
  const bottom = top + safeZoneRendered.height;

  // Small tolerance of 1px for floating point rounding
  return left >= -1 && right <= targetWidth + 1 && top >= -1 && bottom <= targetHeight + 1;
}
