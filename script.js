/**
 * Essence & Light E-Catalog — script.js
 * Page navigation, swipe gestures, and interactive behavior
 */

(function() {
  'use strict';

  /* ── State ── */
  let currentPage = 1;
  let TOTAL_PAGES = 16;

  /* ── DOM refs ── */
  const catalog    = document.getElementById('catalog');
  const navDots    = document.getElementById('navDots');
  const prevBtn    = document.getElementById('prevBtn');
  const nextBtn    = document.getElementById('nextBtn');
  const pageIndicator = document.getElementById('pageIndicator');

  /* ── Init ── */
  function init() {
    TOTAL_PAGES = document.querySelectorAll('.page').length || 16;
    buildNavDots();
    showPage(1, 'none');
    bindNavButtons();
    bindSwipeGestures();
    bindKeyboard();
  }

  /* ── Build nav dots ── */
  function buildNavDots() {
    navDots.innerHTML = '';
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      const dot = document.createElement('button');
      dot.className = 'nav-dot' + (i === 1 ? ' active' : '');
      dot.setAttribute('aria-label', `Page ${i}`);
      dot.setAttribute('data-page', i);
      dot.addEventListener('click', () => goToPage(i));
      navDots.appendChild(dot);
    }
  }

  /* ── Show page ── */
  function showPage(pageNum, direction) {
    const allPages = document.querySelectorAll('.page');
    const prevPageNum = currentPage;

    allPages.forEach(p => {
      const pNum = parseInt(p.dataset.page);
      if (pNum === pageNum) {
        p.classList.remove('exit-left');
        p.classList.add('active');
        p.scrollTop = 0;
      } else if (pNum === prevPageNum && direction !== 'none') {
        p.classList.add('exit-left');
        p.classList.remove('active');
        setTimeout(() => { p.classList.remove('exit-left'); }, 500);
      } else {
        p.classList.remove('active', 'exit-left');
      }
    });

    currentPage = pageNum;
    updateNav();
  }

  /* ── Update nav UI ── */
  function updateNav() {
    // Update dots
    document.querySelectorAll('.nav-dot').forEach(dot => {
      const dPage = parseInt(dot.dataset.page);
      dot.classList.toggle('active', dPage === currentPage);
    });

    // Update buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === TOTAL_PAGES;

    // Update indicator
    pageIndicator.textContent = `${currentPage} / ${TOTAL_PAGES}`;
  }

  /* ── Change page ── */
  window.changePage = function(delta) {
    const newPage = currentPage + delta;
    if (newPage < 1 || newPage > TOTAL_PAGES) return;
    goToPage(newPage);
  };

  function goToPage(pageNum) {
    if (pageNum === currentPage) return;
    const dir = pageNum > currentPage ? 'forward' : 'back';
    showPage(pageNum, dir);
  }

  /* ── Bind nav buttons ── */
  function bindNavButtons() {
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
  }

  /* ── Swipe gestures ── */
  function bindSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isDragging = false;

    catalog.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
      isDragging = false;
    }, { passive: true });

    catalog.addEventListener('touchmove', (e) => {
      if (!isDragging) {
        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);
        if (dx > dy && dx > 8) {
          isDragging = true;
        }
      }
    }, { passive: true });

    catalog.addEventListener('touchend', (e) => {
      if (!isDragging) return;

      const endX = e.changedTouches[0].clientX;
      const endTime = Date.now();
      const deltaX = endX - startX;
      const elapsed = endTime - startTime;

      // Require minimum swipe distance and not too slow
      if (Math.abs(deltaX) > 50 && elapsed < 500) {
        if (deltaX < 0) {
          changePage(1);  // swipe left → next
        } else {
          changePage(-1); // swipe right → prev
        }
      }
    }, { passive: true });

    // Mouse drag for desktop
    let mouseStartX = 0;
    let isMouseDown = false;

    catalog.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      isMouseDown = true;
    });

    catalog.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const deltaX = e.clientX - mouseStartX;
      if (Math.abs(deltaX) > 60) {
        if (deltaX < 0) changePage(1);
        else changePage(-1);
      }
    });

    catalog.addEventListener('mouseleave', () => { isMouseDown = false; });
  }

  /* ── Keyboard navigation ── */
  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          changePage(1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          changePage(-1);
          break;
        case 'Home':
          e.preventDefault();
          goToPage(1);
          break;
        case 'End':
          e.preventDefault();
          goToPage(TOTAL_PAGES);
          break;
      }
    });
  }

  /* ── Scroll wheel navigation ── */
  let wheelDebounce = null;
  catalog.addEventListener('wheel', (e) => {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;

    const atTop = activePage.scrollTop <= 0;
    const atBottom = activePage.scrollTop + activePage.clientHeight >= activePage.scrollHeight - 5;

    if (wheelDebounce) return;

    if (e.deltaY > 0 && atBottom) {
      wheelDebounce = setTimeout(() => { wheelDebounce = null; }, 600);
      changePage(1);
    } else if (e.deltaY < 0 && atTop) {
      wheelDebounce = setTimeout(() => { wheelDebounce = null; }, 600);
      changePage(-1);
    }
  }, { passive: true });

  /* ── Start ── */
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

})();
