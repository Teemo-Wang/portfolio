if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const detailReturnScrollKey = "teemo-detail-return-scroll";
const detailReturnCaseKey = "teemo-detail-return-case";
const workKvAutoDelay = 4000;

const heroLoopVideos = [...document.querySelectorAll(".hero [data-hero-loop-video]")];

if (heroLoopVideos.length) {
  let activeHeroVideoIndex = 0;
  let isHeroVideoSwapping = false;
  const loopLeadTime = 0.12;

  const playVideo = (video) => {
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const resetVideo = (video) => {
    video.pause();
    video.currentTime = 0;
  };

  const swapHeroVideo = () => {
    if (isHeroVideoSwapping || heroLoopVideos.length < 2) {
      return;
    }

    isHeroVideoSwapping = true;
    const currentVideo = heroLoopVideos[activeHeroVideoIndex];
    const nextHeroVideoIndex = (activeHeroVideoIndex + 1) % heroLoopVideos.length;
    const nextVideo = heroLoopVideos[nextHeroVideoIndex];

    nextVideo.currentTime = 0;
    playVideo(nextVideo);
    nextVideo.classList.add("is-active");
    currentVideo.classList.remove("is-active");

    window.setTimeout(() => {
      resetVideo(currentVideo);
      activeHeroVideoIndex = nextHeroVideoIndex;
      isHeroVideoSwapping = false;
    }, 60);
  };

  const watchHeroVideo = () => {
    const currentVideo = heroLoopVideos[activeHeroVideoIndex];

    if (currentVideo.duration && currentVideo.duration - currentVideo.currentTime <= loopLeadTime) {
      swapHeroVideo();
    }

    window.requestAnimationFrame(watchHeroVideo);
  };

  heroLoopVideos.forEach((video, index) => {
    video.loop = false;
    video.muted = true;

    if (index === activeHeroVideoIndex) {
      playVideo(video);
    } else {
      resetVideo(video);
    }
  });

  window.requestAnimationFrame(watchHeroVideo);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const siteNav = document.querySelector(".site-nav");
const navLinks = siteNav ? [...siteNav.querySelectorAll("a[href^='#']")] : [];
const navSections = navLinks
  .map((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    return section ? { link, section } : null;
  })
  .filter(Boolean);

if (siteNav && navSections.length) {
  let activeNavLink = null;
  let navTicking = false;

  const moveNavIndicator = (link) => {
    const navRect = siteNav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const width = Math.min(Math.max(linkRect.width * 0.46, 28), 42);
    const x = linkRect.left - navRect.left + (linkRect.width - width) / 2;

    siteNav.style.setProperty("--nav-indicator-x", `${x}px`);
    siteNav.style.setProperty("--nav-indicator-width", `${width}px`);
  };

  const setActiveNav = (link) => {
    if (activeNavLink === link) {
      moveNavIndicator(link);
      return;
    }

    activeNavLink = link;
    navLinks.forEach((entry) => {
      entry.classList.toggle("is-active", entry === link);
    });
    moveNavIndicator(link);
  };

  const updateActiveNav = () => {
    const marker = Math.min(window.innerHeight * 0.38, 360);
    const current =
      navSections
        .filter(({ section }) => section.getBoundingClientRect().top <= marker)
        .pop() || navSections[0];

    setActiveNav(current.link);
    navTicking = false;
  };

  const requestNavUpdate = () => {
    if (navTicking) {
      return;
    }

    navTicking = true;
    window.requestAnimationFrame(updateActiveNav);
  };

  const updateFromHash = () => {
    const hashSection = navSections.find(({ link }) => link.getAttribute("href") === window.location.hash);

    if (hashSection) {
      setActiveNav(hashSection.link);
    }

    window.setTimeout(requestNavUpdate, 160);
    window.setTimeout(requestNavUpdate, 520);
  };

  window.addEventListener("scroll", requestNavUpdate, { passive: true });
  window.addEventListener("resize", requestNavUpdate);
  window.addEventListener("hashchange", updateFromHash);
  window.addEventListener("load", updateFromHash);
  updateFromHash();
}

const workItems = [...document.querySelectorAll(".work-item")];

workItems.forEach((item) => {
  const trigger = item.querySelector(".work-row");

  const toggleWorkItem = () => {
    const isActive = item.classList.contains("is-active");

    workItems.forEach((entry) => {
      entry.classList.remove("is-active");
      entry.querySelector(".work-row").setAttribute("aria-expanded", "false");
    });

    if (!isActive) {
      item.classList.add("is-active");
      trigger.setAttribute("aria-expanded", "true");
    }

    document.dispatchEvent(new CustomEvent("workStateChange"));
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleWorkItem();
  });

  item.addEventListener("click", () => {
    if (item.classList.contains("is-active")) {
      return;
    }

    toggleWorkItem();
  });
});

const returnParams = new URLSearchParams(window.location.search);
const returnCase = returnParams.get("case");
const storedReturnScroll = sessionStorage.getItem(detailReturnScrollKey);
const storedReturnCase = sessionStorage.getItem(detailReturnCaseKey);
const returnScroll = storedReturnScroll === null ? NaN : Number(storedReturnScroll);
const shouldRestoreDetailReturn = (returnParams.get("check") === "2" || storedReturnCase) && Number.isFinite(returnScroll);
const activeReturnCase = shouldRestoreDetailReturn ? returnCase || storedReturnCase : null;

if (shouldRestoreDetailReturn && workItems[0]) {
  const returnPanel = activeReturnCase
    ? [...document.querySelectorAll("[data-kv-panel]")].find((panel) => {
        return panel.dataset.detailUrl && panel.dataset.detailUrl.includes(`case=${activeReturnCase}`);
      })
    : null;
  const returnWorkItem = returnPanel ? returnPanel.closest(".work-item") : workItems[0];
  const returnWorkTrigger = returnWorkItem.querySelector(".work-row");

  workItems.forEach((entry) => {
    entry.classList.remove("is-active");
    entry.querySelector(".work-row").setAttribute("aria-expanded", "false");
  });

  returnWorkItem.classList.add("is-active");

  if (returnWorkTrigger) {
    returnWorkTrigger.setAttribute("aria-expanded", "true");
  }

  const restoreScroll = () => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: returnScroll, left: 0, behavior: "auto" });
  };

  restoreScroll();
  window.requestAnimationFrame(restoreScroll);
  window.setTimeout(restoreScroll, 80);
  window.setTimeout(() => {
    sessionStorage.removeItem(detailReturnScrollKey);
    sessionStorage.removeItem(detailReturnCaseKey);
    document.documentElement.classList.remove("is-restoring-detail-scroll");
    document.documentElement.style.scrollBehavior = "";
  }, 120);
}

document.querySelectorAll("[data-kv-carousel]").forEach((carousel) => {
  const panels = [...carousel.querySelectorAll("[data-kv-panel]")];
  const workItem = carousel.closest(".work-item");
  const prevButton = carousel.querySelector(".work-kv-prev");
  const nextButton = carousel.querySelector(".work-kv-next");
  let autoTimer = null;
  let wasExpanded = false;
  let index = activeReturnCase
    ? panels.findIndex((panel) => panel.dataset.detailUrl && panel.dataset.detailUrl.includes(`case=${activeReturnCase}`))
    : 0;

  if (index < 0) {
    index = 0;
  }

  if (panels.length < 2) {
    return;
  }

  const clearAutoTimer = () => {
    window.clearTimeout(autoTimer);
    autoTimer = null;
  };

  const scheduleAutoNext = (delay = workKvAutoDelay) => {
    clearAutoTimer();
    autoTimer = window.setTimeout(() => {
      next(true);
      scheduleAutoNext();
    }, delay);
  };

  const render = () => {
    const isExpanded = workItem && workItem.classList.contains("is-active");

    panels.forEach((panel, panelIndex) => {
      const offset = (panelIndex - index + panels.length) % panels.length;
      const isCenter = offset === 0;
      const video = panel.querySelector("video");

      panel.classList.toggle("work-kv-panel-center", offset === 0);
      panel.classList.toggle("work-kv-panel-right", offset === 1);
      panel.classList.toggle("work-kv-panel-left", panels.length > 2 && offset === panels.length - 1);
      panel.classList.toggle("work-kv-panel-hidden", offset > 1 && offset < panels.length - 1);

      if (!video) {
        return;
      }

      if (isExpanded && isCenter) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  const next = (isAuto = false) => {
    if (!workItem || !workItem.classList.contains("is-active")) {
      render();
      return;
    }

    index = (index + 1) % panels.length;
    render();

    if (!isAuto) {
      scheduleAutoNext();
    }
  };

  const prev = (isAuto = false) => {
    if (!workItem || !workItem.classList.contains("is-active")) {
      render();
      return;
    }

    index = (index - 1 + panels.length) % panels.length;
    render();

    if (!isAuto) {
      scheduleAutoNext();
    }
  };

  panels.forEach((panel) => {
    const openDetail = (event) => {
      if (!workItem || !workItem.classList.contains("is-active")) {
        return;
      }

      if (!panel.classList.contains("work-kv-panel-center")) {
        return;
      }

      const detailUrl = panel.dataset.detailUrl;

      if (!detailUrl) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      sessionStorage.setItem(detailReturnScrollKey, String(window.scrollY));
      sessionStorage.setItem(detailReturnCaseKey, new URL(detailUrl, window.location.href).searchParams.get("case") || "");
      window.location.href = detailUrl;
    };

    panel.addEventListener("click", openDetail);
    panel.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      openDetail(event);
    });
  });

  carousel.addEventListener("click", (event) => {
    const clickedPanel = event.target.closest("[data-kv-panel]");

    if (clickedPanel && workItem && workItem.classList.contains("is-active")) {
      event.preventDefault();
      event.stopPropagation();

      if (clickedPanel.classList.contains("work-kv-panel-left")) {
        prev();
        return;
      }

      if (clickedPanel.classList.contains("work-kv-panel-right")) {
        next();
        return;
      }

      if (clickedPanel.classList.contains("work-kv-panel-center") && clickedPanel.dataset.detailUrl) {
        sessionStorage.setItem(detailReturnScrollKey, String(window.scrollY));
        sessionStorage.setItem(detailReturnCaseKey, new URL(clickedPanel.dataset.detailUrl, window.location.href).searchParams.get("case") || "");
        window.location.href = clickedPanel.dataset.detailUrl;
        return;
      }
    }

    event.stopPropagation();
    next();
  });

  if (prevButton) {
    prevButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      prev();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      next();
    });
  }

  const syncCarouselState = () => {
    const isExpanded = workItem && workItem.classList.contains("is-active");

    if (!isExpanded) {
      clearAutoTimer();
      wasExpanded = false;
      index = 0;
      render();
      return;
    }

    if (!wasExpanded) {
      wasExpanded = true;
      render();
      scheduleAutoNext();
      return;
    }

    render();
  };

  document.addEventListener("workStateChange", syncCarouselState);
  render();
  syncCarouselState();
});

const carousels = [...document.querySelectorAll("[data-carousel]")];

carousels.forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const prev = carousel.querySelector(".carousel-prev");
  const next = carousel.querySelector(".carousel-next");
  let index = 0;

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  prev.addEventListener("click", (event) => {
    event.stopPropagation();
    index = (index - 1 + slides.length) % slides.length;
    render();
  });

  next.addEventListener("click", (event) => {
    event.stopPropagation();
    index = (index + 1) % slides.length;
    render();
  });
});

const experienceStage = document.querySelector(".experience-stage");

const wechatTriggers = [...document.querySelectorAll("[data-wechat-trigger]")];

if (wechatTriggers.length) {
  const wechatModal = document.createElement("div");
  const wechatImage = document.createElement("img");

  wechatModal.className = "wechat-modal";
  wechatModal.setAttribute("aria-hidden", "true");
  wechatImage.src = "./sucai/wechat.jpg";
  wechatImage.alt = "WeChat QR code";
  wechatModal.append(wechatImage);
  document.body.append(wechatModal);

  const openWechatModal = () => {
    wechatModal.classList.add("is-open");
    wechatModal.setAttribute("aria-hidden", "false");
  };

  const closeWechatModal = () => {
    wechatModal.classList.remove("is-open");
    wechatModal.setAttribute("aria-hidden", "true");
  };

  wechatTriggers.forEach((wechatTrigger) => {
    if (wechatTrigger.tagName !== "BUTTON") {
      wechatTrigger.setAttribute("role", "button");
      wechatTrigger.setAttribute("tabindex", "0");
    }

    wechatTrigger.setAttribute("aria-label", "Open WeChat QR code");
    wechatTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openWechatModal();
    });
    wechatTrigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openWechatModal();
    });
  });

  wechatModal.addEventListener("click", closeWechatModal);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && wechatModal.classList.contains("is-open")) {
      closeWechatModal();
    }
  });
}

if (experienceStage) {
  const experienceCards = [...experienceStage.querySelectorAll(".experience-card")];
  const companyDetailModal = document.createElement("div");
  const companyDetailImage = document.createElement("img");
  let scattered = false;
  let transitionTimer;
  let activeCompanyCard = null;
  let parallaxFrame = null;

  companyDetailModal.className = "company-detail-modal";
  companyDetailModal.setAttribute("aria-hidden", "true");
  companyDetailImage.alt = "";
  companyDetailModal.append(companyDetailImage);
  document.body.append(companyDetailModal);

  const focusExperienceCard = (card) => {
    experienceStage.classList.add("is-hovering");
    experienceCards.forEach((entry) => {
      entry.classList.remove("is-focused");
      resetExperienceParallax(entry);
    });
    card.classList.add("is-focused");
  };

  const clearExperienceFocus = () => {
    if (companyDetailModal.classList.contains("is-open")) {
      return;
    }

    experienceStage.classList.remove("is-hovering");
    experienceCards.forEach((card) => {
      card.classList.remove("is-focused");
      resetExperienceParallax(card);
    });
  };

  function resetExperienceParallax(card) {
    card.style.setProperty("--card-tilt-x", "0deg");
    card.style.setProperty("--card-tilt-y", "0deg");
    card.style.setProperty("--card-shift-x", "0px");
    card.style.setProperty("--card-shift-y", "0px");
  }

  const updateExperienceParallax = (card, event) => {
    if (!card.classList.contains("is-focused") || companyDetailModal.classList.contains("is-open")) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const tiltY = x * 7;
    const tiltX = -y * 6;
    const shiftX = x * 6;
    const shiftY = y * 5;

    window.cancelAnimationFrame(parallaxFrame);
    parallaxFrame = window.requestAnimationFrame(() => {
      card.style.setProperty("--card-tilt-x", `${tiltX.toFixed(2)}deg`);
      card.style.setProperty("--card-tilt-y", `${tiltY.toFixed(2)}deg`);
      card.style.setProperty("--card-shift-x", `${shiftX.toFixed(2)}px`);
      card.style.setProperty("--card-shift-y", `${shiftY.toFixed(2)}px`);
    });
  };

  const setScattered = (nextState) => {
    if (scattered === nextState) {
      return;
    }

    scattered = nextState;
    experienceStage.classList.add("is-transitioning");
    experienceStage.classList.toggle("is-scattered", scattered);
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      experienceStage.classList.remove("is-transitioning");
    }, 820);
  };

  const updateExperienceState = () => {
    const rect = experienceStage.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const enterPoint = viewportHeight * 0.72;
    const spreadOnPoint = viewportHeight * 0.44;
    const spreadOffPoint = viewportHeight * 0.54;
    const isVisibleZone = rect.top < enterPoint && rect.bottom > viewportHeight * 0.18;

    experienceStage.classList.toggle("is-visible-zone", isVisibleZone);

    if (isVisibleZone && !scattered && rect.top < spreadOnPoint) {
      setScattered(true);
    } else if ((!isVisibleZone && scattered) || (scattered && rect.top > spreadOffPoint)) {
      setScattered(false);
    }

    if (!isVisibleZone) {
      clearExperienceFocus();
    }
  };

  updateExperienceState();
  window.addEventListener("scroll", updateExperienceState, { passive: true });
  window.addEventListener("resize", updateExperienceState);

  const closeCompanyDetail = () => {
    companyDetailModal.classList.remove("is-open");
    companyDetailModal.setAttribute("aria-hidden", "true");

    if (activeCompanyCard) {
      activeCompanyCard.classList.remove("is-modal-source");
      activeCompanyCard = null;
    }

    clearExperienceFocus();
  };

  companyDetailModal.addEventListener("click", closeCompanyDetail);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && companyDetailModal.classList.contains("is-open")) {
      closeCompanyDetail();
    }
  });

  experienceCards.forEach((card, index) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Open company detail ${index + 1}`);

    const openCompanyDetail = () => {
      if (!experienceStage.classList.contains("is-scattered")) {
        setScattered(true);
      }

      activeCompanyCard = card;
      focusExperienceCard(card);
      card.classList.add("is-modal-source");
      companyDetailImage.src = `./sucai/公司/公司二级页/${index + 1}.png`;
      companyDetailImage.alt = `Company detail ${index + 1}`;
      companyDetailModal.classList.add("is-open");
      companyDetailModal.setAttribute("aria-hidden", "false");
    };

    card.addEventListener("mouseenter", () => {
      if (!experienceStage.classList.contains("is-scattered")) {
        return;
      }
      focusExperienceCard(card);
    });

    card.addEventListener("mouseleave", () => {
      clearExperienceFocus();
    });

    card.addEventListener("mousemove", (event) => {
      updateExperienceParallax(card, event);
    });

    card.addEventListener("click", openCompanyDetail);

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openCompanyDetail();
    });
  });
}
