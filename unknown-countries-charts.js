class UnknownCountriesCharts {
    constructor() {
        this.SPOTIFY_CONFIG = {
            CLIENT_ID: 'a1ca6c7d5e864802ae0afae6b0c21d7b',
            CLIENT_SECRET: '3948ffaec6ba47beb10c87ac0d6cfb57',
            TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
            API_ENDPOINT: 'https://api.spotify.com/v1'
        };

        this.UNKNOWN_COUNTRIES = [
            { id: 'estonia', name: 'Estonia' },
            { id: 'latvia', name: 'Latvia' },
            { id: 'lithuania', name: 'Lithuania' },
            { id: 'slovenia', name: 'Slovenia' },
            { id: 'macedonia', name: 'North Macedonia' },
            { id: 'montenegro', name: 'Montenegro' },
            { id: 'moldova', name: 'Moldova' },
            { id: 'armenia', name: 'Armenia' },
            { id: 'georgia', name: 'Georgia' },
            { id: 'albania', name: 'Albania' }
        ];

        this.accessToken = null;
        this.currentSlide = 0;
        this.slidesData = [];
        this.container = document.getElementById('unknown-charts-slider');
        this.dotsContainer = document.getElementById('unknown-charts-dots');
    }

    async initialize() {
        await this.getAccessToken();
        await this.loadAllCharts();
        this.setupNavigation();
        this.createDots();
        this.showSlide(0);
        this.startAutoSlide();
    }

    async getAccessToken() {
        const auth = btoa(`${this.SPOTIFY_CONFIG.CLIENT_ID}:${this.SPOTIFY_CONFIG.CLIENT_SECRET}`);
        try {
            const response = await fetch(this.SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });
            const data = await response.json();
            this.accessToken = data.access_token;
        } catch (error) {
            console.error('Error getting access token:', error);
        }
    }

    async searchPlaylist(country) {
        const response = await fetch(
            `${this.SPOTIFY_CONFIG.API_ENDPOINT}/search?q=Top+50+${country}&type=playlist&limit=1`,
            {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            }
        );
        const data = await response.json();
        return data.playlists.items[0];
    }

    async getPlaylistTracks(playlistId) {
        const response = await fetch(
            `${this.SPOTIFY_CONFIG.API_ENDPOINT}/playlists/${playlistId}/tracks?limit=10`,
            {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            }
        );
        return await response.json();
    }

    async loadAllCharts() {
       
        this.container.innerHTML = `
            <div class="w-full flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        `;

        for (const country of this.UNKNOWN_COUNTRIES) {
            try {
                const playlist = await this.searchPlaylist(country.name);
                if (playlist) {
                    const tracks = await this.getPlaylistTracks(playlist.id);
                    this.slidesData.push({
                        country: country,
                        tracks: tracks.items
                    });
                }
            } catch (error) {
                console.error(`Error loading chart for ${country.name}:`, error);
            }
        }
        this.renderSlides();
    }

    renderSlides() {
        this.container.innerHTML = this.slidesData.map((slide, index) => `
            <div class="flex-none w-full transform transition-all duration-500">
                <div class="bg-white rounded-lg shadow-lg p-6 mx-4">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-indigo-600">${slide.country.name}</h3>
                        <span class="text-sm text-gray-500">Top 10 Tracks</span>
                    </div>
                    <div class="space-y-4">
                        ${slide.tracks.map((item, trackIndex) => `
                            <div class="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded transition-colors duration-200">
                                <span class="text-lg font-bold text-gray-500 w-8">${trackIndex + 1}</span>
                                <img src="${item.track.album.images[2].url}" 
                                     alt="${item.track.name}" 
                                     class="w-12 h-12 rounded shadow">
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-medium truncate">${item.track.name}</h4>
                                    <p class="text-sm text-gray-600 truncate">
                                        ${item.track.artists.map(artist => artist.name).join(', ')}
                                    </p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupNavigation() {
        document.getElementById('prev-unknown').addEventListener('click', () => {
            this.stopAutoSlide();
            this.prevSlide();
        });
        
        document.getElementById('next-unknown').addEventListener('click', () => {
            this.stopAutoSlide();
            this.nextSlide();
        });

        this.container.parentElement.addEventListener('mouseleave', () => {
            this.startAutoSlide();
        });
    }

    createDots() {
        this.dotsContainer.innerHTML = this.slidesData.map((_, index) => `
            <button class="w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-200" 
                    data-slide="${index}">
            </button>
        `).join('');

        this.dotsContainer.addEventListener('click', (e) => {
            if (e.target.matches('button')) {
                this.stopAutoSlide();
                const slideIndex = parseInt(e.target.dataset.slide);
                this.showSlide(slideIndex);
            }
        });
    }

    showSlide(index) {
        this.currentSlide = index;
        this.container.style.transform = `translateX(-${index * 100}%)`;
        
       
        const dots = this.dotsContainer.children;
        Array.from(dots).forEach((dot, i) => {
            dot.classList.toggle('bg-indigo-600', i === index);
            dot.classList.toggle('bg-gray-300', i !== index);
        });
    }

    nextSlide() {
        this.showSlide((this.currentSlide + 1) % this.slidesData.length);
    }

    prevSlide() {
        this.showSlide((this.currentSlide - 1 + this.slidesData.length) % this.slidesData.length);
    }

    startAutoSlide() {
        this.stopAutoSlide(); // Clear any existing interval
        this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const unknownCharts = new UnknownCountriesCharts();
    unknownCharts.initialize();
});