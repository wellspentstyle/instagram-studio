import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { image, bgImage } = await req.json();

    // Model: Background Replacement / Inpainting
    const prediction = await replicate.predictions.create({
      version: "0a0d927d3372c035612306f977c071d0590a55280c44c106a3626dfd74d20914", // Specialized Background Swap
      input: {
        main_image: image,
        background_image: bgImage,
        prompt: "Perfectly integrate the person into the new background, matching shadows and perspective.",
        unsharp_mask: 0.5,
      },
    });

    const result = await replicate.wait(prediction);
    return NextResponse.json({ output: result.output });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
