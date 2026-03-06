export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                display: ["'IM Fell English'", "Georgia", "serif"],
                hand: ["'Caveat'", "cursive"],
            },
            colors: {
                void: "#0C0C0C",
                ink: "#1A6BFF",
                paper: "#F5F2ED",
                draft: "#3A3A3A",
            },
        },
    },
    plugins: [],
}