import { Image, createCanvas } from 'canvas';
import * as fs from 'fs';

async function loadImageUrl(url: string): Promise<Image> {
  const img = new Image();
  img.src = url;
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });
  return img;
}

async function drawImageToBuffer(args: { headUrl: string; bodyUrl: string }) {
  const width = 70;
  const height = 120;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  const head = await loadImageUrl(args.headUrl);
  const body = await loadImageUrl(args.bodyUrl);

  context.drawImage(body, 0, 42, 70, 70);
  context.drawImage(head, 0, 0, 70, 70);

  const buffer = canvas.toBuffer('image/png');
  return buffer;
}
async function imageBufferToFile(args: { imageBuffer: Buffer }) {
  fs.writeFileSync('./image.png', args.imageBuffer);
}

async function drawAmongus() {
  const width = 70;
  const height = 120;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  const amongus = await loadImageUrl('https://cdn.discordapp.com/emojis/944243756545232946.png');

  context.drawImage(amongus, 0, 0, 70, 70);

  const buffer = canvas.toBuffer('image/png');
  return buffer;
}

async function drawUserCharacter(args: { user: PoringUserProfile }) {
  const { gender, head, costume } = args.user.appearance;
  const headUrl = `https://kidmortal.sirv.com/heads/${gender}/${head}/front.png`;
  const bodyUrl = `https://kidmortal.sirv.com/bodys/${gender}/${costume}/front.png`;
  const buffer = await drawImageToBuffer({ bodyUrl, headUrl });
  imageBufferToFile({ imageBuffer: buffer });
  return buffer;
}

export const ImageDrawerService = {
  drawImageToBuffer,
  drawUserCharacter,
  drawAmongus,
};
