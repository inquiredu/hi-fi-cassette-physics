"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMixtapeFromVibe = void 0;
const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
admin.initializeApp();
// Initialize Gemini API
// Note: In production, store the API key in Google Cloud Secret Manager or Firebase environment variables
// For this prototype, we'll try to read from process.env, or fallback to an empty string to allow deployment (and error appropriately later if missing)
const ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
exports.generateMixtapeFromVibe = functions.https.onCall(async (request) => {
    try {
        const { prompt } = request.data;
        if (!prompt) {
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "prompt".');
        }
        if (!process.env.GEMINI_API_KEY) {
            throw new functions.https.HttpsError('internal', 'Missing Gemini API Key in backend environment.');
        }
        // Step 1: Use Gemini to parse the vibe prompt into search parameters
        const schema = {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                searchQuery: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "A 1-3 word query combining genre and mood, optimized for searching an audio catalog (e.g. 'synthwave retro', 'lofi hiphop', 'ambient drive')"
                },
                mixtapeTitle: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "A cool, creative title for the mixtape based on the user's prompt"
                },
                tapeColor: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "A CSS hex color code that fits the mood of the prompt"
                },
                labelColor: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "A CSS hex color code (light) complementing the tapeColor"
                },
                accentColor: {
                    type: generative_ai_1.SchemaType.STRING,
                    description: "A bright CSS hex color code acting as an accent for the theme"
                }
            },
            required: ["searchQuery", "mixtapeTitle", "tapeColor", "labelColor", "accentColor"]
        };
        const model = ai.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const promptText = `The user wants a mixtape with this vibe: "${prompt}". Translate this vibe into search parameters for an API, and generate an aesthetic theme payload.`;
        const result = await model.generateContent(promptText);
        const responseText = result.response.text();
        const aiData = JSON.parse(responseText || '{}');
        const { searchQuery, mixtapeTitle, tapeColor, labelColor, accentColor } = aiData;
        if (!searchQuery) {
            throw new Error("Gemini failed to generate a valid search query.");
        }
        // Step 2: Query the free iTunes Search API using the search term
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=5`;
        const itunesRes = await fetch(itunesUrl);
        if (!itunesRes.ok) {
            throw new Error(`iTunes API failed: ${itunesRes.statusText}`);
        }
        const itunesData = await itunesRes.json();
        const results = itunesData.results || [];
        if (results.length === 0) {
            throw new functions.https.HttpsError('not-found', 'Could not find any tracks matching the generated vibe.');
        }
        // Step 3: Format the tracks to match our frontend interface
        const tracks = results.map((track, index) => {
            // Create a unique hash/slug for the track id
            const id = `t-${Date.now()}-${index}`;
            return {
                id,
                title: track.trackName || 'Unknown Title',
                artist: track.artistName || 'Unknown Artist',
                // iTunes previews are typically 30 seconds
                duration: 30,
                source: {
                    type: 'url',
                    url: track.previewUrl,
                }
            };
        });
        // Step 4: Return the cohesive mixtape data
        return {
            tracks,
            theme: {
                preset: 'retro', // Default fallback
                tapeColor,
                labelColor,
                accentColor,
                playerTemplate: 'boombox', // We will let them tweak this in UI
            },
            linerNotes: {
                title: mixtapeTitle,
                description: `An AI-curated selection based on: "${prompt}".`,
                notes: `Gemini generated the query [${searchQuery}] to find these tracks.`
            }
        };
    }
    catch (error) {
        console.error("Error generating mixtape:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate mixtape.', error.message);
    }
});
//# sourceMappingURL=index.js.map