// ==========================
// SELECT ELEMENTS
// ==========================

const themeBtn = document.querySelector(".theme-toggle:not(.menu-toggle)");
const menuBtn = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");
const backToTop = document.querySelector(".back-to-top");
const heroImage = document.querySelector(".hero-image img");
const aboutImage = document.querySelector(".about-image");
const themeMusic = document.querySelector("#theme-music");
const musicBtn = document.querySelector(".music-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section");
const contactForm = document.querySelector(".contact-form");

// CONTACT FORM: open a Gmail draft filled with the visitor's message.
contactForm?.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const recipient = contactForm.dataset.recipient;
  const subject = formData.get("subject") || "Portfolio contact";
  const body = [
    `Name: ${formData.get("name")}`,
    `Email: ${formData.get("email")}`,
    "",
    formData.get("message")
  ].join("\n");
  const gmailUrl = new URL("https://mail.google.com/mail/");
  gmailUrl.search = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: recipient,
    su: subject,
    body
  });

  const gmailWindow = window.open(gmailUrl, "_blank");
  if (gmailWindow) {
    gmailWindow.opener = null;
  } else {
    window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
});

// MOBILE NAVIGATION: toggle the menu and close it after choosing a section.
menuBtn?.addEventListener("click", () => {
  const isOpen = navMenu?.classList.toggle("open") ?? false;
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menuBtn.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  menuBtn.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
});

navMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    if (menuBtn) {
      menuBtn.setAttribute("aria-label", "Open navigation menu");
      menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  });
});

// THEME MUSIC: switch soundtrack with the active color theme and update controls.
const themeMusicTracks = {
  light: "backsound/The%20Dreamer%20Piano%20-%20in%20the%20sea.mp3",
  dark: "backsound/Chainsaw%20Man_%20Reze%20Arc%20OST%20-%20in%20the%20pool%20(Piano)%20_%20Kensuke%20Ushio%20%5BObvg5jVCvxc%5D.mp3"
};

const updateMusicButton = () => {
  if (!musicBtn || !themeMusic) return;
  const isPlaying = !themeMusic.paused;
  musicBtn.innerHTML = isPlaying
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
  musicBtn.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
  musicBtn.title = isPlaying ? "Pause background music" : "Play background music";
};

const playThemeMusic = () => {
  if (!themeMusic) return;
  themeMusic.play().then(updateMusicButton).catch(updateMusicButton);
};

themeMusic?.addEventListener("play", updateMusicButton);
themeMusic?.addEventListener("pause", updateMusicButton);

musicBtn?.addEventListener("click", () => {
  if (!themeMusic) return;
  if (themeMusic.paused) {
    playThemeMusic();
  } else {
    themeMusic.pause();
  }
});

// ==========================
// DARK MODE
// ==========================

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  if (heroImage) {
    heroImage.src = theme === "dark"
      ? "image%20porto/Dreze_pp.jpg"
      : "image%20porto/Lreze_pp.jpg";
  }
  if (themeBtn) {
    themeBtn.innerHTML = theme === "dark"
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  if (themeMusic) {
    const wasPlaying = !themeMusic.paused;
    const track = themeMusicTracks[theme];
    if (!themeMusic.src.endsWith(track)) {
      themeMusic.src = track;
      if (wasPlaying) playThemeMusic();
    }
  }
};

applyTheme(localStorage.getItem("theme") === "dark" ? "dark" : "light");
playThemeMusic();

// ABOUT PHOTO: track pointer movement and keep the badge connected to its cord.
let photoDragStartX = 0;
let photoDragStartY = 0;
let photoPullX = 0;
let photoPullY = 0;
let activePhotoPointer = null;
let photoMoveFrame = null;
let pendingPhotoX = 0;
let pendingPhotoY = 0;

const updatePhotoPull = (x, y) => {
  photoPullX = Math.max(-70, Math.min(70, x));
  photoPullY = Math.max(-12, Math.min(90, y));
  if (!aboutImage) return;
  const cordVertical = 78 + photoPullY;
  const cordAngle = Math.atan2(photoPullX, cordVertical) * 180 / Math.PI;
  aboutImage.style.setProperty("--pull-x", `${photoPullX}px`);
  aboutImage.style.setProperty("--pull-y", `${photoPullY}px`);
  aboutImage.style.setProperty("--swing", `${cordAngle}deg`);
  aboutImage.style.setProperty("--cord-angle", `${-cordAngle}deg`);
  aboutImage.style.setProperty("--cord-length", `${Math.hypot(photoPullX, cordVertical)}px`);
};

aboutImage?.addEventListener("pointerdown", event => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  activePhotoPointer = event.pointerId;
  photoDragStartX = event.clientX - photoPullX;
  photoDragStartY = event.clientY - photoPullY;
  aboutImage.classList.add("is-dragging");
  aboutImage.setPointerCapture(event.pointerId);
});

aboutImage?.addEventListener("pointermove", event => {
  if (event.pointerId !== activePhotoPointer) return;
  pendingPhotoX = event.clientX - photoDragStartX;
  pendingPhotoY = event.clientY - photoDragStartY;
  if (photoMoveFrame !== null) return;
  photoMoveFrame = window.requestAnimationFrame(() => {
    photoMoveFrame = null;
    updatePhotoPull(pendingPhotoX, pendingPhotoY);
  });
});

const releasePhoto = event => {
  if (event.pointerId !== activePhotoPointer) return;
  activePhotoPointer = null;
  if (photoMoveFrame !== null) {
    window.cancelAnimationFrame(photoMoveFrame);
    photoMoveFrame = null;
  }
  aboutImage?.classList.remove("is-dragging");
  updatePhotoPull(0, 0);
};

aboutImage?.addEventListener("pointerup", releasePhoto);
aboutImage?.addEventListener("pointercancel", releasePhoto);
aboutImage?.addEventListener("keydown", event => {
  const movement = event.shiftKey ? 20 : 10;
  const directions = {
    ArrowLeft: [-movement, 0],
    ArrowRight: [movement, 0],
    ArrowUp: [0, -movement],
    ArrowDown: [0, movement]
  };
  if (event.key === "Home") {
    event.preventDefault();
    updatePhotoPull(0, 0);
  } else if (directions[event.key]) {
    event.preventDefault();
    updatePhotoPull(photoPullX + directions[event.key][0], photoPullY + directions[event.key][1]);
  }
});

themeBtn?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
});

// ==========================
// BACK TO TOP
// ==========================

window.addEventListener("scroll", () => {

  if (window.scrollY > 500) {

    backToTop.style.opacity = "1";
    backToTop.style.visibility = "visible";

  } else {

    backToTop.style.opacity = "0";
    backToTop.style.visibility = "hidden";
  }
});

backToTop.addEventListener("click", () => {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});

// ==========================
// ACTIVE NAV LINK
// ==========================

window.addEventListener("scroll", () => {

  let current = "";

  sections.forEach(section => {

    const sectionTop = section.offsetTop - 150;

    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }

  });

  navLinks.forEach(link => {

    link.classList.remove("active");

    if (
      link.getAttribute("href") ===
      `#${current}`
    ) {
      link.classList.add("active");
    }

  });

});

// ==========================
// NAVBAR SHADOW
// ==========================

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

  if (window.scrollY > 50) {

    header.classList.add("is-scrolled");

  } else {

    header.classList.remove("is-scrolled");
  }

});

// ==========================
// TYPING EFFECT
// ==========================

const roles = [
  "Beginer Writer",
  "UI/UX Designer",
  "RPL Student",
  "Cyber Security Learner",
  "Gamer",
];

let roleIndex = 0;
let charIndex = 0;

const typingText =
  document.querySelector(".hero h3");

function typeRole() {

  if (!typingText) return;

  if (charIndex < roles[roleIndex].length) {

    typingText.textContent +=
      roles[roleIndex].charAt(charIndex);

    charIndex++;

    setTimeout(typeRole, 100);

  } else {

    setTimeout(deleteRole, 1800);
  }
}

function deleteRole() {

  if (charIndex > 0) {

    typingText.textContent =
      roles[roleIndex].substring(
        0,
        charIndex - 1
      );

    charIndex--;

    setTimeout(deleteRole, 50);

  } else {

    roleIndex++;

    if (roleIndex >= roles.length) {
      roleIndex = 0;
    }

    setTimeout(typeRole, 300);
  }
}

if (typingText) {

  typingText.textContent = "";
  typeRole();

}

// ==========================
// SCROLL REVEAL
// ==========================

const revealElements =
  document.querySelectorAll(
    ".project-card, .tool-item, .certificate-card, .about-content, .about-image, .hero-content, .hero-image"
  );

const revealOnScroll = () => {

  revealElements.forEach(el => {

    const windowHeight =
      window.innerHeight;

    const revealTop =
      el.getBoundingClientRect().top;

    const revealPoint = 100;

    if (revealTop < windowHeight - revealPoint) {

      el.classList.add("show");

    }

  });

};

window.addEventListener(
  "scroll",
  revealOnScroll
);

revealOnScroll();

// ==========================
// 3D CARD HOVER
// ==========================

const cards = document.querySelectorAll(
  ".project-card, .tool-item, .certificate-card"
);

cards.forEach(card => {

  card.addEventListener("mousemove", e => {

    const rect =
      card.getBoundingClientRect();

    const x =
      e.clientX - rect.left;

    const y =
      e.clientY - rect.top;

    const rotateY =
      ((x / rect.width) - 0.5) * 12;

    const rotateX =
      ((y / rect.height) - 0.5) * -12;

    card.style.transform =
      `perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-8px)`;

  });

  card.addEventListener("mouseleave", () => {

    card.style.transform =
      "perspective(1000px) rotateX(0) rotateY(0)";

  });

});

// ==========================
// TOOLBOX CAROUSEL AND DETAILS
// ==========================

const toolCarousel = document.querySelector(".tool-carousel");
const toolDialog = document.querySelector(".tool-dialog");
const toolDialogTitle = document.querySelector("#tool-dialog-title");
const toolDialogCategory = document.querySelector("#tool-dialog-category");
const toolDialogDescription = document.querySelector("#tool-dialog-description");
const toolDescriptions = {
  vscode: {
    title: "Visual Studio Code",
    category: "Development",
    description: "My code editor for writing and organizing web projects, JavaScript, and Python."
  },
  figma: {
    title: "Figma",
    category: "Design",
    description: "I use Figma to explore interface ideas, arrange layouts, and prepare design prototypes."
  },
  github: {
    title: "GitHub",
    category: "Code collaboration",
    description: "A place to keep project code, track changes, and learn from other developers."
  },
  chrome: {
    title: "Google Chrome",
    category: "Testing and browsing",
    description: "I use Chrome to test responsive pages and inspect how my web projects behave."
  },
  python: {
    title: "Python",
    category: "Programming",
    description: "A programming language I use to learn backend development, scripting, and problem solving."
  },
  "mobile-legends": {
    title: "Mobile Legends: Bang Bang",
    category: "Game",
    description: "A mobile multiplayer game I enjoy outside of coding and design."
  }
};

document.querySelectorAll(".tool-item").forEach(item => {
  item.addEventListener("click", () => {
    const details = toolDescriptions[item.dataset.app];
    if (!details || !toolDialog) return;
    toolDialogTitle.textContent = details.title;
    toolDialogCategory.textContent = details.category;
    toolDialogDescription.textContent = details.description;
    toolDialog.showModal();
  });
});

document.querySelector(".dialog-close")?.addEventListener("click", () => toolDialog?.close());

toolDialog?.addEventListener("click", event => {
  if (event.target === toolDialog) toolDialog.close();
});

document.querySelectorAll("[data-scroll]").forEach(button => {
  button.addEventListener("click", () => {
    const direction = Number(button.dataset.scroll);
    toolCarousel?.scrollBy({left: direction * toolCarousel.clientWidth * 0.75, behavior: "smooth"});
  });
});

let dragStartX = 0;
let dragScrollLeft = 0;
let draggedCarousel = false;
let carouselDragActive = false;

toolCarousel?.addEventListener("pointerdown", event => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  if (!event.target.closest(".tool-item")) return;
  dragStartX = event.clientX;
  dragScrollLeft = toolCarousel.scrollLeft;
  draggedCarousel = false;
  carouselDragActive = true;
});

window.addEventListener("pointermove", event => {
  if (!carouselDragActive || event.pointerType !== "mouse") return;
  const dragDistance = event.clientX - dragStartX;
  if (Math.abs(dragDistance) > 6) draggedCarousel = true;
  if (draggedCarousel) toolCarousel.scrollLeft = dragScrollLeft - dragDistance;
});

window.addEventListener("pointerup", event => {
  if (event.pointerType !== "mouse" || !carouselDragActive) return;
  carouselDragActive = false;
  if (draggedCarousel) window.setTimeout(() => { draggedCarousel = false; }, 0);
});

toolCarousel?.addEventListener("click", event => {
  if (!draggedCarousel) return;
  event.preventDefault();
  event.stopPropagation();
}, true);

// ==========================
// COUNTER ANIMATION
// ==========================

const counters =
  document.querySelectorAll(".counter");

counters.forEach(counter => {

  counter.innerText = "0";

  const updateCounter = () => {

    const target =
      +counter.getAttribute("data-target");

    const count =
      +counter.innerText;

    const increment =
      target / 100;

    if (count < target) {

      counter.innerText =
        `${Math.ceil(count + increment)}`;

      setTimeout(updateCounter, 20);

    } else {

      counter.innerText = target;
    }

  };

  updateCounter();

});

// ==========================
// IMAGE HOVER ZOOM
// ==========================

if (heroImage) {

  heroImage.addEventListener(
    "mousemove",
    e => {

      heroImage.style.transform =
        "scale(1.08)";

    }
  );

  heroImage.addEventListener(
    "mouseleave",
    () => {

      heroImage.style.transform =
        "scale(1)";
    }
  );

}

// ==========================
// PRELOADER SUPPORT
// ==========================

window.addEventListener("load", () => {

  document.body.classList.add("loaded");

});

// ==========================
// CONSOLE SIGNATURE
// ==========================

console.log(`
Portfolio Website Loaded Successfully
Designed with HTML CSS JS
`);