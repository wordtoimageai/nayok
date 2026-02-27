/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + (textFeedback ? `The model responded with text: "${textFeedback}"` : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
    throw new Error(errorMessage);
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-3.1-flash-image-preview';

export const generateModelImage = async (userImage: File): Promise<string> => {
    const userImagePart = await fileToPart(userImage);
    const prompt = "You are a world-class fashion photographer and digital artist. Transform the person in this image into a high-end, full-body fashion model photo. The background should be a clean, sophisticated studio setting with a soft, cinematic background blur (bokeh) to isolate the model. Use professional lighting. Preserve the person's exact facial identity, unique features, and body proportions with 100% accuracy. Place them in a natural, confident standing pose. The final image must be ultra-photorealistic, with high-fidelity textures and professional color grading. Return ONLY the final image.";
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [userImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            imageConfig: {
                imageSize: "2K",
                aspectRatio: "3:4"
            }
        },
    });
    return handleApiResponse(response);
};

export const generateVirtualTryOnImage = async (
    modelImageUrl: string, 
    itemImage: File, 
    category: 'garment' | 'hat' | 'sunglasses' | 'bag' | 'accessory' = 'garment'
): Promise<string> => {
    const modelImagePart = dataUrlToPart(modelImageUrl);
    const itemImagePart = await fileToPart(itemImage);
    
    const garmentPrompt = `You are a world-class digital fashion compositor and lighting specialist. You are given a 'model image' and a 'garment image'. Your task is to create an ultra-photorealistic, high-fidelity image where the person from the 'model image' is wearing the clothing from the 'garment image'.

**Advanced Realism Requirements:**
1.  **Micro-Textural Fidelity:** Render the garment with extreme detail. Capture the specific weave of the fabric, individual threads, stitching patterns, and surface textures.
2.  **Environmental Lighting Coherence:** Perform a full global illumination match. The garment must reflect the exact color temperature, directionality, and intensity of the light in the 'model image'.
3.  **Cinematic Isolation:** Apply a sophisticated, shallow depth-of-field effect. The background should have a soft, natural blur (bokeh) to further isolate the model and the outfit, making it the primary focus.
4.  **Anatomical Shadowing & Occlusion:** Generate deep, realistic ambient occlusion shadows where the fabric meets the skin or folds over itself.
5.  **Dynamic Draping & Tension:** The garment must react to the model's pose with realistic tension lines and gravity-based draping.
6.  **Identity Preservation:** The model's facial features and hair must remain 100% unchanged.
7.  **Output:** Return ONLY the final, 2K resolution edited image.`;

    const hatPrompt = `You are a world-class digital fashion compositor. Add the hat from the 'accessory image' to the person in the 'model image'.
1. **Anatomical Fit:** The hat must sit realistically on the head, following the curvature and interacting with the hair.
2. **Cinematic Isolation:** Apply a soft background blur (bokeh) to isolate the model and the accessory.
3. **Lighting:** Match the scene's lighting perfectly, including shadows cast by the brim onto the model's face.
4. **Material:** Render the hat's material (felt, straw, wool) with high-fidelity texture.
5. **Output:** Return ONLY the final, 2K resolution image.`;

    const sunglassesPrompt = `You are a world-class digital fashion compositor. Add the sunglasses from the 'accessory image' to the person in the 'model image'.
1. **Anatomical Fit:** Place the sunglasses perfectly on the bridge of the nose and behind the ears.
2. **Cinematic Isolation:** Apply a soft background blur (bokeh) to isolate the model and the accessory.
3. **Reflections:** The lenses should show realistic reflections of the environment.
4. **Shadows:** Cast subtle, realistic shadows on the model's face.
5. **Output:** Return ONLY the final, 2K resolution image.`;

    const bagPrompt = `You are a world-class digital fashion compositor. Add the bag from the 'accessory image' to the person in the 'model image'.
1. **Interaction:** The model should be realistically holding the bag or wearing it. Show realistic hand-grip or strap tension.
2. **Cinematic Isolation:** Apply a soft background blur (bokeh) to isolate the model and the accessory.
3. **Physics:** The bag should show realistic weight and drape.
4. **Lighting:** Match the scene's lighting and cast realistic contact shadows.
5. **Output:** Return ONLY the final, 2K resolution image.`;

    const genericAccessoryPrompt = `You are a world-class digital fashion compositor and lighting specialist. You are given a 'model image' and an 'accessory image'. Your task is to create an ultra-photorealistic image where the person from the 'model image' is wearing or holding the accessory.

**Advanced Realism Requirements:**
1.  **Material Interaction:** Render materials with accurate Fresnel reflections and environmental mapping.
2.  **Cinematic Isolation:** Apply a soft background blur (bokeh) to isolate the model and the accessory.
3.  **Contact Realism:** Ensure the accessory interacts perfectly with the model's body. 
4.  **Lighting Integration:** The accessory must be lit identically to the model.
5.  **Output:** Return ONLY the final, 2K resolution edited image.`;

    let prompt = garmentPrompt;
    if (category === 'hat') prompt = hatPrompt;
    else if (category === 'sunglasses') prompt = sunglassesPrompt;
    else if (category === 'bag') prompt = bagPrompt;
    else if (category === 'accessory') prompt = genericAccessoryPrompt;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [modelImagePart, itemImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            imageConfig: {
                imageSize: "2K",
                aspectRatio: "3:4"
            }
        },
    });
    return handleApiResponse(response);
};

export const generatePoseVariation = async (tryOnImageUrl: string, poseInstruction: string): Promise<string> => {
    const tryOnImagePart = dataUrlToPart(tryOnImageUrl);
    const prompt = `You are a world-class fashion photographer and digital artist. Take this image and regenerate it from a different perspective with ultra-high fidelity. The person, clothing, and background style must remain 100% identical, including the cinematic background blur (bokeh). The new perspective should be: "${poseInstruction}". Ensure the lighting and textures are preserved perfectly in the new pose. Return ONLY the final image.`;
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [tryOnImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            imageConfig: {
                imageSize: "2K",
                aspectRatio: "3:4"
            }
        },
    });
    return handleApiResponse(response);
};