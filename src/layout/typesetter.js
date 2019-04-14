import * as R from 'ramda';

import copyRect from '../rect/copy';
import cropRect from '../rect/crop';
import layoutParagraph from './layoutParagraph';

/**
 * Get paragrpah block height
 *
 * @param  {Object}  paragraph block
 * @return {number} paragraph block height
 */
const blockHeight = R.compose(
  R.sum,
  R.map(R.prop('height')),
  R.pluck('box')
);

/**
 * Slice block at given height
 *
 * @param  {number}  height
 * @param  {Object}  paragraph block
 * @return {number} sliced paragraph block
 */
const sliceBlockAtHeight = (height, block) => {
  const newBlock = [];

  let counter = 0;
  for (const line of block) {
    counter += line.box.height;

    if (counter < height) {
      newBlock.push(line);
    } else {
      break;
    }
  }

  return newBlock;
};

/**
 * Layout paragraphs inside container until it does not
 * fit anymore, performing line wrapping in the process.
 *
 * @param  {Object}  engines
 * @param  {Object}  layout options
 * @param  {Object}  container rect
 * @param  {Object}  attributed strings (paragraphs)
 * @return {Array} paragraph blocks
 */
const typesetter = (engines, options, container, attributedStrings) => {
  const blocks = [];
  const paragraphs = [...attributedStrings];

  let paragraphRect = copyRect(container);
  let nextParagraph = paragraphs.shift();

  while (nextParagraph) {
    const block = layoutParagraph(engines, options)(paragraphRect, nextParagraph);
    const linesHeight = blockHeight(block);

    if (paragraphRect.height >= linesHeight) {
      blocks.push(block);
      paragraphRect = cropRect(linesHeight, paragraphRect);
      nextParagraph = paragraphs.shift();
    } else {
      blocks.push(sliceBlockAtHeight(paragraphRect.height, block));
      break;
    }
  }

  return blocks;
};

export default R.curryN(4, typesetter);
