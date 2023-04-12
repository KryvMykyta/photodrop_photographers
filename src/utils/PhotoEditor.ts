import sharp from "sharp";
import fs from "fs";

export class PhotoEditor {
  public resizePicture = async (bufferImage: Buffer) => {
    const resizedPhoto = await sharp(bufferImage).resize(200, 200).toBuffer();
    return resizedPhoto;
  };

  public addWatermark = async (bufferImage: Buffer) => {
    const watermarkPhoto = await sharp(bufferImage)
      .composite([{ input: "water.png", tile: true,  }])
      .toBuffer();
    return watermarkPhoto;
  };

  public createPackToLoad = async (base64image: string) => {
    const bufferImage = Buffer.from(
      base64image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = base64image.split(";")[0].split("/")[1];
    const watermarked = await this.addWatermark(bufferImage);
    const resized = await this.resizePicture(bufferImage);
    const watermarkResized = await this.resizePicture(watermarked);
    return {
      type,
      photos: [
        {
            buffer: bufferImage,
            keyAdd: ""
        },
        {
            buffer: watermarked,
            keyAdd: "_water"
        },
        {
            buffer: resized,
            keyAdd: "_resize"
        },
        {
            buffer: watermarkResized,
            keyAdd: "_water_resize"
        }
    ],
    };
  };
}
