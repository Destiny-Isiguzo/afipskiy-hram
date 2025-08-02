document.addEventListener('DOMContentLoaded', () => {
   // Initialize all functionality
   initNavigation();
   initStickyHeader();
   initLazyLoading();
   initCarousel();
   initPerformanceMonitoring();
   initScheduleSystem();
   initNewsSystem();
   initSvyatyniTabs();

   console.log('🚀 All systems initialized');

   // Footer year
   const yearEl = document.querySelector('.year');
   if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
   }
});

/**
 * Enhanced Navigation functionality with overlay
 */
function initNavigation() {
   const menuOpenBtn = document.getElementById('menu-open');
   const menuCloseBtn = document.getElementById('menu-close');
   const navMenu = document.getElementById('nav-wrapper');
   const navOverlay = document.getElementById('nav-overlay');

   if (!menuOpenBtn || !menuCloseBtn || !navMenu || !navOverlay) return;

   // Function to open the menu
   const openMenu = () => {
      navMenu.classList.add('nav-active');
      navOverlay.classList.add('overlay-active');
      document.body.style.overflow = 'hidden';

      // Focus management for accessibility
      // menuCloseBtn.focus();
   };

   // Function to close the menu
   const closeMenu = () => {
      navMenu.classList.remove('nav-active');
      navOverlay.classList.remove('overlay-active');
      document.body.style.overflow = '';

      // Return focus to menu open button
      // menuOpenBtn.focus();
   };

   // Add event listeners
   menuOpenBtn.addEventListener('click', openMenu);
   menuCloseBtn.addEventListener('click', closeMenu);

   // Close nav when clicking on overlay
   navOverlay.addEventListener('click', closeMenu);

   // Close nav when clicking outside (keeping original functionality)
   document.addEventListener('click', (e) => {
      if (
         !navMenu.contains(e.target) &&
         !menuOpenBtn.contains(e.target) &&
         !navOverlay.contains(e.target)
      ) {
         if (navMenu.classList.contains('nav-active')) {
            closeMenu();
         }
      }
   });

   // Close nav on escape key
   document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('nav-active')) {
         closeMenu();
      }
   });

   // Trap focus within navigation when open
   navMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && navMenu.classList.contains('nav-active')) {
         const focusableElements = navMenu.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
         );
         const firstElement = focusableElements[0];
         const lastElement = focusableElements[focusableElements.length - 1];

         if (e.shiftKey) {
            if (document.activeElement === firstElement) {
               lastElement.focus();
               e.preventDefault();
            }
         } else {
            if (document.activeElement === lastElement) {
               firstElement.focus();
               e.preventDefault();
            }
         }
      }
   });

   // Handle window resize - close menu if screen becomes large
   let resizeTimeout;
   window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
         if (
            window.innerWidth > 912 &&
            navMenu.classList.contains('nav-active')
         ) {
            closeMenu();
         }
      }, 150);
   });

   // Prevent body scroll when menu is open on touch devices
   let touchStartY = 0;

   navMenu.addEventListener(
      'touchstart',
      (e) => {
         touchStartY = e.touches[0].clientY;
      },
      { passive: true }
   );

   navMenu.addEventListener(
      'touchmove',
      (e) => {
         if (navMenu.classList.contains('nav-active')) {
            const touchY = e.touches[0].clientY;
            const touchDelta = touchY - touchStartY;

            // Prevent scrolling if at boundaries
            if (
               (navMenu.scrollTop === 0 && touchDelta > 0) ||
               (navMenu.scrollHeight - navMenu.clientHeight <=
                  navMenu.scrollTop &&
                  touchDelta < 0)
            ) {
               e.preventDefault();
            }
         }
      },
      { passive: false }
   );
}

/**
 * Sticky header functionality
 */
function initStickyHeader() {
   const header = document.querySelector('.header');
   if (!header) return;

   let ticking = false;

   const updateHeader = () => {
      if (window.scrollY > 0) {
         header.classList.add('header-sticky');
      } else {
         header.classList.remove('header-sticky');
      }
      ticking = false;
   };

   window.addEventListener('scroll', () => {
      if (!ticking) {
         requestAnimationFrame(updateHeader);
         ticking = true;
      }
   });
}

/**
 * Optimized Lazy Loading System
 */
function initLazyLoading() {
   const lazyImages = document.querySelectorAll('.lazy-image[data-src]');
   const loadedImages = new Set();
   let observer;

   // Performance tracking
   const performanceData = {
      totalImages: lazyImages.length,
      loadedCount: 0,
      loadTimes: [],
      startTime: performance.now(),
   };

   // Load image function
   function loadImage(img) {
      if (loadedImages.has(img)) return;

      const container = img.closest('.image-container');
      const placeholder = container?.querySelector('.image-placeholder');
      const startTime = performance.now();

      // Create preloader
      const imageLoader = new Image();

      imageLoader.onload = () => {
         const loadTime = performance.now() - startTime;

         // Set image source and add loaded class
         img.src = img.dataset.src;
         img.classList.add('loaded', 'fade-in');
         container?.classList.add('loaded');

         // Track performance
         performanceData.loadedCount++;
         performanceData.loadTimes.push(loadTime);
         updatePerformanceIndicator(loadTime);

         // Remove placeholder after transition
         setTimeout(() => {
            if (placeholder) {
               placeholder.style.display = 'none';
            }
         }, 500);

         loadedImages.add(img);
      };

      imageLoader.onerror = () => {
         img.classList.add('error');
         container?.classList.add('error');
         if (placeholder) {
            placeholder.innerHTML =
               '<span style="color: #6c757d; font-size: 14px;">Ошибка загрузки</span>';
         }
         loadedImages.add(img);
      };

      // Start loading
      imageLoader.src = img.dataset.src;
   }

   // Intersection Observer setup
   if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  loadImage(entry.target);
                  observer.unobserve(entry.target);
               }
            });
         },
         {
            threshold: 0.5,
            rootMargin: '100px',
         }
      );

      // Observe all lazy images
      lazyImages.forEach((img) => {
         observer.observe(img);
      });
   } else {
      // Fallback for browsers without Intersection Observer
      lazyImages.forEach(loadImage);
   }

   // Preload critical images (logo and first carousel slide)
   function preloadCriticalImages() {
      const logo = document.querySelector('.logo.lazy-image');
      const firstSlideImg = document.querySelector(
         '.carousel-slide.slide-active .lazy-image'
      );

      if (logo) loadImage(logo);
      if (firstSlideImg) loadImage(firstSlideImg);
   }

   // Preload critical images immediately
   preloadCriticalImages();

   // Expose function for carousel integration
   window.lazyLoadImage = loadImage;
   window.lazyLoadPerformance = performanceData;
}

/**
 * Enhanced Carousel with lazy loading integration
 */
function initCarousel() {
   const carousel = document.getElementById('heroCarousel');
   if (!carousel) return;

   const slides = carousel.querySelectorAll('.carousel-slide');
   if (slides.length === 0) return;

   const prevBtn = carousel.querySelector('.prev');
   const nextBtn = carousel.querySelector('.next');
   const indicatorsContainer = carousel.querySelector('.carousel-indicators');

   let currentIndex = 0;
   let autoPlayInterval = null;
   let touchStartX = 0;
   let touchEndX = 0;
   let isTransitioning = false;

   // Create indicators
   slides.forEach((_, index) => {
      const indicator = document.createElement('button');
      indicator.classList.add('carousel-indicator');
      indicator.setAttribute('role', 'tab');
      indicator.setAttribute('aria-label', `Слайд ${index + 1}`);
      indicator.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

      if (index === 0) {
         indicator.classList.add('indicator-active');
      }

      indicator.addEventListener('click', () => {
         if (!isTransitioning) {
            goToSlide(index);
         }
      });

      indicatorsContainer.appendChild(indicator);
   });

   const indicators = carousel.querySelectorAll('.carousel-indicator');

   // Function to go to a specific slide
   function goToSlide(index) {
      if (isTransitioning) return;

      // Handle edge cases
      if (index < 0) {
         index = slides.length - 1;
      } else if (index >= slides.length) {
         index = 0;
      }

      if (index === currentIndex) return;

      isTransitioning = true;

      // Update current slide
      slides[currentIndex].classList.remove('slide-active');
      slides[currentIndex].setAttribute('aria-hidden', 'true');
      indicators[currentIndex].classList.remove('indicator-active');
      indicators[currentIndex].setAttribute('aria-selected', 'false');

      // Set new current slide
      currentIndex = index;
      slides[currentIndex].classList.add('slide-active');
      slides[currentIndex].setAttribute('aria-hidden', 'false');
      indicators[currentIndex].classList.add('indicator-active');
      indicators[currentIndex].setAttribute('aria-selected', 'true');

      // Preload current and next slide images for optimal performance
      const currentSlideImg = slides[currentIndex].querySelector('.lazy-image');
      const nextSlideImg =
         slides[(currentIndex + 1) % slides.length].querySelector(
            '.lazy-image'
         );

      if (currentSlideImg && window.lazyLoadImage) {
         window.lazyLoadImage(currentSlideImg);
      }

      // Preload next slide for smoother transitions
      setTimeout(() => {
         if (nextSlideImg && window.lazyLoadImage) {
            window.lazyLoadImage(nextSlideImg);
         }
      }, 300);

      // Announce slide change for screen readers
      announceSlideChange(currentIndex + 1, slides.length);

      // Reset autoplay timer if enabled
      if (autoPlayInterval) {
         resetAutoPlay();
      }

      // Reset transition flag
      setTimeout(() => {
         isTransitioning = false;
      }, 800);
   }

   // Function to go to the next slide
   function nextSlide() {
      goToSlide(currentIndex + 1);
   }

   // Function to go to the previous slide
   function prevSlide() {
      goToSlide(currentIndex - 1);
   }

   // Set up auto play
   function startAutoPlay() {
      if (slides.length <= 1) return;

      carousel.classList.add('auto-play-active');
      autoPlayInterval = setInterval(() => {
         if (!isTransitioning) {
            nextSlide();
         }
      }, 5000);
   }

   // Reset auto play
   function resetAutoPlay() {
      if (autoPlayInterval) {
         clearInterval(autoPlayInterval);
         startAutoPlay();
      }
   }

   // Stop auto play
   function stopAutoPlay() {
      if (autoPlayInterval) {
         clearInterval(autoPlayInterval);
         autoPlayInterval = null;
         carousel.classList.remove('auto-play-active');
      }
   }

   // Create an accessible live region for screen readers
   function setupLiveRegion() {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.classList.add('sr-only');
      liveRegion.id = 'carousel-live-region';
      carousel.appendChild(liveRegion);

      // Add CSS for screen reader only content
      if (!document.getElementById('sr-only-styles')) {
         const style = document.createElement('style');
         style.id = 'sr-only-styles';
         style.textContent = `
               .sr-only {
                  position: absolute;
                  width: 1px;
                  height: 1px;
                  padding: 0;
                  margin: -1px;
                  overflow: hidden;
                  clip: rect(0, 0, 0, 0);
                  white-space: nowrap;
                  border-width: 0;
               }
            `;
         document.head.appendChild(style);
      }
   }

   // Announce slide changes to screen readers
   function announceSlideChange(current, total) {
      const liveRegion = document.getElementById('carousel-live-region');
      if (liveRegion) {
         liveRegion.textContent = `Слайд ${current} из ${total}`;
      }
   }

   // Handle touch events for swipe functionality
   function handleTouchStart(e) {
      touchStartX = e.touches[0].clientX;
   }

   function handleTouchEnd(e) {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
   }

   function handleSwipe() {
      if (isTransitioning) return;

      const swipeThreshold = 50;
      const swipeDistance = touchEndX - touchStartX;

      if (swipeDistance > swipeThreshold) {
         prevSlide();
      } else if (swipeDistance < -swipeThreshold) {
         nextSlide();
      }
   }

   // Handle keyboard navigation
   function handleKeyDown(e) {
      if (isTransitioning) return;

      if (e.key === 'ArrowLeft') {
         prevSlide();
         e.preventDefault();
      } else if (e.key === 'ArrowRight') {
         nextSlide();
         e.preventDefault();
      }
   }

   // Handle visibility change (pause when tab is inactive)
   function handleVisibilityChange() {
      if (document.hidden) {
         stopAutoPlay();
      } else if (slides.length > 1) {
         startAutoPlay();
      }
   }

   // Throttled resize handler
   let resizeTimeout;
   function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
         // Recalculate any size-dependent values if needed
         // Currently not needed but available for future enhancements
      }, 250);
   }

   // Set up event listeners
   if (prevBtn) {
      prevBtn.addEventListener('click', () => {
         if (!isTransitioning) prevSlide();
      });
   }

   if (nextBtn) {
      nextBtn.addEventListener('click', () => {
         if (!isTransitioning) nextSlide();
      });
   }

   carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
   carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
   carousel.addEventListener('keydown', handleKeyDown);

   window.addEventListener('resize', handleResize);
   document.addEventListener('visibilitychange', handleVisibilityChange);

   // Initialize
   setupLiveRegion();

   // Start autoplay if more than one slide
   if (slides.length > 1) {
      startAutoPlay();
   } else {
      // Hide controls if only one slide
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      indicatorsContainer.style.display = 'none';
   }

   // Pause autoplay when user interacts with controls
   carousel.addEventListener('mouseenter', () => {
      if (autoPlayInterval) {
         stopAutoPlay();
      }
   });

   carousel.addEventListener('mouseleave', () => {
      if (!autoPlayInterval && slides.length > 1) {
         startAutoPlay();
      }
   });

   // Handle focus management
   carousel.addEventListener('focusin', () => {
      if (autoPlayInterval) {
         stopAutoPlay();
      }
   });

   carousel.addEventListener('focusout', (e) => {
      if (!carousel.contains(e.relatedTarget) && slides.length > 1) {
         setTimeout(() => {
            if (!carousel.contains(document.activeElement)) {
               startAutoPlay();
            }
         }, 100);
      }
   });
}

/**
 * Performance Monitoring System
 */
function initPerformanceMonitoring() {
   // Create performance indicator
   const perfIndicator = document.createElement('div');
   perfIndicator.className = 'perf-indicator';
   perfIndicator.id = 'perf-indicator';
   document.body.appendChild(perfIndicator);

   let totalLoadTime = 0;
   let imageCount = 0;

   // Update performance indicator
   window.updatePerformanceIndicator = function (loadTime) {
      totalLoadTime += loadTime;
      imageCount++;

      const avgLoadTime = Math.round(totalLoadTime / imageCount);
      const performance = window.lazyLoadPerformance;

      perfIndicator.innerHTML = `
            <div>Images: ${performance.loadedCount}/${
         performance.totalImages
      }</div>
            <div>Avg Load: ${avgLoadTime}ms</div>
            <div>Last Load: ${Math.round(loadTime)}ms</div>
         `;

      // Show indicator temporarily
      // perfIndicator.classList.add('show');

      // Hide after 3 seconds
      setTimeout(() => {
         perfIndicator.classList.remove('show');
      }, 3000);
   };

   // Monitor overall page performance
   window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

      console.log(`Page loaded in ${Math.round(loadTime)}ms`);

      // Log image performance summary
      setTimeout(() => {
         const performance = window.lazyLoadPerformance;
         if (performance && performance.loadTimes.length > 0) {
            const avgImageLoad =
               performance.loadTimes.reduce((a, b) => a + b, 0) /
               performance.loadTimes.length;
            console.log(
               `Average image load time: ${Math.round(avgImageLoad)}ms`
            );
            console.log(
               `Total images loaded: ${performance.loadedCount}/${performance.totalImages}`
            );
         }
      }, 2000);
   });

   // Monitor Core Web Vitals (if supported)
   if ('PerformanceObserver' in window) {
      try {
         const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
               if (entry.entryType === 'largest-contentful-paint') {
                  console.log(`LCP: ${Math.round(entry.startTime)}ms`);
               }
               if (entry.entryType === 'first-input') {
                  console.log(
                     `FID: ${Math.round(
                        entry.processingStart - entry.startTime
                     )}ms`
                  );
               }
               if (entry.entryType === 'layout-shift') {
                  console.log(`CLS: ${entry.value}`);
               }
            });
         });

         observer.observe({
            entryTypes: [
               'largest-contentful-paint',
               'first-input',
               'layout-shift',
            ],
         });
      } catch (e) {
         console.log('Performance monitoring not fully supported');
      }
   }
}

// Utility functions for edge cases
function handleImageErrors() {
   // Global error handler for images
   document.addEventListener(
      'error',
      (e) => {
         if (e.target.tagName === 'IMG') {
            console.warn(`Failed to load image: ${e.target.src}`);
            e.target.classList.add('error');

            const container = e.target.closest('.image-container');
            if (container) {
               container.classList.add('error');
            }
         }
      },
      true
   );
}

// Initialize error handling
handleImageErrors();

// Expose utilities for debugging
window.carouselDebug = {
   getCurrentSlide: () =>
      document.querySelector('.carousel-slide.slide-active'),
   getLoadedImages: () => document.querySelectorAll('.lazy-image.loaded'),
   getPerformanceData: () => window.lazyLoadPerformance,
   forceLoadAllImages: () => {
      document.querySelectorAll('.lazy-image[data-src]').forEach((img) => {
         if (window.lazyLoadImage) {
            window.lazyLoadImage(img);
         }
      });
   },
};

/**
 * Enhanced Schedule Management System
 * Features: Dynamic loading, admin panel, notifications, keyboard shortcuts
 */

class ScheduleManager {
   constructor() {
      this.scheduleData = null;
      this.isLoading = false;
      this.settings = {
         autoScroll: true,
         notifications: true,
         debugMode: false,
      };
      this.secretSequence = '';
      this.secretTarget = 'admin';
      this.clickCount = 0;
      this.clickTimer = null;

      this.init();
   }

   init() {
      this.loadSettings();
      this.setupEventListeners();
      this.loadScheduleData();
      this.setupKeyboardShortcuts();
      this.setupSecretTriggers();
      this.startAutoRefresh();

      this.debug('🚀 Schedule Manager initialized');
   }

   debug(message, data = null) {
      if (this.settings.debugMode) {
         console.log(`[ScheduleManager] ${message}`, data || '');
      }
   }

   // Data Loading and Management
   async loadScheduleData() {
      this.showLoading();

      try {
         const response = await fetch('schedule-data.json');
         if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
         }

         this.scheduleData = await response.json();
         this.validateScheduleData();
         this.renderSchedule();
         this.updateStats();
         this.hideLoading();

         if (this.settings.autoScroll) {
            this.scrollToToday();
         }

         // this.debug('📅 Schedule data loaded successfully', this.scheduleData);
         // this.showNotification(
         //    'success',
         //    'Расписание загружено',
         //    'Данные успешно обновлены'
         // );
      } catch (error) {
         this.debug('❌ Error loading schedule data', error);
         this.showError(error.message);
         this.showNotification('error', 'Ошибка загрузки', error.message);
      }
   }

   validateScheduleData() {
      if (!this.scheduleData || !this.scheduleData.services) {
         throw new Error(
            'Неверная структура данных: отсутствует массив services'
         );
      }

      if (!Array.isArray(this.scheduleData.services)) {
         throw new Error('services должен быть массивом');
      }

      this.scheduleData.services.forEach((service, index) => {
         const requiredFields = [
            'id',
            'date',
            'dayNumber',
            'month',
            'weekday',
            'title',
            'times',
         ];

         for (const field of requiredFields) {
            if (!service[field]) {
               throw new Error(
                  `Отсутствует обязательное поле "${field}" в службе ${
                     index + 1
                  }`
               );
            }
         }

         if (!Array.isArray(service.times)) {
            throw new Error(`times должен быть массивом в службе ${index + 1}`);
         }

         service.times.forEach((time, timeIndex) => {
            if (!time.time || !time.type) {
               throw new Error(
                  `Неверная структура времени ${timeIndex + 1} в службе ${
                     index + 1
                  }`
               );
            }
         });
      });

      this.debug('✅ Schedule data validation passed');
   }

   renderSchedule() {
      const container = document.getElementById('schedule-content');
      if (!container) return;

      container.innerHTML = '';

      // Sort services by date
      const sortedServices = [...this.scheduleData.services].sort(
         (a, b) => new Date(a.date) - new Date(b.date)
      );

      sortedServices.forEach((service, index) => {
         const serviceElement = this.createServiceElement(service, index);
         container.appendChild(serviceElement);
      });

      this.debug(`📋 Rendered ${sortedServices.length} services`);
   }

   createServiceElement(service, index) {
      const serviceEl = document.createElement('div');
      const status = this.getServiceStatus(service.date);
      const priority = service.priority || 'medium';

      serviceEl.className = `schedule-item ${status} priority-${priority}`;
      serviceEl.setAttribute('data-service-id', service.id);
      serviceEl.setAttribute('data-date', service.date);
      serviceEl.style.animationDelay = `${index * 0.1}s`;

      // Create times HTML
      const timesHTML = service.times
         .map(
            (timeInfo) => `
         <div class="service-time">
            <i class="${timeInfo.icon || 'bi bi-clock'}"></i>
            <span class="service-time-value">${timeInfo.time}</span>
            <span class="service-type">${timeInfo.type}</span>
         </div>
      `
         )
         .join('');

      serviceEl.innerHTML = `
         <div class="schedule-date">
            <div class="date-day">${service.dayNumber}</div>
            <div class="date-info">
               <span class="date-month">${service.month}</span>
               <span class="date-weekday">${service.weekday}</span>
            </div>
         </div>
         <div class="schedule-details">
            <h3 class="service-title">${service.title}</h3>
            <div class="service-times">
               ${timesHTML}
            </div>
            ${
               service.note
                  ? `<p class="service-note">📝 ${service.note}</p>`
                  : ''
            }
         </div>
      `;

      // Add click handler for sharing
      serviceEl.addEventListener('click', () => this.shareService(service));

      return serviceEl;
   }

   getServiceStatus(dateString) {
      const serviceDate = new Date(dateString);
      const today = new Date();

      // Reset time to compare only dates
      serviceDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (serviceDate < today) return 'past';
      if (serviceDate.getTime() === today.getTime()) return 'today';
      return 'future';
   }

   updateStats() {
      const totalServices = this.scheduleData?.services?.length || 0;
      const lastUpdated = this.scheduleData?.metadata?.lastUpdated;

      const totalEl = document.getElementById('total-services');
      const updatedEl = document.getElementById('last-updated');

      if (totalEl) totalEl.textContent = totalServices;
      if (updatedEl && lastUpdated) {
         const date = new Date(lastUpdated);
         updatedEl.textContent = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
         });
      }
   }

   scrollToToday() {
      setTimeout(() => {
         const todayElement = document.querySelector('.schedule-item.today');
         if (todayElement) {
            todayElement.scrollIntoView({
               behavior: 'smooth',
               block: 'center',
            });
            this.debug("📍 Scrolled to today's service");
         }
      }, 500);
   }

   // UI State Management
   showLoading() {
      const loading = document.getElementById('schedule-loading');
      const content = document.getElementById('schedule-content');
      const error = document.getElementById('schedule-error');

      if (loading) loading.style.display = 'block';
      if (content) content.style.display = 'none';
      if (error) error.style.display = 'none';

      this.isLoading = true;
   }

   hideLoading() {
      const loading = document.getElementById('schedule-loading');
      const content = document.getElementById('schedule-content');

      if (loading) loading.style.display = 'none';
      if (content) content.style.display = 'grid';

      this.isLoading = false;
   }

   showError(message) {
      const loading = document.getElementById('schedule-loading');
      const content = document.getElementById('schedule-content');
      const error = document.getElementById('schedule-error');

      if (loading) loading.style.display = 'none';
      if (content) content.style.display = 'none';
      if (error) {
         error.style.display = 'block';
         const errorText = error.querySelector('p');
         if (errorText) errorText.textContent = message;
      }
   }

   // Event Listeners
   setupEventListeners() {
      // Refresh button
      const refreshBtn = document.querySelector('.schedule-refresh-btn');
      if (refreshBtn) {
         refreshBtn.addEventListener('click', () => this.refreshSchedule());
      }

      // Share button
      const shareBtn = document.querySelector('.schedule-share-btn');
      if (shareBtn) {
         shareBtn.addEventListener('click', () => this.shareSchedule());
      }

      // Retry button
      window.ScheduleManager = {
         retryLoad: () => this.loadScheduleData(),
      };
   }

   setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
         // Ctrl+Shift+A for admin panel
         if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            AdminPanel.toggle();
            this.debug('⌨️ Admin panel toggled via keyboard');
         }

         // Ctrl+Shift+R for refresh
         if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            this.refreshSchedule();
            this.debug('⌨️ Schedule refreshed via keyboard');
         }

         // Escape to close admin panel
         if (e.key === 'Escape') {
            AdminPanel.close();
         }
      });
   }

   setupSecretTriggers() {
      // Secret sequence typing
      document.addEventListener('keypress', (e) => {
         this.secretSequence += e.key.toLowerCase();

         if (this.secretSequence.length > this.secretTarget.length) {
            this.secretSequence = this.secretSequence.slice(
               -this.secretTarget.length
            );
         }

         if (this.secretSequence === this.secretTarget) {
            this.showAdminTrigger();
            this.secretSequence = '';
            this.debug('🔐 Secret sequence activated');
         }
      });

      // Multi-click detection on title
      const title = document.querySelector('.schedule-title');
      if (title) {
         title.addEventListener('click', () => {
            this.clickCount++;

            if (this.clickTimer) {
               clearTimeout(this.clickTimer);
            }

            this.clickTimer = setTimeout(() => {
               if (this.clickCount === 3) {
                  this.showAdminTrigger();
                  this.debug('🖱️ Triple-click admin trigger activated');
               }
               this.clickCount = 0;
            }, 500);
         });
      }
   }

   showAdminTrigger() {
      const trigger = document.getElementById('admin-trigger');
      if (trigger) {
         trigger.style.display = 'block';
         this.showNotification(
            'info',
            'Режим администратора',
            'Панель управления активирована'
         );
      }
   }

   // Auto-refresh functionality
   startAutoRefresh() {
      // Refresh at midnight to update "today" highlighting
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 1, 0); // 1 second after midnight

      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      setTimeout(() => {
         this.refreshSchedule();
         this.debug('🌅 Auto-refresh at midnight');

         // Set up daily refresh
         setInterval(() => {
            this.refreshSchedule();
            this.debug('🔄 Daily auto-refresh');
         }, 24 * 60 * 60 * 1000); // 24 hours
      }, msUntilMidnight);
   }

   // Public Methods
   async refreshSchedule() {
      if (this.isLoading) return;

      this.debug('🔄 Refreshing schedule data');
      await this.loadScheduleData();
   }

   async shareSchedule() {
      if (!this.scheduleData) return;

      const shareData = {
         title: '📅 Расписание богослужений',
         text: `Расписание богослужений Свято-Георгиевского храма\n${
            this.scheduleData.metadata?.weekPeriod || ''
         }`,
         url: window.location.href,
      };

      try {
         if (navigator.share) {
            await navigator.share(shareData);
            this.debug('📤 Schedule shared via Web Share API');
         } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(
               `${shareData.title}\n${shareData.text}\n${shareData.url}`
            );
            this.showNotification(
               'success',
               'Скопировано',
               'Ссылка скопирована в буфер обмена'
            );
            this.debug('📋 Schedule link copied to clipboard');
         }
      } catch (error) {
         this.debug('❌ Share failed', error);
         this.showNotification(
            'error',
            'Ошибка',
            'Не удалось поделиться расписанием'
         );
      }
   }

   async shareService(service) {
      const serviceText = `📅 ${service.title}\n📍 ${service.dayNumber} ${
         service.month
      } (${service.weekday})\n⏰ ${service.times
         .map((t) => `${t.time} - ${t.type}`)
         .join('\n⏰ ')}`;

      try {
         if (navigator.share) {
            await navigator.share({
               title: '⛪ Богослужение',
               text: serviceText,
               url: window.location.href,
            });
         } else {
            await navigator.clipboard.writeText(serviceText);
            this.showNotification(
               'success',
               'Скопировано',
               'Информация о службе скопирована'
            );
         }
         this.debug('📤 Service shared', service);
      } catch (error) {
         this.debug('❌ Service share failed', error);
      }
   }

   // Settings Management
   loadSettings() {
      const saved = localStorage.getItem('scheduleSettings');
      if (saved) {
         this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
   }

   saveSettings() {
      localStorage.setItem('scheduleSettings', JSON.stringify(this.settings));
      this.debug('💾 Settings saved', this.settings);
   }

   updateSetting(key, value) {
      this.settings[key] = value;
      this.saveSettings();
      this.debug(`⚙️ Setting updated: ${key} = ${value}`);
   }

   // Notification System
   showNotification(type, title, message, duration = 5000) {
      if (!this.settings.notifications) return;

      const container = document.getElementById('notification-container');
      if (!container) return;

      const notification = document.createElement('div');
      notification.className = `notification ${type}`;

      const icons = {
         success: 'bi-check-circle',
         error: 'bi-exclamation-triangle',
         warning: 'bi-exclamation-circle',
         info: 'bi-info-circle',
      };

      notification.innerHTML = `
         <div class="notification-icon">
            <i class="${icons[type] || icons.info}"></i>
         </div>
         <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
         </div>
         <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
         </button>
      `;

      container.appendChild(notification);

      // Show notification
      setTimeout(() => notification.classList.add('show'), 100);

      // Auto-remove
      setTimeout(() => {
         notification.classList.remove('show');
         setTimeout(() => notification.remove(), 400);
      }, duration);

      this.debug(`📢 Notification: ${type} - ${title}`);
   }
}

/**
 * Enhanced Admin Panel System
 */
class AdminPanelManager {
   constructor() {
      this.isVisible = false;
      this.isMinimized = false;
      this.currentTab = 'editor';
      this.originalData = null;

      this.init();
   }

   init() {
      this.setupEventListeners();
      this.setupFileUpload();
      this.loadBackups();
      this.debug('🛠️ Admin Panel initialized');
   }

   debug(message, data = null) {
      if (window.scheduleManager?.settings?.debugMode) {
         console.log(`[AdminPanel] ${message}`, data || '');
      }
   }

   setupEventListeners() {
      // Tab switching
      document.querySelectorAll('.admin-tab').forEach((tab) => {
         tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            this.switchTab(tabName);
         });
      });

      // Settings checkboxes
      const autoScrollSetting = document.getElementById('auto-scroll-setting');
      const notificationsSetting = document.getElementById(
         'notifications-setting'
      );
      const debugModeSetting = document.getElementById('debug-mode-setting');

      if (autoScrollSetting) {
         autoScrollSetting.checked =
            window.scheduleManager?.settings?.autoScroll || false;
         autoScrollSetting.addEventListener('change', (e) => {
            window.scheduleManager?.updateSetting(
               'autoScroll',
               e.target.checked
            );
         });
      }

      if (notificationsSetting) {
         notificationsSetting.checked =
            window.scheduleManager?.settings?.notifications || false;
         notificationsSetting.addEventListener('change', (e) => {
            window.scheduleManager?.updateSetting(
               'notifications',
               e.target.checked
            );
         });
      }

      if (debugModeSetting) {
         debugModeSetting.checked =
            window.scheduleManager?.settings?.debugMode || false;
         debugModeSetting.addEventListener('change', (e) => {
            window.scheduleManager?.updateSetting(
               'debugMode',
               e.target.checked
            );
         });
      }

      // Overlay click to close
      const overlay = document.getElementById('admin-overlay');
      if (overlay) {
         overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
               this.close();
            }
         });
      }
   }

   setupFileUpload() {
      const uploadArea = document.getElementById('file-upload-area');
      const fileInput = document.getElementById('file-input');

      if (!uploadArea || !fileInput) return;

      // Click to select file
      uploadArea.addEventListener('click', () => fileInput.click());

      // Drag and drop
      uploadArea.addEventListener('dragover', (e) => {
         e.preventDefault();
         uploadArea.classList.add('dragover');
      });

      uploadArea.addEventListener('dragleave', () => {
         uploadArea.classList.remove('dragover');
      });

      uploadArea.addEventListener('drop', (e) => {
         e.preventDefault();
         uploadArea.classList.remove('dragover');

         const files = e.dataTransfer.files;
         if (files.length > 0) {
            this.handleFileUpload(files[0]);
         }
      });

      // File input change
      fileInput.addEventListener('change', (e) => {
         if (e.target.files.length > 0) {
            this.handleFileUpload(e.target.files[0]);
         }
      });
   }

   async handleFileUpload(file) {
      this.updateStatus('Обработка файла...', 'info');

      try {
         const fileType = file.name.split('.').pop().toLowerCase();
         let data;

         if (fileType === 'json') {
            const text = await file.text();
            data = JSON.parse(text);
         } else if (fileType === 'csv') {
            data = await this.parseCSV(file);
         } else if (fileType === 'xlsx') {
            data = await this.parseExcel(file);
         } else {
            throw new Error('Неподдерживаемый формат файла');
         }

         this.loadDataToEditor(data);
         this.updateStatus('Файл успешно загружен', 'success');
         this.debug('📁 File uploaded and parsed', { type: fileType, data });
      } catch (error) {
         this.updateStatus(`Ошибка: ${error.message}`, 'error');
         this.debug('❌ File upload failed', error);
      }
   }

   async parseCSV(file) {
      // Basic CSV parsing for schedule data
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim());

      const services = lines.slice(1).map((line, index) => {
         const values = line.split(',').map((v) => v.trim());
         const service = {
            id: `imported-${index + 1}`,
            date: values[0] || '',
            dayNumber: parseInt(values[1]) || 1,
            month: values[2] || '',
            weekday: values[3] || '',
            title: values[4] || '',
            times: [
               {
                  time: values[5] || '8:00',
                  type: values[6] || 'Богослужение',
                  icon: 'bi-clock',
               },
            ],
            note: values[7] || '',
            priority: values[8] || 'medium',
         };
         return service;
      });

      return {
         metadata: {
            lastUpdated: new Date().toISOString(),
            version: '1.0',
            weekPeriod: 'Импортированное расписание',
         },
         services,
      };
   }

   async parseExcel(file) {
      // This would require a library like SheetJS
      // For now, show a message about Excel support
      throw new Error(
         'Поддержка Excel файлов будет добавлена в следующей версии'
      );
   }

   switchTab(tabName) {
      // Update tab buttons
      document.querySelectorAll('.admin-tab').forEach((tab) => {
         tab.classList.toggle('active', tab.dataset.tab === tabName);
      });

      // Update tab panels
      document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
         panel.classList.toggle('active', panel.id === `${tabName}-panel`);
      });

      this.currentTab = tabName;

      // Load data for editor tab
      if (tabName === 'editor' && window.scheduleManager?.scheduleData) {
         this.loadDataToEditor(window.scheduleManager.scheduleData);
      }

      this.debug(`📑 Switched to tab: ${tabName}`);
   }

   loadDataToEditor(data) {
      const editor = document.getElementById('admin-json-editor');
      if (editor) {
         editor.value = JSON.stringify(data, null, 2);
         this.originalData = JSON.parse(JSON.stringify(data));
      }
   }

   formatJSON() {
      const editor = document.getElementById('admin-json-editor');
      if (!editor) return;

      try {
         const data = JSON.parse(editor.value);
         editor.value = JSON.stringify(data, null, 2);
         this.updateStatus('JSON отформатирован', 'success');
         this.debug('✨ JSON formatted');
      } catch (error) {
         this.updateStatus('Ошибка форматирования JSON', 'error');
         this.debug('❌ JSON format failed', error);
      }
   }

   validateJSON() {
      const editor = document.getElementById('admin-json-editor');
      if (!editor) return;

      try {
         const data = JSON.parse(editor.value);

         // Validate structure
         if (!data.services || !Array.isArray(data.services)) {
            throw new Error('Отсутствует массив services');
         }

         data.services.forEach((service, index) => {
            if (!service.id || !service.date || !service.title) {
               throw new Error(`Неполные данные в службе ${index + 1}`);
            }
         });

         this.updateStatus('✅ JSON валиден', 'success');
         this.debug('✅ JSON validation passed');
      } catch (error) {
         this.updateStatus(`❌ Ошибка валидации: ${error.message}`, 'error');
         this.debug('❌ JSON validation failed', error);
      }
   }

   async saveChanges() {
      const editor = document.getElementById('admin-json-editor');
      if (!editor) return;

      try {
         const data = JSON.parse(editor.value);

         // Validate before saving
         this.validateScheduleData(data);

         // Create backup before saving
         this.createBackup();

         // Save to localStorage (in a real app, this would be sent to server)
         localStorage.setItem('scheduleData', JSON.stringify(data));

         // Update the schedule manager
         if (window.scheduleManager) {
            window.scheduleManager.scheduleData = data;
            window.scheduleManager.renderSchedule();
            window.scheduleManager.updateStats();
         }

         this.updateStatus('✅ Изменения сохранены', 'success');
         this.debug('💾 Changes saved successfully');

         // Show success notification
         window.scheduleManager?.showNotification(
            'success',
            'Сохранено',
            'Расписание успешно обновлено'
         );
      } catch (error) {
         this.updateStatus(`❌ Ошибка сохранения: ${error.message}`, 'error');
         this.debug('❌ Save failed', error);
         window.scheduleManager?.showNotification(
            'error',
            'Ошибка',
            error.message
         );
      }
   }

   validateScheduleData(data) {
      if (!data || typeof data !== 'object') {
         throw new Error('Данные должны быть объектом');
      }

      if (!data.services || !Array.isArray(data.services)) {
         throw new Error('Отсутствует массив services');
      }

      data.services.forEach((service, index) => {
         const required = [
            'id',
            'date',
            'dayNumber',
            'month',
            'weekday',
            'title',
            'times',
         ];

         for (const field of required) {
            if (!service[field]) {
               throw new Error(
                  `Отсутствует поле "${field}" в службе ${index + 1}`
               );
            }
         }

         if (!Array.isArray(service.times)) {
            throw new Error(`times должен быть массивом в службе ${index + 1}`);
         }
      });
   }

   createBackup() {
      const backups = JSON.parse(
         localStorage.getItem('scheduleBackups') || '[]'
      );
      const backup = {
         id: Date.now(),
         timestamp: new Date().toISOString(),
         data: this.originalData || window.scheduleManager?.scheduleData,
         description: `Резервная копия от ${new Date().toLocaleString(
            'ru-RU'
         )}`,
      };

      backups.unshift(backup);

      // Keep only last 10 backups
      if (backups.length > 10) {
         backups.splice(10);
      }

      localStorage.setItem('scheduleBackups', JSON.stringify(backups));
      this.loadBackups();

      this.debug('💾 Backup created', backup);
      return backup;
   }

   loadBackups() {
      const backups = JSON.parse(
         localStorage.getItem('scheduleBackups') || '[]'
      );
      const container = document.getElementById('backup-list');

      if (!container) return;

      if (backups.length === 0) {
         container.innerHTML =
            '<p style="color: #666; text-align: center;">Нет резервных копий</p>';
         return;
      }

      container.innerHTML = backups
         .map(
            (backup) => `
         <div class="backup-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 0.5rem; margin-bottom: 0.5rem;">
            <div>
               <div style="font-weight: 500;">${backup.description}</div>
               <div style="font-size: 0.85rem; color: #666;">
                  ${backup.data?.services?.length || 0} служб
               </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
               <button onclick="AdminPanel.restoreFromBackup(${
                  backup.id
               })" style="background: var(--color-accent); color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer;">
                  <i class="bi bi-arrow-clockwise"></i>
               </button>
               <button onclick="AdminPanel.deleteBackup(${
                  backup.id
               })" style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer;">
                  <i class="bi bi-trash"></i>
               </button>
            </div>
         </div>
      `
         )
         .join('');
   }

   restoreFromBackup(backupId) {
      const backups = JSON.parse(
         localStorage.getItem('scheduleBackups') || '[]'
      );
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
         this.updateStatus('Резервная копия не найдена', 'error');
         return;
      }

      if (
         confirm(
            'Восстановить данные из резервной копии? Текущие изменения будут потеряны.'
         )
      ) {
         this.loadDataToEditor(backup.data);
         this.updateStatus(
            'Данные восстановлены из резервной копии',
            'success'
         );
         this.debug('🔄 Restored from backup', backup);
      }
   }

   deleteBackup(backupId) {
      if (confirm('Удалить резервную копию?')) {
         const backups = JSON.parse(
            localStorage.getItem('scheduleBackups') || '[]'
         );
         const filtered = backups.filter((b) => b.id !== backupId);
         localStorage.setItem('scheduleBackups', JSON.stringify(filtered));
         this.loadBackups();
         this.updateStatus('Резервная копия удалена', 'success');
         this.debug('🗑️ Backup deleted', backupId);
      }
   }

   restoreBackup() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
         const file = e.target.files[0];
         if (file) {
            this.handleFileUpload(file);
         }
      };
      input.click();
   }

   reset() {
      if (
         confirm(
            'Сбросить все изменения? Данные будут восстановлены из исходного файла.'
         )
      ) {
         if (window.scheduleManager) {
            window.scheduleManager.loadScheduleData();
         }
         this.updateStatus('Данные сброшены', 'info');
         this.debug('🔄 Data reset');
      }
   }

   updateStatus(message, type = 'info') {
      const status = document.getElementById('admin-status');
      if (!status) return;

      const icons = {
         info: 'bi-info-circle',
         success: 'bi-check-circle',
         error: 'bi-exclamation-triangle',
         warning: 'bi-exclamation-circle',
      };

      status.innerHTML = `
         <i class="${icons[type] || icons.info}"></i>
         <span>${message}</span>
      `;

      // Auto-clear after 5 seconds
      setTimeout(() => {
         status.innerHTML = `
            <i class="bi bi-info-circle"></i>
            <span>Готов к работе</span>
         `;
      }, 5000);
   }

   // Public methods
   show() {
      const overlay = document.getElementById('admin-overlay');
      if (overlay) {
         overlay.classList.add('active');
         this.isVisible = true;
         this.isMinimized = false;

         // Load current data
         if (window.scheduleManager?.scheduleData) {
            this.loadDataToEditor(window.scheduleManager.scheduleData);
         }

         this.debug('👁️ Admin panel shown');
      }
   }

   hide() {
      const overlay = document.getElementById('admin-overlay');
      if (overlay) {
         overlay.classList.remove('active');
         this.isVisible = false;
         this.debug('🙈 Admin panel hidden');
      }
   }

   toggle() {
      if (this.isVisible) {
         this.hide();
      } else {
         this.show();
      }
   }

   close() {
      this.hide();
   }

   minimize() {
      const panel = document.querySelector('.schedule-admin');
      if (panel) {
         if (this.isMinimized) {
            panel.style.transform = 'scale(1)';
            panel.style.opacity = '1';
            this.isMinimized = false;
         } else {
            panel.style.transform = 'scale(0.1)';
            panel.style.opacity = '0.3';
            this.isMinimized = true;
         }
         this.debug(
            `📦 Admin panel ${this.isMinimized ? 'minimized' : 'restored'}`
         );
      }
   }

   exportData() {
      const editor = document.getElementById('admin-json-editor');
      if (!editor) return;

      try {
         const data = JSON.parse(editor.value);
         const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
         });
         const url = URL.createObjectURL(blob);

         const a = document.createElement('a');
         a.href = url;
         a.download = `schedule-${new Date().toISOString().split('T')[0]}.json`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);

         this.updateStatus('Данные экспортированы', 'success');
         this.debug('📤 Data exported');
      } catch (error) {
         this.updateStatus('Ошибка экспорта', 'error');
         this.debug('❌ Export failed', error);
      }
   }

   createBackupDownload() {
      const backups = JSON.parse(
         localStorage.getItem('scheduleBackups') || '[]'
      );
      const blob = new Blob([JSON.stringify(backups, null, 2)], {
         type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-backups-${
         new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.updateStatus('Резервные копии экспортированы', 'success');
      this.debug('📦 Backups exported');
   }
}

/**
 * Enhanced Schedule System Initialization
 */
function initScheduleSystem() {
   // Create schedule manager instance
   window.scheduleManager = new ScheduleManager();

   // Create admin panel instance
   window.AdminPanel = new AdminPanelManager();

   // Create required HTML elements if they don't exist
   createScheduleHTML();
   createAdminHTML();
   createNotificationHTML();

   console.log('📅 Enhanced Schedule System initialized');
}

function createScheduleHTML() {
   const scheduleContainer = document.querySelector('.schedule-content');
   if (!scheduleContainer) return;

   // Add loading state
   const loadingHTML = `
      <div id="schedule-loading" class="schedule-loading" style="display: none;">
         <div style="text-align: center; padding: 3rem;">
            <div style="width: 3rem; height: 3rem; border: 3px solid #f3f3f3; border-top: 3px solid var(--color-accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p>Загрузка расписания...</p>
         </div>
      </div>
   `;

   // Add error state
   const errorHTML = `
      <div id="schedule-error" class="schedule-error" style="display: none;">
         <div style="text-align: center; padding: 3rem;">
            <i class="bi bi-exclamation-triangle error-icon"></i>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить расписание богослужений</p>
            <button onclick="ScheduleManager.retryLoad()" style="background: var(--color-accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
               <i class="bi bi-arrow-clockwise"></i>
               Повторить попытку
            </button>
         </div>
      </div>
   `;

   // Add content container
   const contentHTML = `
      <div id="schedule-content" class="schedule-content" style="display: none;"></div>
   `;

   // Add stats
   const statsHTML = `
      <div class="schedule-stats">
         <div class="stats-item">
            <i class="bi bi-calendar-event"></i>
            <span>Служб: <span id="total-services">0</span></span>
         </div>
         <div class="stats-item">
            <i class="bi bi-clock-history"></i>
            <span>Обновлено: <span id="last-updated">—</span></span>
         </div>
      </div>
   `;

   scheduleContainer.innerHTML =
      loadingHTML + errorHTML + contentHTML + statsHTML;
}

function createAdminHTML() {
   // Check if admin HTML already exists
   if (document.getElementById('admin-overlay')) return;

   const adminHTML = `
      <!-- Admin Trigger -->
      <div id="admin-trigger" class="admin-trigger" style="display: none;">
         <button onclick="AdminPanel.show()" title="Панель администратора">
            <i class="bi bi-gear"></i>
         </button>
      </div>

      <!-- Admin Panel Overlay -->
      <div id="admin-overlay" class="schedule-admin-overlay">
         <div class="schedule-admin">
            <div class="admin-header">
               <div class="admin-title">
                  <i class="bi bi-gear"></i>
                  <h3>Панель администратора</h3>
               </div>
               <div class="admin-actions-header">
                  <button class="admin-minimize" onclick="AdminPanel.minimize()" title="Свернуть">
                     <i class="bi bi-dash"></i>
                  </button>
                  <button class="admin-close" onclick="AdminPanel.close()" title="Закрыть">
                     <i class="bi bi-x"></i>
                  </button>
               </div>
            </div>

            <div class="admin-content">
               <div class="admin-tabs">
                  <button class="admin-tab active" data-tab="editor">
                     <i class="bi bi-code-slash"></i>
                     Редактор
                  </button>
                  <button class="admin-tab" data-tab="upload">
                     <i class="bi bi-upload"></i>
                     Загрузка
                  </button>
                  <button class="admin-tab" data-tab="backup">
                     <i class="bi bi-archive"></i>
                     Резервные копии
                  </button>
                  <button class="admin-tab" data-tab="settings">
                     <i class="bi bi-sliders"></i>
                     Настройки
                  </button>
               </div>

               <div class="admin-tab-content">
                  <!-- Editor Panel -->
                  <div id="editor-panel" class="admin-tab-panel active">
                     <div class="admin-section">
                        <label>
                           <i class="bi bi-code-slash"></i>
                           JSON данные расписания
                        </label>
                        <div class="json-editor-container">
                           <textarea id="admin-json-editor" rows="15" placeholder="Данные расписания в формате JSON..."></textarea>
                           <div class="json-editor-tools">
                              <button onclick="AdminPanel.formatJSON()">
                                 <i class="bi bi-code"></i>
                                 Форматировать
                              </button>
                              <button onclick="AdminPanel.validateJSON()">
                                 <i class="bi bi-check-circle"></i>
                                 Проверить
                              </button>
                              <button onclick="AdminPanel.exportData()">
                                 <i class="bi bi-download"></i>
                                 Экспорт
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>

                  <!-- Upload Panel -->
                  <div id="upload-panel" class="admin-tab-panel">
                     <div class="admin-section">
                        <label>
                           <i class="bi bi-cloud-upload"></i>
                           Загрузка файла расписания
                        </label>
                        <div id="file-upload-area" class="file-upload-area">
                           <div class="upload-content">
                              <i class="bi bi-cloud-upload"></i>
                              <h4>Перетащите файл сюда или нажмите для выбора</h4>
                              <p>Поддерживаются форматы: JSON, CSV, Excel</p>
                           </div>
                        </div>
                        <input type="file" id="file-input" accept=".json,.csv,.xlsx" style="display: none;">
                     </div>
                  </div>

                  <!-- Backup Panel -->
                  <div id="backup-panel" class="admin-tab-panel">
                     <div class="admin-section">
                        <label>
                           <i class="bi bi-archive"></i>
                           Управление резервными копиями
                        </label>
                        <div class="backup-actions">
                           <button onclick="AdminPanel.createBackup()">
                              <i class="bi bi-plus-circle"></i>
                              Создать копию
                           </button>
                           <button onclick="AdminPanel.restoreBackup()">
                              <i class="bi bi-upload"></i>
                              Загрузить копию
                           </button>
                           <button onclick="AdminPanel.createBackupDownload()">
                              <i class="bi bi-download"></i>
                              Скачать все
                           </button>
                        </div>
                        <div id="backup-list" class="backup-list"></div>
                     </div>
                  </div>

                  <!-- Settings Panel -->
                  <div id="settings-panel" class="admin-tab-panel">
                     <div class="admin-section">
                        <label>
                           <i class="bi bi-sliders"></i>
                           Настройки системы
                        </label>
                        <div class="settings-group">
                           <div class="setting-item">
                              <input type="checkbox" id="auto-scroll-setting">
                              <label for="auto-scroll-setting">Автопрокрутка к сегодняшней службе</label>
                           </div>
                           <div class="setting-item">
                              <input type="checkbox" id="notifications-setting">
                              <label for="notifications-setting">Показывать уведомления</label>
                           </div>
                           <div class="setting-item">
                              <input type="checkbox" id="debug-mode-setting">
                              <label for="debug-mode-setting">Режим отладки</label>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div class="admin-footer">
               <div id="admin-status" class="admin-status">
                  <i class="bi bi-info-circle"></i>
                  <span>Готов к работе</span>
               </div>
               <div class="admin-main-actions">
                  <button class="btn-secondary" onclick="AdminPanel.reset()">
                     <i class="bi bi-arrow-clockwise"></i>
                     Сбросить
                  </button>
                  <button class="btn-primary" onclick="AdminPanel.saveChanges()">
                     <i class="bi bi-check-circle"></i>
                     Сохранить
                  </button>
               </div>
            </div>
         </div>
      </div>
   `;

   document.body.insertAdjacentHTML('beforeend', adminHTML);
}

function createNotificationHTML() {
   // Check if notification container already exists
   if (document.getElementById('notification-container')) return;

   const notificationHTML = `
      <div id="notification-container" class="notification-container"></div>
   `;

   document.body.insertAdjacentHTML('beforeend', notificationHTML);
}

// Global utility functions
window.ScheduleManager = {
   retryLoad: () => window.scheduleManager?.loadScheduleData(),
};

// Schedule debugging utilities
window.scheduleDebug = {
   getScheduleData: () => window.scheduleManager?.scheduleData,
   getSettings: () => window.scheduleManager?.settings,
   showAdminPanel: () => window.AdminPanel?.show(),
   createTestNotification: (type = 'info') => {
      window.scheduleManager?.showNotification(
         type,
         'Тестовое уведомление',
         'Это тестовое сообщение для проверки системы уведомлений'
      );
   },
   exportLogs: () => {
      const logs = {
         timestamp: new Date().toISOString(),
         scheduleData: window.scheduleManager?.scheduleData,
         settings: window.scheduleManager?.settings,
         backups: JSON.parse(localStorage.getItem('scheduleBackups') || '[]'),
         performance: window.lazyLoadPerformance,
         userAgent: navigator.userAgent,
         viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
         },
      };

      const blob = new Blob([JSON.stringify(logs, null, 2)], {
         type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-debug-${
         new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('🐛 Debug logs exported');
   },
};

// Add CSS animations for loading spinner
const additionalStyles = `
   @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
   }
   
   .schedule-loading {
      animation: slideInUp 0.5s ease-out;
   }
   
   .error-icon {
      font-size: 3rem;
      color: #dc3545;
      margin-bottom: 1rem;
   }
   
   .schedule-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 0.5rem;
   }
   
   .stats-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
   }
   
   .stats-item i {
      color: var(--color-accent);
   }
   
   @media screen and (max-width: 48em) {
      .schedule-stats {
         flex-direction: column;
         gap: 1rem;
         text-align: center;
      }
   }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

/**
 * Enhanced News Management System
 * Features: Full-page individual news, improved UX, modern design
 */

class NewsManager {
   constructor() {
      this.newsData = null;
      this.currentCategory = 'main';
      this.currentPage = 1;
      this.itemsPerPage = 6;
      this.searchQuery = '';
      this.sortBy = 'date-desc';
      this.loadedImages = new Set();
      this.isLoading = false;

      this.init();
   }

   init() {
      this.setupEventListeners();
      this.loadNewsData();
      this.checkURLForIndividualNews();

      this.debug('🗞️ News Manager initialized');
   }

   debug(message, data = null) {
      if (window.scheduleManager?.settings?.debugMode) {
         console.log(`[NewsManager] ${message}`, data || '');
      }
   }

   // Check URL for individual news on page load
   checkURLForIndividualNews() {
      const urlParams = new URLSearchParams(window.location.search);
      const newsId = urlParams.get('news');

      if (newsId) {
         // Wait for news data to load
         const checkData = () => {
            if (this.newsData) {
               this.showIndividualNews(newsId);
            } else {
               setTimeout(checkData, 100);
            }
         };
         checkData();
      }
   }

   // Data Loading
   async loadNewsData() {
      this.showLoading();

      try {
         const response = await fetch('news-data.json');
         if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
         }

         this.newsData = await response.json();
         this.validateNewsData();
         this.renderNews();
         this.updateStats();
         this.hideLoading();

         this.debug('📰 News data loaded successfully', this.newsData);
      } catch (error) {
         this.debug('❌ Error loading news data', error);
         this.showError(error.message);
      }
   }

   validateNewsData() {
      if (!this.newsData || !this.newsData.news) {
         throw new Error('Invalid news data structure');
      }

      if (!Array.isArray(this.newsData.news)) {
         throw new Error('News must be an array');
      }

      this.newsData.news.forEach((item, index) => {
         const required = [
            'id',
            'title',
            'slug',
            'description',
            'content',
            'date',
         ];

         for (const field of required) {
            if (!item[field]) {
               throw new Error(
                  `Missing required field "${field}" in news item ${index + 1}`
               );
            }
         }
      });

      this.debug('✅ News data validation passed');
   }

   // Event Listeners
   setupEventListeners() {
      // Tab switching
      document.querySelectorAll('.news-tab').forEach((tab) => {
         tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            this.switchCategory(category);
         });
      });

      // Search
      const searchInput = document.getElementById('news-search');
      if (searchInput) {
         let searchTimeout;
         searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
               this.searchQuery = e.target.value.toLowerCase();
               this.currentPage = 1;
               this.renderNews();
            }, 300);
         });
      }

      // Sort
      const sortSelect = document.getElementById('news-sort');
      if (sortSelect) {
         sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.currentPage = 1;
            this.renderNews();
         });
      }

      // Load more
      const loadMoreBtn = document.getElementById('load-more-btn');
      if (loadMoreBtn) {
         loadMoreBtn.addEventListener('click', () => {
            this.loadMore();
         });
      }

      // Handle browser back/forward
      window.addEventListener('popstate', (e) => {
         if (e.state && e.state.newsId) {
            this.showIndividualNews(e.state.newsId);
         } else {
            this.closeIndividualNews();
         }
      });

      // Handle escape key to close individual news
      document.addEventListener('keydown', (e) => {
         if (e.key === 'Escape') {
            this.closeIndividualNews();
         }
      });
   }

   // Category Management
   switchCategory(category) {
      this.currentCategory = category;
      this.currentPage = 1;
      this.searchQuery = '';

      // Update search input
      const searchInput = document.getElementById('news-search');
      if (searchInput) searchInput.value = '';

      // Update tabs
      document.querySelectorAll('.news-tab').forEach((tab) => {
         tab.classList.toggle('active', tab.dataset.category === category);
         tab.setAttribute('aria-selected', tab.dataset.category === category);
      });

      this.renderNews();
      this.debug(`📑 Switched to category: ${category}`);
   }

   // News Filtering and Sorting
   getFilteredNews() {
      if (!this.newsData) return [];

      let filtered = this.newsData.news.filter((item) => {
         const matchesCategory =
            this.currentCategory === 'all' ||
            item.category === this.currentCategory;
         const matchesSearch =
            !this.searchQuery ||
            item.title.toLowerCase().includes(this.searchQuery) ||
            item.description.toLowerCase().includes(this.searchQuery) ||
            item.tags?.some((tag) =>
               tag.toLowerCase().includes(this.searchQuery)
            );

         return matchesCategory && matchesSearch;
      });

      // Sort news
      filtered.sort((a, b) => {
         switch (this.sortBy) {
            case 'date-desc':
               return new Date(b.date) - new Date(a.date);
            case 'date-asc':
               return new Date(a.date) - new Date(b.date);
            case 'title-asc':
               return a.title.localeCompare(b.title, 'ru');
            case 'title-desc':
               return b.title.localeCompare(a.title, 'ru');
            default:
               return 0;
         }
      });

      return filtered;
   }

   // News Rendering
   renderNews() {
      const container = document.getElementById('news-content');
      if (!container) return;

      const filteredNews = this.getFilteredNews();
      const startIndex = 0;
      const endIndex = this.currentPage * this.itemsPerPage;
      const newsToShow = filteredNews.slice(startIndex, endIndex);

      container.innerHTML = '';

      if (newsToShow.length === 0) {
         container.innerHTML = `
            <div class="no-news-message" style="text-align: center; padding: 3rem; color: #6b7280;">
               <i class="bi bi-newspaper" style="font-size: 3rem; margin-bottom: 1rem; color: #d1d5db;"></i>
               <h3 style="margin-bottom: .5rem;">Новостей не найдено</h3>
               <p>Попробуйте изменить критерии поиска или выбрать другую категорию.</p>
            </div>
         `;
         this.hideLoadMore();
         return;
      }

      newsToShow.forEach((item, index) => {
         const newsElement = this.createNewsCard(item, index);
         container.appendChild(newsElement);
      });

      // Show/hide load more button
      if (endIndex < filteredNews.length) {
         this.showLoadMore();
      } else {
         this.hideLoadMore();
      }

      // Show content
      container.style.display = 'grid';
      this.updateStats(filteredNews.length, newsToShow.length);

      this.debug(`📋 Rendered ${newsToShow.length} news items`);
   }

   createNewsCard(item, index) {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.style.animationDelay = `${index * 0.1}s`;

      // Calculate reading time and word count
      const { readingTime, wordCount } = this.calculateReadingStats(
         item.content
      );

      // Format date
      const publishDate = new Date(item.date);
      const formattedDate = publishDate.toLocaleDateString('ru-RU', {
         day: 'numeric',
         month: 'long',
         year: 'numeric',
      });

      card.innerHTML = `
         ${
            item.image
               ? `
            <div class="news-card-image">
               <div class="image-container">
                  <div class="image-placeholder">
                     <div class="shimmer-overlay"></div>
                  </div>
                  <img class="lazy-image" 
                     data-src="${item.image}" 
                     alt="${item.title}" 
                     loading="lazy">
               </div>
               <span class="news-card-category">${
                  item.categoryName || item.category
               }</span>
            </div>
         `
               : `
            <div class="news-card-no-image">
               <span class="news-card-category">${
                  item.categoryName || item.category
               }</span>
            </div>
         `
         }
         
         <div class="news-card-content">
            <div class="news-card-meta">
               <div class="news-card-date">
                  <time datetime="${item.date}">${formattedDate}</time>
               </div>
               <div class="news-card-author">
                  <i class="bi bi-person"></i>
                  <span>${item.author}</span>
               </div>
            </div>

            <h3 class="news-card-title">${item.title}</h3>
            <p class="news-card-description">${item.description}</p>

            <div class="news-card-footer">
               <div class="news-card-reading-time">
                  <i class="bi bi-clock"></i>
                  <span>${readingTime} мин чтения</span>
               </div>
               <div class="news-card-read-more">
                  <span>Читать далее</span>
                  <i class="bi bi-arrow-right"></i>
               </div>
            </div>
         </div>
      `;

      // Add click handler
      card.addEventListener('click', (e) => {
         e.preventDefault();
         this.showIndividualNews(item.id);
      });

      // Load image if visible
      if (item.image && window.lazyLoadImage) {
         const img = card.querySelector('.lazy-image');
         if (img) {
            setTimeout(() => window.lazyLoadImage(img), index * 100);
         }
      }

      return card;
   }

   // Individual News Page
   showIndividualNews(newsId) {
      const newsItem = this.newsData?.news.find(
         (item) => item.id === newsId || item.slug === newsId
      );
      if (!newsItem) {
         console.error('News item not found:', newsId);
         return;
      }

      // Close existing individual page if any
      this.closeIndividualNews();

      // Update URL without page reload
      const newUrl = `${window.location.pathname}?news=${newsItem.slug}`;
      window.history.pushState({ newsId: newsItem.id }, newsItem.title, newUrl);

      // Create individual news page
      const individualPage = this.createIndividualNewsPage(newsItem);
      document.body.appendChild(individualPage);

      // Add this code to the showIndividualNews method after the page is created
      setTimeout(() => {
         // Initialize loading of all images on the page
         const lazyImages = individualPage.querySelectorAll('.lazy-image');
         if (lazyImages.length > 0) {
            lazyImages.forEach((img, index) => {
               if (window.lazyLoadImage) {
                  setTimeout(() => {
                     const src = img.getAttribute('data-src');
                     if (src) {
                        console.log('Загрузка изображения:', src);
                        window.lazyLoadImage(img);
                     } else {
                        console.error('Атрибут data-src отсутствует:', img);
                     }
                  }, index * 100);
               } else {
                  // Fallback option if lazyLoadImage function is not available
                  const src = img.getAttribute('data-src');
                  if (src) {
                     img.src = src;
                     img.onload = function () {
                        const placeholder = img
                           .closest('.image-container')
                           ?.querySelector('.image-placeholder');
                        if (placeholder) placeholder.style.display = 'none';
                     };
                  }
               }
            });
         } else {
            console.warn('Изображения не найдены на странице');
         }
      }, 300);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Show the page with animation
      setTimeout(() => {
         individualPage.classList.add('show');
      }, 10);

      // Setup reading progress
      this.setupReadingProgress();

      // Setup sharing
      this.setupSharing(newsItem);

      // Load related news
      this.loadRelatedNews(newsItem);

      this.debug('📖 Individual news opened:', newsItem.title);
   }

   createIndividualNewsPage(item) {
      const page = document.createElement('div');
      page.className = 'individual-news-page';
      page.id = 'individual-news-page';

      // Calculate reading stats
      const { readingTime, wordCount } = this.calculateReadingStats(
         item.content
      );

      // Format date
      const publishDate = new Date(item.date);
      const formattedDate = publishDate.toLocaleDateString('ru-RU', {
         day: 'numeric',
         month: 'long',
         year: 'numeric',
      });

      // Generate content HTML
      const contentHTML = this.generateContentHTML(item.content);

      page.innerHTML = `
         <button class="article-close" title="Закрыть">
            <i class="bi bi-x"></i>
         </button>

         <div class="reading-progress">
            <div class="progress-bar"></div>
         </div>

         <article class="news-article">
            <nav class="breadcrumb" aria-label="Навигация">
               <ol class="breadcrumb-list">
                  <li><a href="#" class="breadcrumb-home">Главная</a></li>
                  <li><a href="#" class="breadcrumb-news">Новости</a></li>
                  <li class="breadcrumb-category">${
                     item.categoryName || item.category
                  }</li>
                  <li class="breadcrumb-current" aria-current="page">${
                     item.title
                  }</li>
               </ol>
            </nav>

            <header class="article-header">
               <div class="article-meta">
                  <span class="article-category">${
                     item.categoryName || item.category
                  }</span>
                  <time class="article-date" datetime="${
                     item.date
                  }">${formattedDate}</time>
               </div>

               <h1 class="article-title">${item.title}</h1>

               <div class="article-info">
                  <div class="article-author">
                     <i class="bi bi-person"></i>
                     <span>${item.author}</span>
                  </div>
                  <div class="article-reading-time">
                     <i class="bi bi-clock"></i>
                     <span>${readingTime} мин чтения</span>
                  </div>
                  <div class="article-word-count">
                     <i class="bi bi-file-text"></i>
                     <span>${wordCount} слов</span>
                  </div>
               </div>
            </header>

            <div class="article-content">
               ${contentHTML}
            </div>

            <div class="article-sharing">
               <h3>Поделиться</h3> 
               <div class="sharing-buttons">
                  <button class="share-btn" data-platform="telegram">
                     <i class="bi bi-telegram"></i>
                     <p>Telegram</p>
                  </button>
                  <button class="share-btn" data-platform="vk">
                     <i class="fa-brands fa-vk"></i>
                     <p>ВКонтакте</p>
                  </button>
                  <button class="share-btn" data-platform="copy">
                     <i class="bi bi-link-45deg"></i>
                     <p>Копировать ссылку</p>
                  </button>
               </div>
            </div>

            <nav class="article-navigation">
               <!-- Navigation will be populated by loadRelatedNews -->
            </nav>

            <section class="related-news">
               <h3>Похожие новости</h3>
               <div class="related-news-grid">
                  <!-- Related news will be populated by loadRelatedNews -->
               </div>
            </section>
         </article>
      `;

      // Add event listeners for close and breadcrumb navigation
      const closeBtn = page.querySelector('.article-close');
      const homeLink = page.querySelector('.breadcrumb-home');
      const newsLink = page.querySelector('.breadcrumb-news');

      closeBtn.addEventListener('click', (e) => {
         e.preventDefault();
         this.closeIndividualNews();
      });

      homeLink.addEventListener('click', (e) => {
         e.preventDefault();
         this.closeIndividualNews();
         // Scroll to top
         window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      newsLink.addEventListener('click', (e) => {
         e.preventDefault();
         this.closeIndividualNews();
         // Scroll to news section
         const newsSection = document.getElementById('news-section');
         if (newsSection) {
            newsSection.scrollIntoView({ behavior: 'smooth' });
         }
      });

      // Add click outside to close
      page.addEventListener('click', (e) => {
         if (e.target === page) {
            this.closeIndividualNews();
         }
      });

      return page;
   }

   generateContentHTML(content) {
      if (!content || !Array.isArray(content)) return '';

      let html = '';

      content.forEach((section) => {
         switch (section.type) {
            case 'heading':
               html += `<h${section.level}>${section.text}</h${section.level}>`;
               break;
            case 'paragraph':
               html += `<p>${section.text}</p>`;
               break;
            case 'image':
               // Check if possible image source exists
               const imageSrc =
                  section.src ||
                  section.url ||
                  section.image ||
                  section.path ||
                  '';

               if (!imageSrc) {
                  console.error(
                     'Отсутствует источник изображения в секции:',
                     section
                  );
                  break;
               }

               html += `
               <figure class="article-image">
                  <div class="image-container">
                     <div class="image-placeholder">
                        <div class="shimmer-overlay"></div>
                     </div>
                     <img class="lazy-image" 
                        data-src="${imageSrc}" 
                        alt="${section.caption || section.alt || ''}" 
                        loading="lazy">
                  </div>
                  ${
                     section.caption
                        ? `<figcaption>${section.caption}</figcaption>`
                        : ''
                  }
               </figure>
            `;
               break;
            case 'list':
               if (section.items && Array.isArray(section.items)) {
                  html += '<ul>';
                  section.items.forEach((item) => {
                     html += `<li>${item}</li>`;
                  });
                  html += '</ul>';
               }
               break;
            default:
               html += `<p>${section.text || ''}</p>`;
         }
      });

      return html;
   }

   closeIndividualNews() {
      const individualPage = document.getElementById('individual-news-page');
      if (individualPage) {
         // Add closing animation
         individualPage.classList.add('closing');

         // Remove after animation
         setTimeout(() => {
            individualPage.remove();
            document.body.style.overflow = '';
         }, 300);

         // Update URL
         const newUrl = window.location.pathname + window.location.hash;
         window.history.pushState({}, document.title, newUrl);

         this.debug('📖 Individual news closed');
      }
   }

   // Reading Progress
   setupReadingProgress() {
      const progressBar = document.querySelector('.progress-bar');
      if (!progressBar) return;

      const updateProgress = () => {
         const individualPage = document.getElementById('individual-news-page');
         if (!individualPage) return;

         // Calculate scroll position relative to the article content
         const article = individualPage.querySelector('.news-article');
         if (!article) return;

         const scrollPosition = individualPage.scrollTop;
         const totalHeight = article.scrollHeight - individualPage.clientHeight;
         const scrollPercentage = (scrollPosition / totalHeight) * 100;

         // Update progress bar width
         progressBar.style.width = `${Math.min(
            Math.max(scrollPercentage, 0),
            100
         )}%`;
      };

      const individualPage = document.getElementById('individual-news-page');
      if (individualPage) {
         // Initial update
         updateProgress();

         // Add scroll event listener
         individualPage.addEventListener('scroll', updateProgress);
      }
   }

   // Social Sharing
   setupSharing(newsItem) {
      const shareButtons = document.querySelectorAll('.share-btn');

      shareButtons.forEach((button) => {
         button.addEventListener('click', () => {
            const platform = button.dataset.platform;
            this.shareNews(newsItem, platform);
         });
      });
   }

   async shareNews(newsItem, platform) {
      const url = window.location.href;
      const title = newsItem.title;
      const description = newsItem.description;

      try {
         switch (platform) {
            case 'telegram':
               const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
                  url
               )}&text=${encodeURIComponent(title)}`;
               window.open(telegramUrl, '_blank');
               this.showNotification(
                  'success',
                  'Поделились',
                  'Ссылка открыта в Telegram'
               );
               break;

            case 'vk':
               const vkUrl = `https://vk.com/share.php?url=${encodeURIComponent(
                  url
               )}&title=${encodeURIComponent(
                  title
               )}&description=${encodeURIComponent(description)}`;
               window.open(vkUrl, '_blank');
               this.showNotification(
                  'success',
                  'Поделились',
                  'Ссылка открыта в ВКонтакте'
               );
               break;

            case 'copy':
               if (navigator.clipboard && window.isSecureContext) {
                  await navigator.clipboard.writeText(url);
                  this.showNotification(
                     'success',
                     'Скопировано',
                     'Ссылка скопирована в буфер обмена'
                  );
               } else {
                  // Fallback for older browsers or non-secure contexts
                  const textArea = document.createElement('textarea');
                  textArea.value = url;
                  textArea.style.position = 'fixed';
                  textArea.style.left = '-999999px';
                  textArea.style.top = '-999999px';
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();

                  try {
                     document.execCommand('copy');
                     this.showNotification(
                        'success',
                        'Скопировано',
                        'Ссылка скопирована в буфер обмена'
                     );
                  } catch (err) {
                     this.showNotification(
                        'error',
                        'Ошибка',
                        'Не удалось скопировать ссылку'
                     );
                  }

                  textArea.remove();
               }
               break;
         }

         this.debug(`📤 News shared via ${platform}`, newsItem.title);
      } catch (error) {
         this.debug('❌ Share failed', error);
         this.showNotification(
            'error',
            'Ошибка',
            'Не удалось поделиться новостью'
         );
      }
   }

   // Related News
   loadRelatedNews(currentItem) {
      // Find related news based on category or tags
      let relatedNews = this.newsData.news.filter(
         (item) =>
            item.id !== currentItem.id &&
            (item.category === currentItem.category ||
               (item.tags &&
                  currentItem.tags &&
                  item.tags.some((tag) => currentItem.tags.includes(tag))))
      );

      // If no related news found by category or tags, get some random news
      if (relatedNews.length < 2) {
         // Get additional random news if needed
         const randomNews = this.newsData.news
            .filter(
               (item) =>
                  item.id !== currentItem.id &&
                  !relatedNews.some((r) => r.id === item.id)
            )
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - relatedNews.length);

         relatedNews = [...relatedNews, ...randomNews];
      }

      // Get up to 3 related news items
      relatedNews = relatedNews.slice(0, 2);

      // Get references to DOM elements
      const individualPage = document.getElementById('individual-news-page');
      if (!individualPage) {
         console.error('Individual news page not found');
         return;
      }

      const relatedGrid = individualPage.querySelector('.related-news-grid');
      const navigation = individualPage.querySelector('.article-navigation');

      if (!relatedGrid || !navigation) {
         console.error('Related news grid or navigation not found', {
            relatedGrid,
            navigation,
         });
         return;
      }

      this.debug('Found related news elements', { relatedGrid, navigation });
      this.debug('Related news items:', relatedNews);

      // Update related news grid
      if (relatedNews.length > 0) {
         relatedGrid.innerHTML = relatedNews
            .map((item) => {
               const publishDate = new Date(item.date);
               const formattedDate = publishDate.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
               });

               return `
            <a href="#" class="related-news-item" data-news-id="${item.id}">
               ${
                  item.image
                     ? `
                  <div class="image-container">
                     <div class="image-placeholder">
                        <div class="shimmer-overlay"></div>
                     </div>
                     <img class="lazy-image" 
                        data-src="${item.image}" 
                        alt="${item.title}" 
                        loading="lazy">
                  </div>
               `
                     : '<div class="no-image-placeholder"></div>'
               }
               <div class="related-news-content">
                  <h4 class="related-news-title">${item.title}</h4>
                  <div class="related-news-date">${formattedDate}</div>
               </div>
            </a>
         `;
            })
            .join('');

         // Add click handlers for related news
         relatedGrid.querySelectorAll('.related-news-item').forEach((item) => {
            item.addEventListener('click', (e) => {
               e.preventDefault();
               const newsId = item.dataset.newsId;
               this.showIndividualNews(newsId);
            });
         });

         // Load images for related news
         setTimeout(() => {
            relatedGrid
               .querySelectorAll('.lazy-image')
               .forEach((img, index) => {
                  if (window.lazyLoadImage) {
                     setTimeout(() => window.lazyLoadImage(img), index * 100);
                  }
               });
         }, 100);
      } else {
         // Show message if no related news
         relatedGrid.innerHTML = `
         <div class="no-related-news">
            <p>Нет похожих новостей</p>
         </div>
      `;
      }

      // Setup navigation between articles
      if (relatedNews.length > 0) {
         const prevNews = relatedNews[0];
         const nextNews =
            relatedNews.length > 1 ? relatedNews[1] : relatedNews[0];

         // Get the navigation links
         const prevLink = navigation.querySelector('.nav-prev');
         const nextLink = navigation.querySelector('.nav-next');

         if (prevLink && nextLink) {
            // Update previous article link
            prevLink.dataset.newsId = prevNews.id;
            const prevTitle = prevLink.querySelector('strong');
            if (prevTitle) prevTitle.textContent = prevNews.title;
            prevLink.style.display = 'flex';

            // Update next article link
            nextLink.dataset.newsId = nextNews.id;
            const nextTitle = nextLink.querySelector('strong');
            if (nextTitle) nextTitle.textContent = nextNews.title;
            nextLink.style.display = 'flex';

            // Add click handlers for navigation
            prevLink.addEventListener('click', (e) => {
               e.preventDefault();
               this.showIndividualNews(prevNews.id);
            });

            nextLink.addEventListener('click', (e) => {
               e.preventDefault();
               this.showIndividualNews(nextNews.id);
            });
         } else {
            console.error('Navigation links not found in the DOM');
         }
      } else {
         // Hide navigation if no related news
         const prevLink = navigation.querySelector('.nav-prev');
         const nextLink = navigation.querySelector('.nav-next');

         if (prevLink) prevLink.style.display = 'none';
         if (nextLink) nextLink.style.display = 'none';
      }
   }

   // Utility Functions
   calculateReadingStats(content) {
      if (!content || !Array.isArray(content))
         return { readingTime: 1, wordCount: 0 };

      let totalText = '';
      content.forEach((section) => {
         if (section.type === 'paragraph' || section.type === 'heading') {
            totalText += section.text + ' ';
         } else if (section.type === 'list' && Array.isArray(section.items)) {
            section.items.forEach((item) => {
               totalText += item + ' ';
            });
         }
      });

      // Remove HTML tags and count words
      const plainText = totalText.replace(/<[^>]*>/g, '');
      const words = plainText
         .trim()
         .split(/\s+/)
         .filter((word) => word.length > 0);
      const wordCount = words.length;

      // Average reading speed: 200 words per minute
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      return { readingTime, wordCount };
   }

   showNotification(type, title, message, duration = 4000) {
      // Create notification container if it doesn't exist
      let container = document.getElementById('notification-container');
      if (!container) {
         container = document.createElement('div');
         container.id = 'notification-container';
         container.className = 'notification-container';
         document.body.appendChild(container);
      }

      const notification = document.createElement('div');
      notification.className = `notification ${type}`;

      const icons = {
         success: 'bi-check-circle-fill',
         error: 'bi-exclamation-triangle-fill',
         warning: 'bi-exclamation-circle-fill',
         info: 'bi-info-circle-fill',
      };

      notification.innerHTML = `
         <div class="notification-icon">
            <i class="${icons[type] || icons.info}"></i>
         </div>
         <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
         </div>
         <button class="notification-close">
            <i class="bi bi-x"></i>
         </button>
      `;

      // Add close handler
      const closeBtn = notification.querySelector('.notification-close');
      closeBtn.addEventListener('click', () => {
         this.removeNotification(notification);
      });

      container.appendChild(notification);

      // Show notification with animation
      setTimeout(() => notification.classList.add('show'), 100);

      // Auto-remove after duration
      setTimeout(() => {
         this.removeNotification(notification);
      }, duration);

      this.debug(`📢 Notification: ${type} - ${title}`);
   }

   removeNotification(notification) {
      if (notification && notification.parentNode) {
         notification.classList.add('hide');
         setTimeout(() => {
            if (notification.parentNode) {
               notification.parentNode.removeChild(notification);
            }
         }, 300);
      }
   }

   // Load More Functionality
   loadMore() {
      this.currentPage++;
      this.renderNews();
      this.debug(`📄 Loaded page ${this.currentPage}`);
   }

   showLoadMore() {
      const loadMoreContainer = document.querySelector('.news-load-more');
      if (loadMoreContainer) {
         loadMoreContainer.style.display = 'block';
      }
   }

   hideLoadMore() {
      const loadMoreContainer = document.querySelector('.news-load-more');
      if (loadMoreContainer) {
         loadMoreContainer.style.display = 'none';
      }
   }

   // UI State Management
   showLoading() {
      const loading = document.getElementById('news-loading');
      const content = document.getElementById('news-content');
      const error = document.getElementById('news-error');

      if (loading) loading.style.display = 'block';
      if (content) content.style.display = 'none';
      if (error) error.style.display = 'none';

      this.isLoading = true;
   }

   hideLoading() {
      const loading = document.getElementById('news-loading');
      const content = document.getElementById('news-content');

      if (loading) loading.style.display = 'none';
      if (content) content.style.display = 'grid';

      this.isLoading = false;
   }

   showError(message) {
      const loading = document.getElementById('news-loading');
      const content = document.getElementById('news-content');
      const error = document.getElementById('news-error');

      if (loading) loading.style.display = 'none';
      if (content) content.style.display = 'none';
      if (error) {
         error.style.display = 'block';
         const errorText = error.querySelector('p');
         if (errorText) errorText.textContent = message;
      }
   }

   updateStats(totalFiltered = 0, shown = 0) {
      const totalEl = document.getElementById('total-news');
      const shownEl = document.getElementById('shown-news');
      const statsContainer = document.querySelector('.news-stats');

      if (totalEl) totalEl.textContent = totalFiltered;
      if (shownEl) shownEl.textContent = shown;

      if (statsContainer && totalFiltered > 0) {
         statsContainer.style.display = 'flex';
      }
   }

   // Public Methods
   retry() {
      this.loadNewsData();
   }

   refresh() {
      this.currentPage = 1;
      this.loadNewsData();
   }
}

// Initialize News System
function initNewsSystem() {
   window.newsManager = new NewsManager();
   console.log('🗞️ News System initialized');
}

// Global utility functions for news
window.NewsManager = {
   showIndividualNews: (newsId) =>
      window.newsManager?.showIndividualNews(newsId),
   closeIndividualNews: () => window.newsManager?.closeIndividualNews(),
   retry: () => window.newsManager?.retry(),
};

// News debugging utilities
window.newsDebug = {
   getNewsData: () => window.newsManager?.newsData,
   getCurrentCategory: () => window.newsManager?.currentCategory,
   getFilteredNews: () => window.newsManager?.getFilteredNews(),
   showTestNews: () => {
      const testNews = {
         id: 'test-news',
         title: 'Тестовая новость',
         description: 'Это тестовая новость для проверки системы',
         content: [
            { type: 'paragraph', text: 'Это тестовый контент новости.' },
            { type: 'heading', level: 2, text: 'Тестовый заголовок' },
            { type: 'paragraph', text: 'Еще один абзац тестового контента.' },
         ],
         author: 'Тестовый автор',
         date: new Date().toISOString().split('T')[0],
         category: 'main',
         categoryName: 'Основные',
         tags: ['тест'],
      };

      if (window.newsManager) {
         window.newsManager.newsData = { news: [testNews] };
         window.newsManager.showIndividualNews('test-news');
      }
   },
   exportLogs: () => {
      const logs = {
         timestamp: new Date().toISOString(),
         newsData: window.newsManager?.newsData,
         currentCategory: window.newsManager?.currentCategory,
         currentPage: window.newsManager?.currentPage,
         searchQuery: window.newsManager?.searchQuery,
         sortBy: window.newsManager?.sortBy,
         userAgent: navigator.userAgent,
         viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
         },
      };

      const blob = new Blob([JSON.stringify(logs, null, 2)], {
         type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `news-debug-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('🐛 News debug logs exported');
   },
};

/**
 * Svyatyni Tabs Management System
 * Handles tab switching for the Saints/Relics page with accessibility features
 */
class SvyatyniTabsManager {
   constructor() {
      this.activeTabClass = 'svyatyniTabActive';
      this.activeContentClass = 'svyatyniContentActive';
      this.init();
   }

   init() {
      this.setupEventListeners();
      this.setupKeyboardNavigation();
      this.ensureInitialState();
      this.debug('🏛️ Svyatyni Tabs Manager initialized');
   }

   debug(message) {
      if (window.scheduleManager?.settings?.debugMode) {
         console.log(`[SvyatyniTabs] ${message}`);
      }
   }

   setupEventListeners() {
      const tabButtons = document.querySelectorAll('.svyatyni-tab-btn');
      
      tabButtons.forEach(button => {
         button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('href').substring(1);
            this.switchTab(targetId, button);
         });
      });
   }

   setupKeyboardNavigation() {
      const tabButtons = document.querySelectorAll('.svyatyni-tab-btn');
      
      tabButtons.forEach((button, index) => {
         button.addEventListener('keydown', (e) => {
            let targetIndex;
            
            switch(e.key) {
               case 'ArrowRight':
               case 'ArrowDown':
                  e.preventDefault();
                  targetIndex = (index + 1) % tabButtons.length;
                  tabButtons[targetIndex].focus();
                  break;
               case 'ArrowLeft':
               case 'ArrowUp':
                  e.preventDefault();
                  targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
                  tabButtons[targetIndex].focus();
                  break;
               case 'Home':
                  e.preventDefault();
                  tabButtons[0].focus();
                  break;
               case 'End':
                  e.preventDefault();
                  tabButtons[tabButtons.length - 1].focus();
                  break;
            }
         });
      });
   }

   switchTab(targetId, clickedButton) {
      // Remove active state from all tabs and content
      document.querySelectorAll('.svyatyni-tab-btn').forEach(btn => {
         btn.classList.remove(this.activeTabClass);
         btn.setAttribute('aria-selected', 'false');
         btn.setAttribute('tabindex', '-1');
      });

      document.querySelectorAll('.svyatyni-tab-content').forEach(content => {
         content.classList.remove(this.activeContentClass);
         content.setAttribute('aria-hidden', 'true');
      });

      // Activate clicked tab
      clickedButton.classList.add(this.activeTabClass);
      clickedButton.setAttribute('aria-selected', 'true');
      clickedButton.setAttribute('tabindex', '0');

      // Show corresponding content
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
         targetContent.classList.add(this.activeContentClass);
         targetContent.setAttribute('aria-hidden', 'false');
         
         // Smooth scroll to content
         targetContent.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
         });
      }

      // Update URL hash without page jump
      if (history.pushState) {
         history.pushState(null, null, `#${targetId}`);
      }

      this.debug(`Switched to tab: ${targetId}`);
   }

   ensureInitialState() {
      const urlHash = window.location.hash.substring(1);
      const tabButtons = document.querySelectorAll('.svyatyni-tab-btn');
      
      if (urlHash && document.getElementById(urlHash)) {
         // If there's a hash in URL, activate that tab
         const targetButton = document.querySelector(`[href="#${urlHash}"]`);
         if (targetButton) {
            this.switchTab(urlHash, targetButton);
            return;
         }
      }
      
      // Otherwise, ensure first tab is active
      if (tabButtons.length > 0) {
         const firstButton = tabButtons[0];
         const firstTargetId = firstButton.getAttribute('href').substring(1);
         this.switchTab(firstTargetId, firstButton);
      }
   }
}

// Initialize Svyatyni Tabs when DOM is ready
function initSvyatyniTabs() {
   // Only initialize if we're on the svyatyni page
   if (document.querySelector('.svyatyni-nav')) {
      window.svyatyniTabsManager = new SvyatyniTabsManager();
   }
}