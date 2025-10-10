// src/lib/ai-webllm.js
import { CreateMLCEngine } from "@mlc-ai/web-llm";

let enginePromise;

/**
 * Initialize (singleton). Pick a small, fast model first.
 * Other options:
 *  - "Llama-3.2-1B-Instruct-q4f16_1-MLC" (tiny, fastest)
 *  - "Llama-3.2-3B-Instruct-q4f16_1-MLC" (better quality, larger)
 */
export function initLLM(onProgress) {
    if (!enginePromise) {
        enginePromise = CreateMLCEngine(
            "Llama-3.2-1B-Instruct-q4f16_1-MLC",
            {
                // WebGPU preferred; falls back to WASM automatically.
                initProgressCallback: (p) => onProgress?.(p?.text ?? ""),
            }
        );
    }
    return enginePromise;
}

/**
 * Stream a chat completion from WebLLM.
 * Yields incremental text chunks.
 */
export async function* webllmChat(engine, messages) {
    const stream = await engine.chat.completions.create({
        messages,
        stream: true,
    });

    for await (const chunk of stream) {
        const delta = chunk?.choices?.[0]?.delta?.content ?? "";
        if (delta) yield delta;
    }
}
