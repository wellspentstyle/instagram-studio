import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { image, lightPrompt } = await req.json();

    const prediction = await replicate.predictions.create({
      version: "f066f0e0f3914a38186259f939768370126588267246b9a89608d0a84e60243e", // IC-Light
      input: {
        image: image,
        prompt: lightPrompt, // e.g., "Neon lighting from the left" or "Soft sunset glow"
        image_width: 1080,
        image_height: 1350,
      },
    });

    const result = await replicate.wait(prediction);
    // IC-Light output is often the first element of an array
    const finalUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    return NextResponse.json({ output: finalUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
