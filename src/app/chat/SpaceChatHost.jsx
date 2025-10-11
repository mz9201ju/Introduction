import { lazy, Suspense } from "react";
const SpaceChatWebLLM = lazy(() => import("@shared/SpaceChatWebLLM"));

export default function SpaceChatHost() {
    // Keep this isolated so AppShell stays tiny and predictable.
    return (
        <Suspense fallback={null}>
            <SpaceChatWebLLM />
        </Suspense>
    );
}
