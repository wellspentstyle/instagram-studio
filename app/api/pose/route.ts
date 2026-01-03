import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    if (!image) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // This model (Flux ControlNet Canny) is the best for 'Locking' your outfit
    const prediction = await replicate.predictions.create({
      version: "06d330d3248866f8e58df18182f80c6c06a880757ef0c53d9e8439df67645d9e", // Flux Canny
      input: {
        control_image: image,
        prompt: `A high-end editorial photo of the same person. Exactly the same face, exactly the same outfit. Pose: ${prompt}. Cinematic lighting, 8k resolution, highly detailed fabric textures.`,
        conditioning_scale: 0.8, // This tells the AI: "Stay very close to the original outfit lines"
        num_inference_steps: 28,
        guidance_scale: 3.5,
      },
    });

    // We wait for the AI to finish (usually 10-20 seconds)
    const result = await replicate.wait(prediction);

    return NextResponse.json({ output: result.output });
  } catch (error: any) {
    console.error("Replicate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
