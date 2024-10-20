import { Client } from "@gradio/client";

export async function POST(req) {
    console.log("API route called");
    const { image, size } = await req.json();
    console.log("Received size:", size);

    try {
        console.log("Connecting to Gradio client");
        const client = await Client.connect("doevent/Face-Real-ESRGAN");
        console.log("Predicting with Gradio client");

        const imageBlob = await fetch(`data:image/png;base64,${image}`).then(
            (res) => res.blob()
        );

        const result = await client.predict("/predict", {
            image: imageBlob,
            size: size,
        });

        console.log("Prediction successful", result);

        if (
            Array.isArray(result.data) &&
            result.data.length > 0 &&
            result.data[0].url
        ) {
            return new Response(JSON.stringify({ result: result.data }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            throw new Error(
                "Unexpected result format: " + JSON.stringify(result.data)
            );
        }
    } catch (error) {
        console.error("Error in API route:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
