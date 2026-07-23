const movies = [
    {
        title: "Avengers: Endgame",
        platform: "Disney+",
        description: "After the devastating events of Infinity War, the universe is in ruins. The Avengers assemble once more in order to reverse Thanos' actions.",
        image: "https://image.tmdb.org/t/p/w500/or06DP3uL7vkALXoqUM2IGzOUs5.jpg",
        link: "https://www.disneyplus.com/"
    },
    {
        title: "Stranger Things",
        platform: "Netflix",
        description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
        image: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8Os2w2nFz.jpg",
        link: "https://www.netflix.com/"
    },
    {
        title: "The Boys",
        platform: "Amazon Prime",
        description: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
        image: "https://image.tmdb.org/t/p/w500/dzOxNtwzEQvtJUjUWpZ7OEE5Tf1.jpg",
        link: "https://www.primevideo.com/"
    }
];

const freeGames = [
    {
        title: "Cyberpunk 2077 (Free Weekend)",
        platform: "Steam",
        description: "An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
        image: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
        link: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/"
    },
    {
        title: "Grand Theft Auto V",
        platform: "Epic Games",
        description: "When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld...",
        image: "https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Fgrand-theft-auto-v%2Fhome%2FGTAV_EGS_Artwork_1920x1080_Hero-Carousel_V06-1920x1080-1503e4b1320d5652dd4f57466c8bcb79424b3fc0.jpg",
        link: "https://store.epicgames.com/en-US/p/grand-theft-auto-v"
    }
];

module.exports = {
    getMockMovie: () => movies[Math.floor(Math.random() * movies.length)],
    getMockFreeGame: () => freeGames[Math.floor(Math.random() * freeGames.length)]
};
