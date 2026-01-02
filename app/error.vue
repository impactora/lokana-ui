<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
    <div
        class="bg-background min-h-screen w-full flex flex-col items-center justify-center p-6 font-primary text-center overflow-hidden"
    >
        <h1
            class="text-[12rem] md:text-[18rem] leading-none font-bold text-[#FF0000] opacity-90 select-none tracking-tighter"
        >
            {{ error?.statusCode || "404" }}
        </h1>

        <div class="space-y-8 relative z-10 max-w-2xl">
            <div class="space-y-4">
                <h2 class="text-3xl md:text-4xl font-medium text-black">
                    Halaman Tidak Ditemukan
                </h2>
                <p class="text-secondary text-lg md:text-xl font-light">
                    Maaf, artefak digital yang Anda cari sepertinya tidak
                    tersedia atau telah dipindahkan dari museum ini.
                    <span
                        v-if="error?.message"
                        class="block mt-2 text-sm opacity-70"
                    >
                        (Error: {{ error.message }})
                    </span>
                </p>
            </div>

            <div>
                <UButton
                    @click="handleError"
                    class="py-4 px-10 text-white bg-[#FF0000] rounded-full hover:bg-black hover:text-white transition-all duration-300 text-lg font-medium shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                >
                    Kembali ke Beranda
                </UButton>
            </div>
        </div>

        <div
            class="absolute bottom-10 text-secondary text-sm font-light tracking-widest uppercase opacity-50"
        >
            Lokana Digital Museum
        </div>
    </div>
</template>
