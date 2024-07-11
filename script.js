document.addEventListener("DOMContentLoaded", function () {
  const playlistItems = document.getElementById("playlist-items");
  const playButton = document.getElementById("play-button");
  const prevButton = document.getElementById("prev-button");
  const nextButton = document.getElementById("next-button");
  const volumeControl = document.getElementById("volume-control");
  const loadFilesButton = document.getElementById("load-files-button");
  const searchInput = document.getElementById("search-input");
  const categoryItems = document.getElementById("category-items");

  const currentTrackTitle = document.getElementById("current-track-title");
  const currentTrackImage = document.getElementById("current-track-image");
  const progressBar = document.getElementById("progress-bar");
  const currentTime = document.getElementById("current-time");
  const totalTime = document.getElementById("total-time");

  let currentTrackIndex = 0;
  let isPlaying = false;
  let playlist = [];
  let categories = {};
  const audio = new Audio();

  async function loadFiles() {
      try {
          const dirHandle = await window.showDirectoryPicker();
          console.log("Directory selected:", dirHandle);

          for await (const entry of dirHandle.values()) {
              console.log("Processing entry:", entry);

              if (entry.kind === "file" && entry.name.endsWith(".mp3")) {
                  const file = await entry.getFile();
                  console.log("File selected:", file);

                  const metadata = await getMetadata(file);
                  console.log("Metadata extracted:", metadata);

                  if (!categories[metadata.genre]) {
                      categories[metadata.genre] = [];
                  }
                  categories[metadata.genre].push({ file, metadata });
                  playlist.push({ file, metadata });
              }
          }
          console.log("Playlist:", playlist);
          console.log("Categories:", categories);
          displayPlaylist();
          displayCategories();
      } catch (error) {
          console.error("Error loading files:", error);
      }
  }

  async function getMetadata(file) {
      // Placeholder for metadata extraction logic
      return {
          title: file.name,
          artist: "Unknown Artist",
          album: "Unknown Album",
          genre: "Unknown Genre",
          artwork: "./images/music.jpg", // Placeholder for album artwork
      };
  }

  function displayPlaylist(filteredPlaylist = playlist) {
      console.log("Displaying playlist:", filteredPlaylist);

      playlistItems.innerHTML = "";
      filteredPlaylist.forEach(({ file, metadata }, index) => {
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.textContent = `${metadata.title} - ${metadata.artist}`;
          li.addEventListener("click", function () {
              currentTrackIndex = index;
              loadAndPlayTrack(currentTrackIndex, filteredPlaylist); // Pass filteredPlaylist here
          });
          playlistItems.appendChild(li);
      });
  }

  function displayCategories() {
      console.log("Displaying categories:", categories);

      categoryItems.innerHTML = "";
      Object.keys(categories).forEach((category) => {
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.textContent = category;
          li.addEventListener("click", function () {
              const categoryPlaylist = categories[category].map((item) => ({
                  file: item.file,
                  metadata: item.metadata,
              }));
              displayPlaylist(categoryPlaylist);
          });
          categoryItems.appendChild(li);
      });
  }

  function loadAndPlayTrack(index, playlistToUse = playlist) {
      const { file, metadata } = playlistToUse[index];
      audio.src = URL.createObjectURL(file);
      currentTrackTitle.textContent = `Title: ${metadata.title}`;
      currentTrackImage.src = metadata.artwork || "music.jpg";

      audio.onloadedmetadata = function () {
          progressBar.max = audio.duration;
          totalTime.textContent = formatTime(audio.duration);
          playTrack(); // Auto-play once loaded
      };

      audio.onended = function () {
          nextTrack();
      };

      audio.ontimeupdate = function () {
          progressBar.value = audio.currentTime;
          currentTime.textContent = formatTime(audio.currentTime);
      };
  }

  function playTrack() {
      audio.play();
      isPlaying = true;
      playButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
  }

  function pauseTrack() {
      audio.pause();
      isPlaying = false;
      playButton.innerHTML = '<i class="bi bi-play-fill"></i>';
  }

  function nextTrack() {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
      loadAndPlayTrack(currentTrackIndex);
  }

  function prevTrack() {
      currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      loadAndPlayTrack(currentTrackIndex);
  }

  function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secondsRemaining = Math.floor(seconds % 60);
      return `${minutes}:${secondsRemaining < 10 ? "0" : ""}${secondsRemaining}`;
  }

  playButton.addEventListener("click", function () {
      if (isPlaying) {
          pauseTrack();
      } else {
          playTrack();
      }
  });

  nextButton.addEventListener("click", nextTrack);
  prevButton.addEventListener("click", prevTrack);

  progressBar.addEventListener("input", function () {
      audio.currentTime = progressBar.value;
  });

  volumeControl.addEventListener("input", function () {
      audio.volume = volumeControl.value;
  });

  loadFilesButton.addEventListener("click", loadFiles);

  searchInput.addEventListener("input", function () {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredPlaylist = playlist.filter(({ metadata }) =>
          metadata.title.toLowerCase().includes(searchTerm) ||
          metadata.artist.toLowerCase().includes(searchTerm) ||
          metadata.album.toLowerCase().includes(searchTerm) ||
          metadata.genre.toLowerCase().includes(searchTerm)
      );
      displayPlaylist(filteredPlaylist);
  });
});
