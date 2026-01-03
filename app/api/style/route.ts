import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { image, stylePrompt } = await req.json();

    const prediction = await replicate.predictions.create({
      version: "98201389da440401d6706915124037f59d04588506e3e55e4e892c9431835775", // Flux Dev
      input: {
        image: image,
        prompt: `Editorial photography, ${stylePrompt} style. High resolution, professional color grading, sharp focus.`,
        prompt_strength: 0.15, // KEY: Only change 15% of the image to keep identity perfect
        guidance_scale: 3.5,
      },
    });

    const result = await replicate.wait(prediction);
    return NextResponse.json({ output: result.output });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
