<script setup lang="ts"></script>

<template>
    <div
        class="bg-background h-screen flex flex-col text-black overflow-hidden"
    >
        <div class="max-w-7xl mx-auto w-full h-full flex flex-col p-6">
            <header class="shadow-md inset-shadow-xs p-4 shrink-0 mb-4">
                Lokana
            </header>

            <div class="loading-overlay" id="loadingOverlay"></div>

            <div class="w-full flex flex-1 items-start gap-4 min-h-0 px-2">
                <aside id="sidebar" class="w-85 h-full overflow-hidden">
                    <SideBar />
                </aside>

                <main
                    class="flex-1 h-full overflow-y-auto rounded-xl border border-gray-200 p-4"
                >
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>
