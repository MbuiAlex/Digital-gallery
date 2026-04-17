let artworks = [];


function loadArtworks() {
    const savedArtworks = localStorage.getItem('artworks');
    if (savedArtworks) {
        artworks = JSON.parse(savedArtworks);
    }
}

function saveArtworks() {
    localStorage.setItem('artworks', JSON.stringify(artworks));
}


function displayArtworks() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    if (artworks.length === 0) {
        gallery.innerHTML = `
            <p class="text-center text-gray-500 py-12 text-lg">
                No artworks yet.<br>
                Upload your own or click "Load Popular Artworks"
            </p>`;
        return;
    }

    artworks.forEach((artwork, index) => {
        const artCard = document.createElement('div');
        artCard.className = 'border rounded-lg overflow-hidden shadow-lg p-1 bg-white';
        artCard.innerHTML = `
            <img src="${artwork.image}" alt="${artwork.title}" 
                 class="w-full h-56 object-cover rounded-md">
            <h3 class="text-lg font-semibold mt-3">${artwork.title}</h3>
            <p class="text-gray-600 text-sm mt-1">by ${artwork.artist}</p>
            
            `;
            
        gallery.appendChild(artCard);
    });
}


function displayError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.classList.remove('hidden');
        errorDiv.textContent = message;
        setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    }
}

async function fetchPopularArtworks() {
    try {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '<p class="text-center text-gray-500 py-8">Loading beautiful artworks...</p>';

        const response = await fetch(
            'https://collectionapi.metmuseum.org/public/collection/v1/search?q=digital+art&hasImages=true&limit=30'
        );

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        if (!data.objectIDs || data.objectIDs.length === 0) {
            throw new Error('No artworks found');
        }

        const objectIDs = data.objectIDs.slice(0, 10);

        const promises = objectIDs.map(id => 
            fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`).then(r => r.json())
        );

        const results = await Promise.all(promises);

        const newArtworks = results
            .filter(obj => obj && obj.primaryImageSmall)
            .map(obj => ({
                title: obj.title || "Untitled Digital Art",
                artist: obj.artistDisplayName || "Unknown Artist",
                image: obj.primaryImageSmall
            }));

        artworks = [...artworks, ...newArtworks];
        saveArtworks();
        displayArtworks();

    } catch (error) {
        console.error(error);
        displayError("Could not load artworks from API. Showing sample data instead.");

        if (artworks.length === 0) {
            artworks = [
                { title: "Cyber Neon Dreams", artist: "NeoKairo", image: "https://picsum.photos/id/1015/800/600" },
                { title: "Floating Digital Islands", artist: "PixelWhisper", image: "https://picsum.photos/id/201/800/600" },
                { title: "Abstract Code Rain", artist: "MatrixArt", image: "https://picsum.photos/id/237/800/600" }
            ];
            saveArtworks();
            displayArtworks();
        }
    }
}


document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('art-title').value.trim();
    const artist = document.getElementById('artist-name').value.trim();
    const image = document.getElementById('art-image').value.trim();

    if (!title || !artist || !image) {
        alert("Please fill in all fields");
        return;
    }

    artworks.push({ title, artist, image });
    saveArtworks();
    displayArtworks();

    this.reset();
    alert("✅ Artwork uploaded successfully!");
});


document.getElementById('fetch-artworks').addEventListener('click', fetchPopularArtworks);


window.onload = function() {
    loadArtworks();
    displayArtworks();
};

