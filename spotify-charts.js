// Spotify API Configuration
const SPOTIFY_CONFIG = {
    CLIENT_ID: 'a1ca6c7d5e864802ae0afae6b0c21d7b',
    CLIENT_SECRET: '3948ffaec6ba47beb10c87ac0d6cfb57',
    TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
    API_ENDPOINT: 'https://api.spotify.com/v1'
};

const COUNTRIES = [
    { id: 'nigeria', name: 'Nigeria', searchTerm: 'Top Songs in Nigeria' },
    { id: 'usa', name: 'USA', searchTerm: 'United States Top Songs' },
    { id: 'uk', name: 'UK', searchTerm: 'UK trending songs' },
    { id: 'south-africa', name: 'South Africa', searchTerm: 'South Africa Top Songs' },
    { id: 'brazil', name: 'Brazil', searchTerm: 'Brazil Top Songs' }
];


class SpotifyCharts {
    constructor() {
        this.accessToken = null;
        this.currentSlide = 0;
        this.slidesData = [];
        this.slideInterval = null;
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
        const auth = btoa(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`);
        try {
            const response = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
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
        try {
            const response = await fetch(
                `${SPOTIFY_CONFIG.API_ENDPOINT}/search?q=${encodeURIComponent(country.searchTerm)}&type=playlist&limit=1`,
                {
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }
            );
            const data = await response.json();
            //const data = datas.playlists?.items?.filter(item => item !== null) || [];
            
            if (!data.playlists || !data.playlists.items.length) {
                console.error(`No playlist found for ${country.name}`);
                return null;
            }
            
            return data.playlists.items[0];
        } catch (error) {
            console.error(`Error searching playlist for ${country.name}:`, error);
            return null;
        }
    }

    async getPlaylistTracks(playlistId) {
        try {
            const response = await fetch(
                `${SPOTIFY_CONFIG.API_ENDPOINT}/playlists/${playlistId}/tracks?limit=20`, 
                {
                    headers: { 'Authorization': `Bearer ${this.accessToken}` }
                }
            );
            const data = await response.json();
            
            if (!data.items) {
                throw new Error('No tracks found in playlist');
            }
            
            
            const validTracks = data.items
                .filter(item => item.track && item.track.name)
                .slice(0, 20);
            
            return { items: validTracks };
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            return { items: [] };
        }
    }

    async loadAllCharts() {
        const container = document.getElementById('main-charts-slider');
        

        container.innerHTML = `
            <div class="w-full flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        `;

        const promises = COUNTRIES.map(async country => {
            try {
                const playlist = await this.searchPlaylist(country);
                if (playlist) {
                    const tracks = await this.getPlaylistTracks(playlist.id);
                    if (tracks.items.length > 0) {
                        return {
                            country: country,
                            tracks: tracks.items
                        };
                    }
                }
                return null;
            } catch (error) {
                console.error(`Error loading chart for ${country.name}:`, error);
                return null;
            }
        });

       
        const results = await Promise.all(promises);
        this.slidesData = results.filter(result => result !== null);

        if (this.slidesData.length > 0) {
            this.renderSlides();
            console.log(`Loaded charts for ${this.slidesData.length} countries`);
            this.slidesData.forEach(slide => {
                console.log(`${slide.country.name}: ${slide.tracks.length} tracks`);
            });
        } else {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-red-600">Unable to load charts. Please try again later.</p>
                </div>
            `;
        }
    }

    renderSlides() {
        const container = document.getElementById('main-charts-slider');
        container.innerHTML = this.slidesData.map((slide, index) => `
            <div class="flex-none w-full transform transition-all duration-500">
                <div class="bg-white rounded-lg shadow-lg p-6 mx-4">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-2xl font-bold text-indigo-600">${slide.country.name}</h3>
                        <span class="text-sm text-gray-500">Top Charts</span>
                    </div>
                    <div class="space-y-4 max-h-[600px] overflow-y-auto">
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
        document.getElementById('prev-main').addEventListener('click', () => {
            this.stopAutoSlide();
            this.prevSlide();
        });
        
        document.getElementById('next-main').addEventListener('click', () => {
            this.stopAutoSlide();
            this.nextSlide();
        });

        
        document.getElementById('main-charts-slider').parentElement.addEventListener('mouseleave', () => {
            this.startAutoSlide();
        });
    }

    createDots() {
        const dotsContainer = document.getElementById('main-charts-dots');
        dotsContainer.innerHTML = this.slidesData.map((_, index) => `
            <button class="w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors duration-200" 
                    data-slide="${index}">
            </button>
        `).join('');

        dotsContainer.addEventListener('click', (e) => {
            if (e.target.matches('button')) {
                this.stopAutoSlide();
                const slideIndex = parseInt(e.target.dataset.slide);
                this.showSlide(slideIndex);
            }
        });
    }

    showSlide(index) {
        this.currentSlide = index;
        const slider = document.getElementById('main-charts-slider');
        slider.style.transform = `translateX(-${index * 100}%)`;
        
       
        const dots = document.getElementById('main-charts-dots').children;
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
        this.stopAutoSlide(); 
        this.slideInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const spotifyCharts = new SpotifyCharts();
    spotifyCharts.initialize();
});