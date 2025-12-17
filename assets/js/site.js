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
  
  // Video loading state - needs to be accessible to navigation handler
  let videoLoaded = false;
  
  // Cleanup tracking for intervals and timeouts
  const activeIntervals = [];
  const activeTimeouts = [];
  
  // Helper to track and clear intervals
  const trackedSetInterval = (callback, delay) => {
    const id = setInterval(callback, delay);
    activeIntervals.push(id);
    return id;
  };
  
  // Helper to track and clear timeouts
  const trackedSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    activeTimeouts.push(id);
    return id;
  };
  
  // Store AbortControllers for cleanup
  const abortControllers = [];
  
  // Cleanup function
  const cleanup = () => {
    activeIntervals.forEach(id => clearInterval(id));
    activeTimeouts.forEach(id => clearTimeout(id));
    activeIntervals.length = 0;
    activeTimeouts.length = 0;
    abortControllers.forEach(controller => controller.abort());
    abortControllers.length = 0;
  };
  
  // Cleanup on page unload
  window.addEventListener("beforeunload", cleanup);
  window.addEventListener("unload", cleanup);
  
  // Footer is now shown on home page - no removal needed
  
  // Remove duplicate navigation bars from home page
  const removeDuplicateNav = () => {
    if (!document.body.classList.contains("page-home")) return;
    
    const headerInner = document.querySelector(".site-header__inner");
    if (!headerInner) return;
    
    // Find the correct navigation inside header__inner
    const correctNav = headerInner.querySelector(".site-nav--pill");
    
    // Find ALL navigation elements in the entire document
    const allNavElements = document.querySelectorAll(".site-nav--pill");
    
    // Remove all navigation elements except the one inside header__inner
    allNavElements.forEach((nav) => {
      const isInsideHeaderInner = headerInner.contains(nav);
      if (!isInsideHeaderInner) {
        // Navigation is outside header__inner, completely remove it
        console.log("Removing duplicate navigation outside header:", nav);
        nav.remove();
      } else if (nav !== correctNav && correctNav) {
        // Multiple navs inside header__inner, keep only the first one
        console.log("Removing duplicate navigation inside header:", nav);
        nav.remove();
      }
    });
    
    // Also check for navigation in wrong positions and remove them
    const navsAfterHeader = document.querySelectorAll(".site-header ~ .site-nav--pill, .site-header ~ * .site-nav--pill");
    navsAfterHeader.forEach(nav => {
      console.log("Removing navigation after header:", nav);
      nav.remove();
    });
    
    // Check for navigation in page-content and remove it
    const pageContent = document.querySelector(".page-content");
    if (pageContent) {
      const navsInContent = pageContent.querySelectorAll(".site-nav--pill");
      navsInContent.forEach(nav => {
        console.log("Removing navigation in page-content:", nav);
        nav.remove();
      });
    }
  };
  
  // Remove duplicate navigation and footer on initial load and after delays
  const removeDuplicateFooter = () => {
    if (!document.body.classList.contains("page-home")) return;
    
    // Find the main footer (should be outside page-content)
    const mainFooter = document.querySelector("body > .site-footer, body > footer.site-footer");
    
    // Find ALL footer elements
    const allFooters = document.querySelectorAll(".site-footer");
    
    // Remove footers that are inside page-content
    allFooters.forEach((footer) => {
      const pageContent = document.querySelector(".page-content");
      if (pageContent && pageContent.contains(footer)) {
        console.log("Removing duplicate footer in page-content:", footer);
        footer.remove();
      }
    });
  };
  
  removeDuplicateNav();
  removeDuplicateFooter();
  trackedSetTimeout(() => {
    removeDuplicateNav();
    removeDuplicateFooter();
  }, 50);
  trackedSetTimeout(() => {
    removeDuplicateNav();
    removeDuplicateFooter();
  }, 150);
  trackedSetTimeout(() => {
    removeDuplicateNav();
    removeDuplicateFooter();
  }, 300);
  
  // Run auto-add reveal on initial load
  autoAddReveal();
  
  const revealTargets = document.querySelectorAll("[data-reveal]");

  // Helper function to normalize path by removing baseurl
  // Baseurl is typically /Web-portfolio for GitHub Pages
  const normalizePath = (path) => {
    if (!path) return "/";
    // Remove leading/trailing slashes and normalize
    let normalized = path.replace(/^\/+|\/+$/g, "");
    // Remove baseurl if present (/Web-portfolio)
    if (normalized.startsWith("Web-portfolio")) {
      normalized = normalized.replace(/^Web-portfolio\/?/, "");
    }
    // Return with leading slash, or "/" if empty
    return normalized ? "/" + normalized : "/";
  };

  // Helper function to detect page type from path
  const detectPageType = (path) => {
    const normalized = normalizePath(path);
    // Welcome page: root path "/" or "/welcome"
    const isWelcomePage = normalized === "/" || 
                         normalized === "/welcome" || 
                         normalized.endsWith("/welcome");
    // Home page: "/home"
    const isHomePage = normalized === "/home" || 
                      normalized.endsWith("/home");
    return { isWelcomePage, isHomePage };
  };

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
        
        // Remove duplicate navigation and footer after content update
        if (document.body.classList.contains("page-home")) {
          trackedSetTimeout(() => {
            removeDuplicateNav();
            removeDuplicateFooter();
          }, 50);
          trackedSetTimeout(() => {
            removeDuplicateNav();
            removeDuplicateFooter();
          }, 150);
        }
        
        // Update body class based on page type
        const { isWelcomePage, isHomePage } = detectPageType(href);
        if (isWelcomePage) {
          document.body.className = "page-welcome";
          
          // Remove compact mode to ensure header elements are visible
          if (header && header.classList.contains("site-header--compact")) {
            header.classList.remove("site-header--compact");
          }
          
          // Force header elements to be visible immediately
          trackedSetTimeout(() => {
            const brand = document.querySelector(".site-header .site-brand");
            const video = document.querySelector(".site-header .site-header__video");
            const nav = document.querySelector(".site-header .site-nav--pill");
            
            if (brand) {
              brand.style.display = "block";
              brand.style.opacity = "1";
              brand.style.visibility = "visible";
            }
            if (video) {
              video.style.display = "flex";
              video.style.opacity = "1";
              video.style.visibility = "visible";
            }
            if (nav) {
              nav.style.display = "block";
              nav.style.opacity = "1";
              nav.style.visibility = "visible";
            }
            const marquee = document.querySelector(".site-marquee");
            if (marquee) {
              marquee.style.display = "block";
            }
          }, 50);
          
          // Reinitialize video when returning to welcome page
          const welcomeVideo = document.querySelector(".site-header__video video");
          const videoContainer = welcomeVideo ? welcomeVideo.closest(".site-header__video") : null;
          const placeholder = videoContainer ? videoContainer.querySelector(".video-placeholder") : null;
          
          if (welcomeVideo) {
            // Reset video loaded state to allow it to reload
            videoLoaded = false;
            
            // Ensure video container is visible (not in compact mode)
            if (header && header.classList.contains("site-header--compact")) {
              header.classList.remove("site-header--compact");
            }
            
            // Ensure video is visible and placeholder is hidden
            welcomeVideo.style.display = "block";
            welcomeVideo.style.visibility = "visible";
            if (placeholder) {
              placeholder.style.display = "none";
            }
            
            // Set preload to auto if not already set
            if (welcomeVideo.getAttribute("preload") !== "auto") {
              welcomeVideo.setAttribute("preload", "auto");
            }
            
            // Set up error handler
            let errorHandled = false;
            let errorTimeout;
            const handleVideoError = () => {
              if (errorHandled) return;
              if (errorTimeout) {
                clearTimeout(errorTimeout);
                const index = activeTimeouts.indexOf(errorTimeout);
                if (index > -1) activeTimeouts.splice(index, 1);
              }
              
              errorTimeout = trackedSetTimeout(() => {
                if (welcomeVideo && welcomeVideo.error && welcomeVideo.error.code !== 0) {
                  errorHandled = true;
                  welcomeVideo.style.display = "none";
                  if (placeholder) {
                    placeholder.style.display = "flex";
                  }
                }
              }, 3000);
            };
            
            const navErrorController = new AbortController();
            abortControllers.push(navErrorController);
            welcomeVideo.addEventListener("error", handleVideoError, { 
              once: false,
              signal: navErrorController.signal
            });
            
            // Hide placeholder when video loads successfully
            const hidePlaceholder = () => {
              if (errorTimeout) {
                clearTimeout(errorTimeout);
                const index = activeTimeouts.indexOf(errorTimeout);
                if (index > -1) activeTimeouts.splice(index, 1);
              }
              errorHandled = false;
              videoLoaded = true;
              if (welcomeVideo) {
                welcomeVideo.style.display = "block";
                welcomeVideo.style.visibility = "visible";
              }
              if (placeholder) {
                placeholder.style.display = "none";
              }
            };
            
            welcomeVideo.addEventListener("loadeddata", hidePlaceholder, { once: true });
            welcomeVideo.addEventListener("canplay", hidePlaceholder, { once: true });
            welcomeVideo.addEventListener("loadedmetadata", hidePlaceholder, { once: true });
            
            // Check if video is ready
            if (welcomeVideo.readyState >= 2) {
              videoLoaded = true;
              // Ensure video plays
              welcomeVideo.play().catch(err => {
                console.log("Video autoplay prevented:", err);
              });
            } else {
              // Force video to reload
              welcomeVideo.load();
              
              // Retry if needed
              trackedSetTimeout(() => {
                if (welcomeVideo && welcomeVideo.readyState === 0) {
                  welcomeVideo.load();
                }
              }, 100);
              
              // Try to play when video is ready
              const tryPlay = () => {
                welcomeVideo.play().catch(err => {
                  console.log("Video autoplay prevented:", err);
                });
              };
              welcomeVideo.addEventListener("canplay", tryPlay, { once: true });
              welcomeVideo.addEventListener("loadeddata", tryPlay, { once: true });
            }
          }
        } else if (isHomePage) {
          document.body.className = "page-home";
          
          // Reinitialize video when returning to home page
          const homeVideo = document.querySelector(".site-header__video video");
          const videoContainer = homeVideo ? homeVideo.closest(".site-header__video") : null;
          const placeholder = videoContainer ? videoContainer.querySelector(".video-placeholder") : null;
          
          if (homeVideo) {
            // Reset video loaded state to allow it to reload
            videoLoaded = false;
            
            // Ensure video container is visible (not in compact mode)
            if (header && header.classList.contains("site-header--compact")) {
              header.classList.remove("site-header--compact");
            }
            
            // Ensure video is visible and placeholder is hidden
            homeVideo.style.display = "block";
            homeVideo.style.visibility = "visible";
            if (placeholder) {
              placeholder.style.display = "none";
            }
            
            // Set preload to auto if not already set
            if (homeVideo.getAttribute("preload") !== "auto") {
              homeVideo.setAttribute("preload", "auto");
            }
            
            // Set up error handler
            let errorHandled = false;
            let errorTimeout;
            const handleVideoError = () => {
              if (errorHandled) return;
              if (errorTimeout) {
                clearTimeout(errorTimeout);
                const index = activeTimeouts.indexOf(errorTimeout);
                if (index > -1) activeTimeouts.splice(index, 1);
              }
              
              errorTimeout = trackedSetTimeout(() => {
                if (homeVideo && homeVideo.error && homeVideo.error.code !== 0) {
                  errorHandled = true;
                  homeVideo.style.display = "none";
                  if (placeholder) {
                    placeholder.style.display = "flex";
                  }
                }
              }, 3000);
            };
            
            const navErrorController = new AbortController();
            abortControllers.push(navErrorController);
            homeVideo.addEventListener("error", handleVideoError, { 
              once: false,
              signal: navErrorController.signal
            });
            
            // Hide placeholder when video loads successfully
            const hidePlaceholder = () => {
              if (errorTimeout) {
                clearTimeout(errorTimeout);
                const index = activeTimeouts.indexOf(errorTimeout);
                if (index > -1) activeTimeouts.splice(index, 1);
              }
              errorHandled = false;
              videoLoaded = true;
              if (homeVideo) {
                homeVideo.style.display = "block";
                homeVideo.style.visibility = "visible";
              }
              if (placeholder) {
                placeholder.style.display = "none";
              }
            };
            
            homeVideo.addEventListener("loadeddata", hidePlaceholder, { once: true });
            homeVideo.addEventListener("canplay", hidePlaceholder, { once: true });
            homeVideo.addEventListener("loadedmetadata", hidePlaceholder, { once: true });
            
            // Check if video is ready
            if (homeVideo.readyState >= 2) {
              videoLoaded = true;
              // Ensure video plays
              homeVideo.play().catch(err => {
                console.log("Video autoplay prevented:", err);
              });
            } else {
              // Force video to reload
              homeVideo.load();
              
              // Retry if needed
              trackedSetTimeout(() => {
                if (homeVideo && homeVideo.readyState === 0) {
                  homeVideo.load();
                }
              }, 100);
              
              // Try to play when video is ready
              const tryPlay = () => {
                homeVideo.play().catch(err => {
                  console.log("Video autoplay prevented:", err);
                });
              };
              homeVideo.addEventListener("canplay", tryPlay, { once: true });
              homeVideo.addEventListener("loadeddata", tryPlay, { once: true });
            }
          }
        } else {
          document.body.className = "page-content-page";
        }
        
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
        
        // If returning to home page, ensure video is visible and not in compact mode
        if (isHomePage) {
          // Scroll to top first to ensure we're not in compact mode
          window.scrollTo({ top: 0, behavior: "auto" });
          
      // Wait a bit for video to start loading before checking scroll position
      trackedSetTimeout(() => {
        if (window.scrollY <= 50 && header && header.classList.contains("site-header--compact")) {
          header.classList.remove("site-header--compact");
        }
      }, 100);
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
  
  // Welcome message (site-title) link should do a full page refresh
  // No custom handler needed - let it do normal page navigation
  
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
          
          // Remove duplicate navigation and footer after content update
          if (document.body.classList.contains("page-home")) {
            trackedSetTimeout(() => {
              removeDuplicateNav();
              removeDuplicateFooter();
            }, 50);
            trackedSetTimeout(() => {
              removeDuplicateNav();
              removeDuplicateFooter();
            }, 150);
          }
          
          // Update body class based on page type
          const { isWelcomePage, isHomePage } = detectPageType(currentPath);
          if (isWelcomePage) {
            document.body.className = "page-welcome";
            
            // Remove compact mode to ensure header elements are visible
            if (header && header.classList.contains("site-header--compact")) {
              header.classList.remove("site-header--compact");
            }
            
            // Force header elements to be visible immediately
            trackedSetTimeout(() => {
              const brand = document.querySelector(".site-header .site-brand");
              const video = document.querySelector(".site-header .site-header__video");
              const nav = document.querySelector(".site-header .site-nav--pill");
              
              if (brand) {
                brand.style.display = "block";
                brand.style.opacity = "1";
                brand.style.visibility = "visible";
              }
              if (video) {
                video.style.display = "flex";
                video.style.opacity = "1";
                video.style.visibility = "visible";
              }
              if (nav) {
                nav.style.display = "block";
                nav.style.opacity = "1";
                nav.style.visibility = "visible";
              }
              const marquee = document.querySelector(".site-marquee");
              if (marquee) {
                marquee.style.display = "block";
              }
            }, 50);
            
            // Reinitialize video when returning to welcome page
            const welcomeVideo = document.querySelector(".site-header__video video");
            const videoContainer = welcomeVideo ? welcomeVideo.closest(".site-header__video") : null;
            const placeholder = videoContainer ? videoContainer.querySelector(".video-placeholder") : null;
            
            if (welcomeVideo) {
              // Reset video loaded state to allow it to reload
              videoLoaded = false;
              
              // Ensure video container is visible (not in compact mode)
              if (header && header.classList.contains("site-header--compact")) {
                header.classList.remove("site-header--compact");
              }
              
              // Ensure video is visible and placeholder is hidden
              welcomeVideo.style.display = "block";
              welcomeVideo.style.visibility = "visible";
              if (placeholder) {
                placeholder.style.display = "none";
              }
              
              // Set preload to auto if not already set
              if (welcomeVideo.getAttribute("preload") !== "auto") {
                welcomeVideo.setAttribute("preload", "auto");
              }
              
              // Force video to reload
              welcomeVideo.load();
              
              // Retry if needed
              trackedSetTimeout(() => {
                if (welcomeVideo && welcomeVideo.readyState === 0) {
                  welcomeVideo.load();
                }
              }, 100);
              
              // Try to play when video is ready
              const tryPlay = () => {
                welcomeVideo.play().catch(err => {
                  console.log("Video autoplay prevented:", err);
                });
              };
              welcomeVideo.addEventListener("canplay", tryPlay, { once: true });
              welcomeVideo.addEventListener("loadeddata", tryPlay, { once: true });
            }
          } else if (isHomePage) {
            document.body.className = "page-home";
          } else {
            document.body.className = "page-content-page";
          }
          
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
  
  // Initialize: Check if video is already loaded
  const headerVideo = document.querySelector(".site-header__video video");
  const isHomePageOnLoad = document.body.classList.contains("page-home");
  const isWelcomePageOnLoad = document.body.classList.contains("page-welcome");
  
  // Track scroll position for hide/show navigation on scroll up
  let lastScrollY = window.scrollY;
  let scrollTimeout = null;
  
  // Check if current page should have hide-on-scroll-up navigation
  const shouldHideNavOnScrollUp = () => {
    return document.body.classList.contains("page-home") ||
           document.body.classList.contains("page-content-page");
  };
  
  // Initialize video on welcome page (initial load)
  if (headerVideo && isWelcomePageOnLoad) {
    // On welcome page, ensure video starts loading
    const videoContainer = headerVideo.closest(".site-header__video");
    const placeholder = videoContainer ? videoContainer.querySelector(".video-placeholder") : null;
    
    // Ensure video container is visible (not in compact mode)
    if (header && header.classList.contains("site-header--compact")) {
      header.classList.remove("site-header--compact");
    }
    
    // Ensure video is visible and placeholder is hidden
    headerVideo.style.display = "block";
    headerVideo.style.visibility = "visible";
    if (placeholder) {
      placeholder.style.display = "none";
    }
    
    // Set preload to auto if not already set
    if (headerVideo.getAttribute("preload") !== "auto") {
      headerVideo.setAttribute("preload", "auto");
    }
    
    // Set up error handler
    let errorHandled = false;
    let errorTimeout;
    const handleVideoError = () => {
      if (errorHandled) return;
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        const index = activeTimeouts.indexOf(errorTimeout);
        if (index > -1) activeTimeouts.splice(index, 1);
      }
      
      errorTimeout = trackedSetTimeout(() => {
        if (headerVideo && headerVideo.error && headerVideo.error.code !== 0) {
          errorHandled = true;
          headerVideo.style.display = "none";
          if (placeholder) {
            placeholder.style.display = "flex";
          }
        }
      }, 3000);
    };
    
    const welcomeErrorController = new AbortController();
    abortControllers.push(welcomeErrorController);
    headerVideo.addEventListener("error", handleVideoError, { 
      once: false,
      signal: welcomeErrorController.signal
    });
    
    // Hide placeholder when video loads successfully
    const hidePlaceholder = () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        const index = activeTimeouts.indexOf(errorTimeout);
        if (index > -1) activeTimeouts.splice(index, 1);
      }
      errorHandled = false;
      videoLoaded = true;
      if (headerVideo) {
        headerVideo.style.display = "block";
        headerVideo.style.visibility = "visible";
        headerVideo.style.opacity = "1";
      }
      if (placeholder) {
        placeholder.style.display = "none !important";
        placeholder.style.visibility = "hidden";
        placeholder.style.opacity = "0";
      }
    };
    
    headerVideo.addEventListener("loadeddata", hidePlaceholder, { once: true });
    headerVideo.addEventListener("canplay", hidePlaceholder, { once: true });
    headerVideo.addEventListener("loadedmetadata", hidePlaceholder, { once: true });
    headerVideo.addEventListener("canplaythrough", hidePlaceholder, { once: true });
    
    // Immediately hide placeholder if video is already loaded
    if (headerVideo.readyState >= 2) {
      hidePlaceholder();
      videoLoaded = true;
      // Ensure video plays
      headerVideo.play().catch(err => {
        console.log("Video autoplay prevented:", err);
      });
    } else {
      // Force video to load
      headerVideo.load();
      
      // Ensure placeholder is hidden while loading
      if (placeholder) {
        placeholder.style.display = "none";
        placeholder.style.visibility = "hidden";
      }
      
      // Retry if needed
      trackedSetTimeout(() => {
        if (headerVideo && headerVideo.readyState === 0) {
          headerVideo.load();
        }
        // Check again after load attempt
        if (headerVideo.readyState >= 2) {
          hidePlaceholder();
        }
      }, 200);
      
      // Try to play when video is ready
      const tryPlay = () => {
        hidePlaceholder();
        headerVideo.play().catch(err => {
          console.log("Video autoplay prevented:", err);
        });
      };
      headerVideo.addEventListener("canplay", tryPlay, { once: true });
      headerVideo.addEventListener("loadeddata", tryPlay, { once: true });
      headerVideo.addEventListener("canplaythrough", tryPlay, { once: true });
    }
  }
  
  if (headerVideo && isHomePageOnLoad) {
    // On home page, ensure video starts loading
    // Make sure video container is visible first (not in compact mode)
    const videoContainer = headerVideo.closest(".site-header__video");
    const placeholder = videoContainer ? videoContainer.querySelector(".video-placeholder") : null;
    
    if (videoContainer && header.classList.contains("site-header--compact")) {
      header.classList.remove("site-header--compact");
    }
    
    // Ensure video is visible and placeholder is hidden
    headerVideo.style.display = "block";
    headerVideo.style.visibility = "visible";
    if (placeholder) {
      placeholder.style.display = "none";
    }
    
    // Set preload to auto if not already set
    if (headerVideo.getAttribute("preload") !== "auto") {
      headerVideo.setAttribute("preload", "auto");
    }
    
    // Set up error handler - but be more lenient
    let errorHandled = false;
    let errorTimeout;
    const handleVideoError = () => {
      if (errorHandled) return;
      
      // Clear any existing timeout
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        const index = activeTimeouts.indexOf(errorTimeout);
        if (index > -1) activeTimeouts.splice(index, 1);
      }
      
      // Wait longer before showing placeholder - give video more time
      errorTimeout = trackedSetTimeout(() => {
        if (headerVideo && headerVideo.error && headerVideo.error.code !== 0) {
          // Only show placeholder if there's a persistent error
          errorHandled = true;
          headerVideo.style.display = "none";
          if (placeholder) {
            placeholder.style.display = "flex";
          }
        }
      }, 3000); // Wait 3 seconds before showing placeholder
    };
    
    // Use AbortController to manage event listeners
    const errorController = new AbortController();
    abortControllers.push(errorController);
    headerVideo.addEventListener("error", handleVideoError, { 
      once: false,
      signal: errorController.signal
    });
    
    // Hide placeholder when video loads successfully - multiple events
    const hidePlaceholder = () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        const index = activeTimeouts.indexOf(errorTimeout);
        if (index > -1) activeTimeouts.splice(index, 1);
      }
      errorHandled = false;
      headerVideo.style.display = "block";
      headerVideo.style.visibility = "visible";
      if (placeholder) {
        placeholder.style.display = "none";
      }
      // Ensure video plays when it loads - ensure muted for autoplay
      if (headerVideo) {
        headerVideo.muted = true;
        headerVideo.play().catch(err => {
          console.log("Video autoplay prevented:", err);
          // Retry after a short delay
          trackedSetTimeout(() => {
            if (headerVideo && headerVideo.readyState >= 2) {
              headerVideo.play().catch(() => {});
            }
          }, 200);
        });
      }
    };
    
    // Use a single handler to avoid duplicate event listeners
    const videoReadyHandler = () => {
      hidePlaceholder();
      // Ensure video plays
      if (headerVideo && headerVideo.paused) {
        headerVideo.muted = true;
        headerVideo.play().catch(err => {
          console.log("Video autoplay prevented:", err);
        });
      }
    };
    
    headerVideo.addEventListener("loadeddata", videoReadyHandler, { once: true });
    headerVideo.addEventListener("canplay", videoReadyHandler, { once: true });
    headerVideo.addEventListener("loadedmetadata", videoReadyHandler, { once: true });
    
    // Force video to start loading immediately
    headerVideo.load();
    
    // Unified function to attempt playing the video
    const attemptVideoPlay = () => {
      if (!headerVideo) return;
      
      // Ensure video is muted for autoplay (required by browsers)
      headerVideo.muted = true;
      
      // Only try to play if video has enough data
      if (headerVideo.readyState >= 2) {
        headerVideo.play().catch(err => {
          // Autoplay was prevented - this is normal in some browsers
          // Video will play when user interacts with page
          console.log("Video autoplay prevented (this is normal):", err.name);
        });
      } else if (headerVideo.readyState >= 1) {
        // Has metadata, wait a bit for more data
        trackedSetTimeout(attemptVideoPlay, 200);
      }
    };
    
    // Try to play immediately if ready
    attemptVideoPlay();
    
    // Also try after video loads more data
    trackedSetTimeout(() => {
      if (headerVideo && headerVideo.readyState === 0) {
        headerVideo.load();
      }
      attemptVideoPlay();
    }, 100);
    
    // Additional attempts for slow-loading videos
    trackedSetTimeout(attemptVideoPlay, 300);
    trackedSetTimeout(attemptVideoPlay, 600);
    
    // Check current ready state
    if (headerVideo.readyState >= 2) {
      videoLoaded = true;
      // Ensure video plays immediately if ready
      headerVideo.play().catch(err => {
        console.log("Video autoplay prevented:", err);
      });
    } else {
      // Wait for video to load with multiple event listeners
      const playWhenReady = () => {
        videoLoaded = true;
        // Try to play when video is ready - ensure muted for autoplay
        if (headerVideo) {
          headerVideo.muted = true;
          headerVideo.play().catch(err => {
            console.log("Video autoplay prevented:", err);
            // Retry after a short delay
            trackedSetTimeout(() => {
              if (headerVideo && headerVideo.readyState >= 2) {
                headerVideo.play().catch(() => {});
              }
            }, 200);
          });
        }
      };
      
      // Use the same handler to avoid conflicts
      headerVideo.addEventListener("loadeddata", playWhenReady, { once: true });
      headerVideo.addEventListener("canplay", playWhenReady, { once: true });
      
      // Consolidated metadata handler
      const metadataHandler = () => {
        if (headerVideo && headerVideo.readyState >= 1) {
          videoLoaded = true;
          playWhenReady();
        }
      };
      headerVideo.addEventListener("loadedmetadata", metadataHandler, { once: true });
      
      headerVideo.addEventListener("error", () => {
        // If video fails to load, allow compact mode after a delay
        trackedSetTimeout(() => {
          videoLoaded = true;
        }, 1000);
      }, { once: true });
      
      // Also check periodically in case events don't fire
      let checkCount = 0;
      const maxChecks = 30; // 3 seconds max wait
      const checkInterval = trackedSetInterval(() => {
        checkCount++;
        if (headerVideo.readyState >= 2) {
          videoLoaded = true;
          // Try to play when ready
          headerVideo.play().catch(err => {
            console.log("Video autoplay prevented:", err);
          });
          clearInterval(checkInterval);
          const index = activeIntervals.indexOf(checkInterval);
          if (index > -1) activeIntervals.splice(index, 1);
        } else if (checkCount >= maxChecks) {
          // After max time, give up and allow compact mode
          videoLoaded = true;
          clearInterval(checkInterval);
          const index = activeIntervals.indexOf(checkInterval);
          if (index > -1) activeIntervals.splice(index, 1);
        }
      }, 100);
    }
  } else {
    // No video element or not home page, allow compact mode immediately
    videoLoaded = true;
  }
  
  const handleScroll = () => {
    if (!header) return;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const shouldBeCompact = currentScrollY > 50;
        const isCompact = header.classList.contains("site-header--compact");
        const isHomePage = document.body.classList.contains("page-home");
        const isContentPage = document.body.classList.contains("page-content-page");
        const isWelcomePage = document.body.classList.contains("page-welcome");
        
        // Hide navigation bar on scroll up for home, about, resume, projects pages (not welcome)
        if ((isHomePage || isContentPage) && !isWelcomePage) {
          const navPill = header.querySelector(".site-nav--pill");
          const scrollDifference = Math.abs(currentScrollY - lastScrollY);
          
          // Only hide/show if scroll difference is significant (more than 5px)
          if (scrollDifference > 5) {
            if (currentScrollY < lastScrollY && currentScrollY > 100) {
              // Scrolling up - hide navigation
              if (navPill) {
                navPill.style.transform = "translateY(-100%)";
                navPill.style.opacity = "0";
                navPill.style.transition = "transform 0.3s ease, opacity 0.3s ease";
                navPill.style.pointerEvents = "none";
              }
            } else if (currentScrollY > lastScrollY || currentScrollY <= 100) {
              // Scrolling down or near top - show navigation
              if (navPill) {
                navPill.style.transform = "translateY(0)";
                navPill.style.opacity = "1";
                navPill.style.transition = "transform 0.3s ease, opacity 0.3s ease";
                navPill.style.pointerEvents = "auto";
              }
            }
          }
          
          lastScrollY = currentScrollY;
        }
        
        // On home page, only apply compact mode if video has loaded or user has scrolled significantly
        if (isHomePage && headerVideo && !videoLoaded) {
          // Check if video is ready to play
          if (headerVideo.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            videoLoaded = true;
          } else {
            // If video hasn't loaded yet and we're at top, don't hide it
            if (currentScrollY <= 50) {
              ticking = false;
              return;
            }
            // If scrolled but video not loaded, wait a bit more
            if (shouldBeCompact && !isCompact) {
            // Delay compact mode to give video time to load
            trackedSetTimeout(() => {
              if (headerVideo && headerVideo.readyState >= 2) {
                videoLoaded = true;
                header.classList.add("site-header--compact");
              }
            }, 500);
              ticking = false;
              return;
            }
          }
        }
        
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

  // Only apply compact mode on initial load if video is ready
  // On home page, always wait a bit to ensure video has time to start loading
  if (window.scrollY > 50) {
    if (isHomePageOnLoad && headerVideo) {
      // On home page with video, wait for video to load before applying compact mode
      // Don't apply compact mode immediately - give video time to load
      const applyCompactWhenReady = () => {
        if (videoLoaded || (headerVideo && headerVideo.readyState >= 2)) {
          handleScroll();
        } else {
          // Check again in 200ms, but max 3 seconds total
          trackedSetTimeout(applyCompactWhenReady, 200);
        }
      };
      // Start checking after a short delay to give video time to start loading
      trackedSetTimeout(applyCompactWhenReady, 200);
    } else {
      // Not home page or no video, apply compact mode immediately
      handleScroll();
    }
  }
  
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Video autoplay with max volume and hide unwanted controls
  // Only set up additional handlers if we haven't already handled this video on home page
  const video = document.querySelector(".site-header__video video");
  const videoPlaceholder = document.querySelector(".site-header__video .video-placeholder");
  
  // Skip duplicate setup if we already handled headerVideo on home page
  if (video && video !== headerVideo) {
    // Handle video errors properly - only show placeholder if video truly fails
    let errorTimeout;
    const videoErrorController = new AbortController();
    abortControllers.push(videoErrorController);
    video.addEventListener("error", (e) => {
      // Clear any pending timeouts
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        const index = activeTimeouts.indexOf(errorTimeout);
        if (index > -1) activeTimeouts.splice(index, 1);
      }
      
      // Wait a bit before showing placeholder - video might recover
      errorTimeout = trackedSetTimeout(() => {
        // Only show placeholder if video still has error after retry
        if (video && video.error && video.error.code === video.error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          // Video format not supported - show placeholder
          video.style.display = "none";
          if (videoPlaceholder) {
            videoPlaceholder.style.display = "flex";
          }
        } else if (video && video.error && video.error.code === video.error.MEDIA_ERR_NETWORK) {
          // Network error - try to reload once
          video.load();
          // If still fails after reload, show placeholder
          trackedSetTimeout(() => {
            if (video && video.error) {
              video.style.display = "none";
              if (videoPlaceholder) {
                videoPlaceholder.style.display = "flex";
              }
            }
          }, 2000);
        }
      }, 1000); // Wait 1 second before showing placeholder
    }, { once: false, signal: videoErrorController.signal });
    
    // Ensure placeholder is hidden when video loads successfully
    const playVideoWhenReady = () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        const index = activeTimeouts.indexOf(errorTimeout);
        if (index > -1) activeTimeouts.splice(index, 1);
      }
      video.style.display = "block";
      if (videoPlaceholder) {
        videoPlaceholder.style.display = "none";
      }
      // Ensure video plays when loaded - try multiple times
      const attemptPlay = () => {
        if (video && video.readyState >= 2) {
          // Ensure muted for autoplay
          video.muted = true;
          video.play().catch(err => {
            console.log("Video autoplay prevented:", err);
            // Retry after a short delay
            trackedSetTimeout(() => {
              if (video && video.readyState >= 2) {
                video.play().catch(() => {});
              }
            }, 200);
          });
        } else {
          // Wait a bit and try again
          trackedSetTimeout(attemptPlay, 100);
        }
      };
      attemptPlay();
    };
    
    video.addEventListener("loadeddata", playVideoWhenReady);
    video.addEventListener("canplay", playVideoWhenReady, { once: true });
    video.addEventListener("canplaythrough", playVideoWhenReady, { once: true });
    
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
      // Hide placeholder when metadata loads
      if (videoPlaceholder) {
        videoPlaceholder.style.display = "none";
      }
      video.style.display = "block";
      // Ensure video plays when metadata is loaded - try multiple times
      const attemptPlayFromMetadata = () => {
        if (video && video.readyState >= 1) {
          // Ensure muted for autoplay
          video.muted = true;
          video.play().catch(err => {
            console.log("Video autoplay prevented (metadata):", err);
            // Try again after a short delay
            trackedSetTimeout(() => {
              if (video && video.readyState >= 2) {
                video.muted = true;
                video.play().catch(() => {});
              }
            }, 200);
          });
        } else {
          // Wait for more data
          trackedSetTimeout(attemptPlayFromMetadata, 100);
        }
      };
      attemptPlayFromMetadata();
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

