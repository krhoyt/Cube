//
//  IMPORTANT: READ BEFORE DOWNLOADING, COPYING, INSTALLING OR USING.
//
//  By downloading, copying, installing or using the software you agree to this license.
//  If you do not agree to this license, do not download, install,
//  copy or use the software.
//
//
//                           License Agreement
//                For Open Source Computer Vision Library
//
// Copyright (C) 2000, Intel Corporation, all rights reserved.
// Copyright (C) 2013, OpenCV Foundation, all rights reserved.
// Copyright (C) 2014, Itseez, Inc, all rights reserved.
// Third party copyrights are property of their respective owners.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
//   * Redistribution's of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//
//   * Redistribution's in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//
//   * The name of the copyright holders may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
// This software is provided by the copyright holders and contributors "as is" and
// any express or implied warranties, including, but not limited to, the implied
// warranties of merchantability and fitness for a particular purpose are disclaimed.
// In no event shall the Intel Corporation or contributors be liable for any direct,
// indirect, incidental, special, exemplary, or consequential damages
// (including, but not limited to, procurement of substitute goods or services;
// loss of use, data, or profits; or business interruption) however caused
// and on any theory of liability, whether in contract, strict liability,
// or tort (including negligence or otherwise) arising in any way out of
// the use of this software, even if advised of the possibility of such damage.

// Adapted from https://github.com/opencv/opencv/blob/d5323ce8482cd510f6d49c0e7336748c6aee4a61/modules/imgproc/src/hough.cpp#L415

function probabilisticHoughTransform(
  edgeImg,
  colCount,
  rowCount,
  rho,
  theta,
  threshold,
  lineLength,
  lineGap,
  linesMax
) {
  const lines = [];
  const numAngleCells = Math.round(Math.PI / theta);
  const numrho = Math.round(((colCount + rowCount) * 2 + 1) / rho);

  const accum = new Array(numAngleCells);
  const mask = new Array(colCount * rowCount);
  const nonZeroPoints = [];

  const cosTable = new Array(numAngleCells);
  const sinTable = new Array(numAngleCells);
  for (let targetIndex = 0; targetIndex < numAngleCells; targetIndex++) {
    cosTable[targetIndex] = Math.cos(targetIndex * theta) / rho;
    sinTable[targetIndex] = Math.sin(targetIndex * theta) / rho;
  }

  // stage 1. collect non-zero image points
  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < colCount; x++) {
      if (edgeImg[x + y * colCount]) {
        nonZeroPoints.push([x, y]);
        mask[x + y * colCount] = 1;
      } else {
        mask[x + y * colCount] = 0;
      }
    }
  }

  // Shuffle the array randomly
  shuffleArray(nonZeroPoints);

  // stage 2. process all the points in random order
  for (let index = nonZeroPoints.length - 1; index >= 0; index--) {
    const [col, row] = nonZeroPoints[index];

    // check if it has been excluded already (i.e. belongs to some other line)
    if (!mask[row * colCount + col]) {
      continue;
    }

    let maxVal = threshold - 1;
    let maxThetaIndex = 0;
    // update accumulator, find the most probable line
    for (let thetaIndex = 0; thetaIndex < numAngleCells; thetaIndex++) {
      let rho = Math.round(
        col * cosTable[thetaIndex] + row * sinTable[thetaIndex]
      );
      rho += (numrho - 1) / 2;

      if (!accum[thetaIndex]) {
        accum[thetaIndex] = [];
      }
      if (!accum[thetaIndex][rho]) {
        accum[thetaIndex][rho] = 1;
      } else {
        accum[thetaIndex][rho]++;
      }
      const val = accum[thetaIndex][rho];

      if (maxVal < val) {
        maxVal = val;
        maxThetaIndex = thetaIndex;
      }
    }

    // if it is too "weak" candidate, continue with another point
    if (maxVal < threshold) continue;

    // from the current point walk in each direction
    // along the found line and extract the line segment
    const lineEnds = new Array(2);
    const shift = 16;
    const a = -sinTable[maxThetaIndex];
    const b = cosTable[maxThetaIndex];
    let x0 = col;
    let y0 = row;
    let dx0;
    let dy0;
    let isWalkingX;
    if (Math.abs(a) > Math.abs(b)) {
      isWalkingX = true;
      dx0 = a > 0 ? 1 : -1;
      dy0 = Math.round(b * (1 << shift) / Math.abs(a));
      y0 = (y0 << shift) + (1 << (shift - 1));
    } else {
      isWalkingX = false;
      dy0 = b > 0 ? 1 : -1;
      dx0 = Math.round(a * (1 << shift) / Math.abs(b));
      x0 = (x0 << shift) + (1 << (shift - 1));
    }

    for (let k = 0; k < 2; k++) {
      let gap = 0;
      let x = x0;
      let y = y0;
      let dx = dx0;
      let dy = dy0;

      // Walk in the opposite direction for the second point
      if (k > 0) {
        dx = -dx;
        dy = -dy;
      }

      // walk along the line using fixed-point arithmetics,
      for (; ; (x += dx), (y += dy)) {
        let i1, j1;

        if (isWalkingX) {
          j1 = x;
          i1 = y >> shift;
        } else {
          j1 = x >> shift;
          i1 = y;
        }

        // stop at the image border or in case of too big gap
        if (j1 < 0 || j1 >= colCount || i1 < 0 || i1 >= rowCount) {
          break;
        }

        // for each non-zero point:
        //    update line end,
        //    clear the mask element
        //    reset the gap
        if (mask[i1 * colCount + j1]) {
          gap = 0;
          lineEnds[k] = [j1, i1]; // x, y of kth point
        } else if (++gap > lineGap) {
          break;
        }
      }
    }

    const goodLine =
      Math.abs(lineEnds[1][0] - lineEnds[0][0]) >= lineLength ||
      Math.abs(lineEnds[1][1] - lineEnds[0][1]) >= lineLength;

    for (let k = 0; k < 2; k++) {
      let x = x0;
      let y = y0;
      let dx = dx0;
      let dy = dy0;

      if (k > 0) {
        dx = -dx;
        dy = -dy;
      }

      // walk along the line using fixed-point arithmetics,
      // stop at the image border or in case of too big gap
      for (; ; (x += dx), (y += dy)) {
        let i1, j1;

        if (isWalkingX) {
          j1 = x;
          i1 = y >> shift;
        } else {
          j1 = x >> shift;
          i1 = y;
        }

        // for each non-zero point:
        //    update line end,
        //    clear the mask element
        //    reset the gap
        if (mask[i1 * colCount + j1]) {
          if (goodLine) {
            // Since we decided on this line as authentic, remove this pixel's
            // weights for all possible angles from the accumulator array
            for (let thetaIndex = 0; thetaIndex < numAngleCells; thetaIndex++) {
              let rho = Math.round(
                j1 * cosTable[thetaIndex] + i1 * sinTable[thetaIndex]
              );
              rho += (numrho - 1) / 2;
              if (accum[thetaIndex] && accum[thetaIndex][rho]) {
                accum[thetaIndex][rho]--;
              }
            }
          }

          mask[i1 * colCount + j1] = 0;
        }

        if (i1 === lineEnds[k][1] && j1 === lineEnds[k][0]) break;
      }
    }

    if (goodLine) {
      lines.push([
        {
          x: lineEnds[0][0],
          y: lineEnds[0][1],
        },
        {
          x: lineEnds[1][0],
          y: lineEnds[1][1],
        },
      ]);

      if (lines.length >= linesMax) {
        return lines;
      }
    }
  }

  return lines;
}

// Randomize array element order in-place.
// Using Durstenfeld shuffle algorithm.
// source: https://stackoverflow.com/a/12646864/1601953
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
