// Automatically add data-reveal to content sections for pop-up animation
const autoAddReveal = () => {
  const pageContent = document.querySelector(".page-content .wrapper");
  if (!pageContent) return;
  
  // Don't process if it's the home page (it already has manual data-reveal)
  if (document.querySelector(".home")) return;
  
  // Get the post content area (where markdown content is rendered)
  const postContent = pageContent.querySelector(".post-content");
  const contentArea = postContent || pageContent;
  
  // Skip if already processed (has our wrapper divs)
  if (contentArea.querySelector("div[data-reveal]")) {
    return;
  }
  
  // Add data-reveal to post header (h1 title) if it exists
  const postHeader = pageContent.querySelector(".post-header");
  if (postHeader && !postHeader.hasAttribute("data-reveal")) {
    postHeader.setAttribute("data-reveal", "");
  }
  
  // Get all headings
  const headings = Array.from(contentArea.querySelectorAll("h2, h3, h4"));
  
  if (headings.length === 0) {
    // No headings - wrap all direct children
    const children = Array.from(contentArea.children);
    if (children.length > 0) {
      const section = document.createElement("div");
      section.setAttribute("data-reveal", "");
      section.style.marginBottom = "2rem";
      contentArea.insertBefore(section, children[0]);
      children.forEach(child => section.appendChild(child));
    }
    return;
  }
  
  // First, handle intro content (before first heading)
  const firstHeading = headings[0];
  if (firstHeading) {
    const introElements = [];
    let current = contentArea.firstElementChild;
    
    while (current && current !== firstHeading) {
      if (current.nodeType === 1 && !current.closest("div[data-reveal]")) {
        introElements.push(current);
      }
      current = current.nextElementSibling;
    }
    
    if (introElements.length > 0) {
      const introSection = document.createElement("div");
      introSection.setAttribute("data-reveal", "");
      introSection.style.marginBottom = "2rem";
      contentArea.insertBefore(introSection, introElements[0]);
      introElements.forEach(el => introSection.appendChild(el));
    }
  }
  
  // Then process each heading and its content (process in reverse to avoid DOM issues)
  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i];
    
    // Skip if already in a wrapper
    if (heading.closest("div[data-reveal]")) continue;
    
    // Create wrapper div
    const section = document.createElement("div");
    section.setAttribute("data-reveal", "");
    section.style.marginBottom = "2.5rem";
    
    // Insert wrapper before heading
    heading.parentNode.insertBefore(section, heading);
    
    // Move heading into wrapper
    section.appendChild(heading);
    
    // Move all following siblings until next heading
    let next = section.nextElementSibling;
    while (next) {
      // Stop if we hit another heading
      if (/^H[2-4]$/.test(next.tagName)) {
        break;
      }
      
      const toMove = next;
      next = next.nextElementSibling;
      section.appendChild(toMove);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  
  // Run auto-add reveal on initial load
  autoAddReveal();
  
  const revealTargets = document.querySelectorAll("[data-reveal]");

  // SPA-style navigation without page reload for all navigation links
  const handleNavClick = async (e) => {
    const link = e.currentTarget;
    const href = link.getAttribute("href");
    const currentPath = window.location.pathname;
    
    // Normalize paths for comparison
    const normalizePath = (path) => {
      if (!path || path === "/" || path === "") return "/";
      return path.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
    };
    
    const normalizedCurrent = normalizePath(currentPath);
    const normalizedHref = normalizePath(href);
    
    // Skip if already on the same page
    if (normalizedCurrent === normalizedHref) {
      e.preventDefault();
      e.stopPropagation();
      
      // Scroll to top
      if (header && header.classList.contains("site-header--compact")) {
        header.classList.remove("site-header--compact");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    
    // Prevent default navigation for all links
    e.preventDefault();
    e.stopPropagation();
    
    // Fade out current content
    const pageContent = document.querySelector(".page-content");
    if (pageContent) {
      pageContent.style.transition = "opacity 0.3s ease-out";
      pageContent.style.opacity = "0";
    }
    
    try {
      // Fetch the new page
      const response = await fetch(href);
      const html = await response.text();
      
      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      // Extract the new page content
      const newContent = doc.querySelector(".page-content");
      const newTitle = doc.querySelector("title")?.textContent || document.title;
      
      if (newContent && pageContent) {
        // Update page content
        pageContent.innerHTML = newContent.innerHTML;
        
        // Automatically add data-reveal to new content sections
        autoAddReveal();
        
        // Update page title
        document.title = newTitle;
        
        // Update URL without reload
        window.history.pushState({}, newTitle, href);
        
        // Remove compact mode from header
        if (header && header.classList.contains("site-header--compact")) {
          header.classList.remove("site-header--compact");
        }
        
        // Set initial state for pop-up animation
        pageContent.style.transform = "translateY(30px) scale(0.95)";
        pageContent.style.opacity = "0";
        
        // Use requestAnimationFrame to ensure DOM is ready, then scroll smoothly
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Find the main content section to scroll to
            const mainSection = pageContent.querySelector("section, .home-hero, article, main") || pageContent.firstElementChild;
            
            // Scroll smoothly to position content between top and center
            if (mainSection) {
                const headerHeight = header ? header.offsetHeight : 0;
                const viewportHeight = window.innerHeight;
                
                // Position factor: 0.0 = top, 0.5 = center, adjust between 0.0-0.5
                const positionFactor = 0.9;  // 30% from top (between start and center)
                
                // Calculate element position and dimensions
                const rect = mainSection.getBoundingClientRect();
                const elementTop = rect.top + window.pageYOffset;
                const elementHeight = rect.height;
                
                // Calculate target position: between top and center
                // Formula: element top + (viewport height * position factor) - header
                const targetViewportPosition = viewportHeight * positionFactor;
                const scrollPosition = elementTop - targetViewportPosition + headerHeight;
              
              // Scroll smoothly to position content
              window.scrollTo({
                top: Math.max(0, scrollPosition),
                behavior: "smooth"
              });
            } else {
              // Fallback: scroll to top smoothly
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
            }
            
            // Pop-up animation: fade in, slide up, and scale up
            pageContent.style.transition = "opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
            pageContent.style.opacity = "1";
            pageContent.style.transform = "translateY(0) scale(1)";
          });
        });
        
        // Re-initialize reveal animations
        const newRevealTargets = document.querySelectorAll("[data-reveal]");
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver(
            entries => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("is-visible");
                  observer.unobserve(entry.target);
                }
              });
            },
            {
              threshold: 0.15,
              rootMargin: "0px 0px -5% 0px"
            }
          );
          newRevealTargets.forEach(el => observer.observe(el));
        } else {
          newRevealTargets.forEach(el => el.classList.add("is-visible"));
        }
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to normal navigation if fetch fails
      window.location.href = href;
    }
  };

  // Attach click handlers to all navigation links
  const navLinks = document.querySelectorAll(".site-nav--pill .page-link");
  navLinks.forEach(link => {
    link.addEventListener("click", handleNavClick, false);
  });
  
  // Handle browser back/forward buttons
  window.addEventListener("popstate", async (e) => {
    const currentPath = window.location.pathname;
    const pageContent = document.querySelector(".page-content");
    
    if (pageContent) {
      pageContent.style.opacity = "0";
      
      try {
        const response = await fetch(currentPath);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const newContent = doc.querySelector(".page-content");
        const newTitle = doc.querySelector("title")?.textContent || document.title;
        
        if (newContent) {
          pageContent.innerHTML = newContent.innerHTML;
          
          // Automatically add data-reveal to new content sections
          autoAddReveal();
          
          document.title = newTitle;
          
          // Set initial state for pop-up animation
          pageContent.style.transform = "translateY(30px) scale(0.95)";
          pageContent.style.opacity = "0";
          
          // Find the main content section to scroll to
          const mainSection = pageContent.querySelector("section, .home-hero, article, main") || pageContent.firstElementChild;
          
          // Re-initialize reveal animations
          const newRevealTargets = document.querySelectorAll("[data-reveal]");
          if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
              entries => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                  }
                });
              },
              {
                threshold: 0.15,
                rootMargin: "0px 0px -5% 0px"
              }
            );
            newRevealTargets.forEach(el => observer.observe(el));
          } else {
            newRevealTargets.forEach(el => el.classList.add("is-visible"));
          }
          
          // Use requestAnimationFrame to ensure DOM is ready, then scroll smoothly
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Scroll smoothly to position content between top and center
              if (mainSection) {
                const headerHeight = header ? header.offsetHeight : 0;
                const viewportHeight = window.innerHeight;
                
                // Position factor: 0.0 = top, 0.5 = center, adjust between 0.0-0.5
                const positionFactor = 0.9;  // 30% from top (between start and center)
                
                // Calculate element position and dimensions
                const rect = mainSection.getBoundingClientRect();
                const elementTop = rect.top + window.pageYOffset;
                const elementHeight = rect.height;
                
                // Calculate target position: between top and center
                // Formula: element top + (viewport height * position factor) - header
                const targetViewportPosition = viewportHeight * positionFactor;
                const scrollPosition = elementTop - targetViewportPosition + headerHeight;
                
                // Scroll smoothly to position content
                window.scrollTo({
                  top: Math.max(0, scrollPosition),
                  behavior: "smooth"
                });
              } else {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                });
              }
              
              // Pop-up animation: fade in, slide up, and scale up
              pageContent.style.transition = "opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
              pageContent.style.opacity = "1";
              pageContent.style.transform = "translateY(0) scale(1)";
            });
          });
        }
      } catch (error) {
        window.location.reload();
      }
    }
  });
  
  // Page load animation - fade in effect
  document.body.classList.add("page-loading");
  setTimeout(() => {
    document.body.classList.remove("page-loading");
    document.body.classList.add("page-loaded");
  }, 10);

  // Ensure page scrolls to top smoothly when arriving at home page
  if (window.location.pathname === "/" || 
      window.location.pathname === "/index.html" || 
      window.location.pathname === "" ||
      window.location.pathname.endsWith("/")) {
    // Scroll to top smoothly on page load
    window.scrollTo({
      top: 0,
      behavior: "auto" // Use 'auto' on initial load, 'smooth' for clicks
    });
    
    // Add a subtle scale-up animation for home page content
    const pageContent = document.querySelector(".page-content");
    if (pageContent) {
      pageContent.style.opacity = "0";
      pageContent.style.transform = "scale(0.98)";
      pageContent.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
      
      setTimeout(() => {
        pageContent.style.opacity = "1";
        pageContent.style.transform = "scale(1)";
      }, 100);
    }
  }

  // Removed duplicate home link handler - now handled by handleNavClick above

  // Header compact mode on scroll with throttling
  let ticking = false;
  const handleScroll = () => {
    if (!header) return;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const shouldBeCompact = window.scrollY > 50;
        const isCompact = header.classList.contains("site-header--compact");
        
        if (shouldBeCompact && !isCompact) {
          header.classList.add("site-header--compact");
        } else if (!shouldBeCompact && isCompact) {
          header.classList.remove("site-header--compact");
        }
        
        ticking = false;
      });
      ticking = true;
    }
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Video autoplay with max volume and hide unwanted controls
  const video = document.querySelector(".site-header__video video");
  if (video) {
    // Completely disable context menu (right-click menu)
    video.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
    
    // Disable picture-in-picture
    video.disablePictureInPicture = true;
    
    // Disable download by removing controlsList attribute and using controlsList API
    video.setAttribute("controlsList", "nodownload noplaybackrate nofullscreen noremoteplayback");
    
    // Additional protection: prevent default behaviors
    video.addEventListener("loadedmetadata", () => {
      // Ensure controlsList is set
      if (video.controlsList) {
        video.controlsList.add("nodownload");
        video.controlsList.add("noplaybackrate");
        video.controlsList.add("nofullscreen");
        video.controlsList.add("noremoteplayback");
      }
    });
    
    // Unmute and set max volume once video can play
    const enableSound = () => {
      video.muted = false;
      video.volume = 1.0; // Max volume
    };
    
    // Try to unmute after video starts playing
    video.addEventListener("playing", enableSound, { once: true });
    
    // Fallback: unmute on any user interaction (click, scroll, etc.)
    const unmuteOnInteraction = () => {
      enableSound();
      document.removeEventListener("click", unmuteOnInteraction);
      document.removeEventListener("scroll", unmuteOnInteraction);
      document.removeEventListener("touchstart", unmuteOnInteraction);
    };
    
    document.addEventListener("click", unmuteOnInteraction, { once: true });
    document.addEventListener("scroll", unmuteOnInteraction, { once: true });
    document.addEventListener("touchstart", unmuteOnInteraction, { once: true });
    
    // Ensure video loops continuously
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.play();
    });
  }

  // Reveal sections gently as they enter view
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -5% 0px"
      }
    );

    revealTargets.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    revealTargets.forEach(el => el.classList.add("is-visible"));
  }

  // Footer message hover effect (JavaScript fallback)
  const footerMessage = document.querySelector(".footer-message");
  if (footerMessage) {
    footerMessage.addEventListener("mouseenter", function() {
      this.style.color = "#0bebc9";
      this.style.opacity = "1";
      this.style.transform = "scale(1.05)";
      this.style.backgroundColor = "rgba(11, 235, 201, 0.2)";
      this.style.padding = "0.5rem";
      this.style.borderRadius = "4px";
    });
    
    footerMessage.addEventListener("mouseleave", function() {
      this.style.color = "#00ff59";
      this.style.opacity = "0.9";
      this.style.transform = "scale(1)";
      this.style.backgroundColor = "transparent";
      this.style.padding = "0";
      this.style.borderRadius = "0";
    });
  }
});

