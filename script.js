document.addEventListener("DOMContentLoaded", () => {
  const SHEET_ID = "1iU1pzak0b8_87U2_k5d61zJmah6XU2ZYrfN6xMv6O5c";

  const TABS = {
    home: "0",
    theatre: "2090051053",
    albums: "1783482320",
    photos: "529620443",
    videos: "1943663513",
    quotes: "647221700"
  };

  /***********************
   * SCROLL ANIMATION
   ***********************/
  const scrollElements = document.querySelectorAll(".js-scroll");

  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend;
  };

  const elementOutofView = (el) => {
    const elementTop = el.getBoundingClientRect().top;
    return elementTop > (window.innerHeight || document.documentElement.clientHeight);
  };

  const displayScrollElement = (element) => element.classList.add("scrolled");
  const hideScrollElement = (element) => element.classList.remove("scrolled");

  function handleScrollAnimation() {
    scrollElements.forEach(el => {
      if (elementInView(el, 1.25)) displayScrollElement(el);
      else if (elementOutofView(el)) hideScrollElement(el);
    });
  }

  window.addEventListener("scroll", handleScrollAnimation);

  /***********************
   * GOOGLE SHEETS FETCHING
   ***********************/
  function fetchTab(gid) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}`;
    return fetch(url)
      .then(res => res.ok ? res.text() : Promise.reject(`HTTP ${res.status}`))
      .then(text => {
        const json = JSON.parse(text.substring(47).slice(0, -2));
        return json.table.rows.map(r => r.c.map(c => (c ? c.v : "")));
      })
      .catch(err => { console.error("Failed to load gid", gid, err); return []; });
  }

  function mapKeyValue(rows) {
    const obj = {};
    rows.forEach(r => { if (r[0] && r[1]) obj[String(r[0]).toLowerCase()] = r[1]; });
    return obj;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /***********************
   * FETCH ALL DATA
   ***********************/
  Promise.all([
    fetchTab(TABS.home),
    fetchTab(TABS.theatre),
    fetchTab(TABS.albums),
    fetchTab(TABS.photos),
    fetchTab(TABS.videos),
    fetchTab(TABS.quotes)
  ]).then(([home, theatre, albums, photos, videos, quotes]) => {

    /***********************
     * HOME
     ***********************/
    const homeData = mapKeyValue(home);
    document.getElementById("aboutText").innerHTML = (homeData.about || "").replace(/\n/g, "<br>");
    document.getElementById("biographyText").innerHTML = (homeData.biography || "").replace(/\n/g, "<br>");

    /***********************
     * THEATRE
     ***********************/
    const theatreEl = document.getElementById("slides-container-1");
    theatre.slice(1).forEach(t => {
      theatreEl.insertAdjacentHTML("beforeend", `
        <li class="slide">
          <img src="/images/${t[0]}" alt="${t[1]} - ${t[2]} Poster">
          <div class="title">${t[1]}</div>
          <div class="theatre">${t[2]}</div>
          <div class="role">${t[3]}</div>
          ${t[4] ? `<a class="noteslink" href="${t[4]}" target="_blank">
                      <div class="notes">OFFICIAL WEBSITE</div>
                    </a>` : ""}
        </li>
      `);
    });

    /***********************
     * ALBUMS
     ***********************/
    const albumEl = document.getElementById("slides-container-2");
    albums.slice(1).forEach(a => {
      albumEl.insertAdjacentHTML("beforeend", `
        <li class="slide">
          <a class="album" href="${a[4]}" target="_blank">
            <img src="/images/${a[0]}" alt="${a[1]} - ${a[2]}">
            <div class="title">"${a[1]}"<br>${a[2]}</div>
            <p>${a[3]}</p>
          </a>
          ${a[4] ? `<a href="${a[4]}" target="_blank"><div class="notes apple">Apple Music</div></a>` : ""}
          ${a[5] ? `<a href="${a[5]}" target="_blank"><div class="notes spotify">Spotify</div></a>` : ""}
        </li>
      `);
    });

    /***********************
     * PHOTOS (Randomized Gallery)
     ***********************/
    const galleryEl = document.getElementById("photoGallery");
    const photoArray = [];

    let shuffledPhotos = shuffleArray(photos.slice(1));

    shuffledPhotos.forEach((p, i) => {
      galleryEl.insertAdjacentHTML("beforeend", `
        <div class="photo"
             style="background-image:url('/images/Gallery/${p[0]}')"
             data-src="/images/Gallery/${p[0]}"
             data-caption="${p[1] || ""}"
             data-index="${i}">
        </div>
      `);
      photoArray.push({src: `/images/Gallery/${p[0]}`, caption: p[1] || ""});
    });

    /***********************
     * VIDEOS (Clean YouTube Embeds)
     ***********************/
    const videoEl = document.getElementById("slides-container-4");
    videos.slice(1).forEach(v => {
      // Ensure v[0] is just the video ID or normal link
      let videoID = v[0].split("v=")[1] || v[0].split("youtu.be/")[1] || v[0];
      if (videoID.includes("&")) videoID = videoID.split("&")[0]; // remove extra params
      const embedURL = `https://www.youtube.com/embed/${videoID}?controls=1&modestbranding=1&rel=0&iv_load_policy=3`;
      videoEl.insertAdjacentHTML("beforeend", `
        <li class="slide">
          <iframe class="videoPlayer" src="${embedURL}" frameborder="0" allowfullscreen></iframe>
          <div class="title">${v[1]}</div>
          <p>${v[2]}</p>
        </li>
      `);
    });

    /***********************
     * QUOTES
     ***********************/
    const quotesEl = document.getElementById("quotesContainer");
    quotes.slice(1).forEach(q => {
      quotesEl.insertAdjacentHTML("beforeend", `
        <div class="section quote_section" style="background-image:url('/images/${q[0]}')">
          <div class="quote">
            …${q[1]}…
            <span>${q[2] ? q[2]+" - " : ""}${q[3]} <em>for ${q[4]}</em></span>
          </div>
        </div>
      `);
    });

    /***********************
     * ACTIVATE SCROLL ANIMATION
     ***********************/
    handleScrollAnimation();

    /***********************
     * LIGHTBOX FUNCTIONALITY
     ***********************/
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = lightbox.querySelector(".lightbox-img");
    const lightboxCaption = lightbox.querySelector(".caption");
    const closeBtn = lightbox.querySelector(".close");
    const prevBtn = lightbox.querySelector(".prev");
    const nextBtn = lightbox.querySelector(".next");

    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      lightboxImg.src = photoArray[index].src;
      lightboxCaption.textContent = photoArray[index].caption;
      lightbox.style.display = "flex";
      requestAnimationFrame(() => lightbox.classList.add("fade-in"));
    }

    function closeLightbox() {
      lightbox.classList.remove("fade-in");
      setTimeout(() => lightbox.style.display = "none", 300);
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % photoArray.length;
      openLightbox(currentIndex);
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + photoArray.length) % photoArray.length;
      openLightbox(currentIndex);
    }

    document.querySelectorAll(".photo").forEach(photo => {
      photo.addEventListener("click", () => {
        const index = parseInt(photo.dataset.index);
        openLightbox(index);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
    nextBtn.addEventListener("click", e => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener("click", e => { e.stopPropagation(); showPrev(); });

  });
});