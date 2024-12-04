document.addEventListener("DOMContentLoaded", () => {
    // Existing counter animation
    const counterElement = document.getElementById("counter");
    let count = 0;
    const target = 20000000;
    const duration = 10000; // Total duration of animation in milliseconds
    const increment = Math.ceil(target / (duration / 10)); // Increment based on 10ms intervals

    const updateCounter = () => {
        if (count < target) {
            count += increment;
            counterElement.textContent = count.toLocaleString();
            setTimeout(updateCounter, 10);
        } else {
            counterElement.textContent = target.toLocaleString();
        }
    };

    updateCounter();

    // Animations for "My Expertise" section
    const animateExpertiseSection = () => {
        // Scroll animation for counters
        const counters = document.querySelectorAll(".counter-value");
        const speed = 200;

        const animateCounters = () => {
            counters.forEach((counter) => {
                const updateCount = () => {
                    const target = +counter.getAttribute("data-target");
                    const count = +counter.innerText;

                    const increment = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + increment);
                        setTimeout(updateCount, 10);
                    } else {
                        counter.innerText = target;
                    }
                };

                updateCount();
            });
        };

        // Scroll animation for expertise items
        const expertiseItems = document.querySelectorAll(".expertise-item");
        const revealItems = () => {
            expertiseItems.forEach((item) => {
                const itemTop = item.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;

                if (itemTop < windowHeight - 50) {
                    item.classList.add("show");
                }
            });
        };

        // Trigger animations on scroll
        window.addEventListener("scroll", () => {
            animateCounters();
            revealItems();
        });

        // Initial animations
        revealItems();
    };

    animateExpertiseSection();
});

// Optional - Interactive Scripts can go here
console.log("Page Loaded Successfully");

// Spotify API functionality
const clientId = "03294dc5d87d49d7b5a906eca8f27c09"; // Replace with your Spotify Client ID
const clientSecret = "49aaf127d31e40d18c9fc313212663f1"; // Replace with your Spotify Client Secret

const countries = [
    { id: "spain", country: "ES" },
    { id: "argentina", country: "AR" },
    { id: "brazil", country: "BR" },
    { id: "usa", country: "US" },
    { id: "portugal", country: "PT" },
];

const fetchAccessToken = async () => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token;
};

const fetchTopTracks = async (token, countryCode) => {
    const response = await fetch(
        `https://api.spotify.com/v1/browse/categories/toplists/playlists?country=${countryCode}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();
    // Get the first playlist in the category
    const playlistId = data.playlists.items[0]?.id;

    if (playlistId) {
        const playlistResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const playlistData = await playlistResponse.json();
        return playlistData.items.map((item) => ({
            name: item.track.name,
            artist: item.track.artists[0].name,
        }));
    }

    return [];
};

const displayCharts = async () => {
    const token = await fetchAccessToken();

    countries.forEach(async ({ id, country }) => {
        const tracks = await fetchTopTracks(token, country);
        const listElement = document.querySelector(`#${id} .song-list`);

        tracks.slice(0, 100).forEach((track) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${track.name} - ${track.artist}`;
            listElement.appendChild(listItem);
        });
    });
};

displayCharts();

document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Get user input
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Construct mailto link
    const mailToLink = `mailto:example@email.com?subject=Message from ${name}&body=${encodeURIComponent(
        message
    )}%0A%0AContact Email: ${email}`;

    // Open email client
    window.location.href = mailToLink;
});


window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const menuLinks = document.querySelectorAll('nav ul li a');

    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (pageYOffset >= sectionTop - 50) {
            currentSection = section.getAttribute('id');
        }
    });

    menuLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(currentSection)) {
            link.classList.add('active');
        }
    });
});
