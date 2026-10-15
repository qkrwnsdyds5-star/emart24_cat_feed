/**
 * 이마트24 PL '고맙다옹' 발표용 웹페이지 메인 스크립트
 * Pure Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initPresentationNavigation();
  initShortsPlayer();
  initProductShowcase();
  initPersonaJourney();
  initShelfHotspots();
  initLightbox();
});

/* --------------------------------------------------------------------------
   1. 프레젠테이션 슬라이드 네비게이션 및 키보드 단축키
   -------------------------------------------------------------------------- */
function initPresentationNavigation() {
  const slideSections = Array.from(document.querySelectorAll('section.section'));
  const slideCountEl = document.getElementById('slideCount');
  const progressBar = document.getElementById('scrollProgressBar');
  const prevBtn = document.getElementById('pitchPrevBtn');
  const nextBtn = document.getElementById('pitchNextBtn');
  const pitchModeBtn = document.getElementById('pitchFullscreenBtn');
  const pitchModeLabel = document.getElementById('pitchModeLabel');
  const pitchModeIcon = document.getElementById('pitchModeIcon');
  const gnbNavLinks = document.querySelectorAll('.gnb-nav a');

  let currentSlideIndex = 0;
  const totalSlides = slideSections.length;

  // 업데이트 슬라이드 번호 및 GNB 액티브
  function updateSlideState(index) {
    if (index >= 0 && index < totalSlides) {
      currentSlideIndex = index;
      if (slideCountEl) {
        slideCountEl.textContent = `${String(currentSlideIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
      }

      // GNB active link update
      const currentId = slideSections[currentSlideIndex].id;
      gnbNavLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  // 특정 슬라이드로 스크롤 이동 (상단 기준 맞춤)
  function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
      slideSections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateSlideState(index);
    }
  }

  // 이전/다음 버튼 리스너
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentSlideIndex > 0) goToSlide(currentSlideIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentSlideIndex < totalSlides - 1) goToSlide(currentSlideIndex + 1);
    });
  }

  // 발표 모드 (100vh 슬라이드 화면 맞춤) 토글
  function togglePitchMode() {
    const isPitchActive = document.body.classList.toggle('pitch-mode-active');
    
    if (pitchModeLabel) {
      pitchModeLabel.textContent = isPitchActive ? '일반 모드' : '발표 모드';
    }
    if (pitchModeIcon) {
      pitchModeIcon.textContent = isPitchActive ? '✕' : '🖥️';
    }

    if (isPitchActive) {
      showToast('🖥️ 발표 모드 활성화: 슬라이드가 화면에 100% 맞춤 정렬됩니다.');
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      showToast('일반 스크롤 모드로 전환되었습니다.');
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }

    setTimeout(() => {
      goToSlide(currentSlideIndex);
    }, 100);
  }

  if (pitchModeBtn) {
    pitchModeBtn.addEventListener('click', togglePitchMode);
  }

  // 키보드 방향키 및 단축키
  window.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightboxOverlay');
    
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('open')) {
        lightbox.classList.remove('open');
        return;
      }
      if (document.body.classList.contains('pitch-mode-active')) {
        togglePitchMode();
        return;
      }
    }

    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      togglePitchMode();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (currentSlideIndex < totalSlides - 1) {
        goToSlide(currentSlideIndex + 1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentSlideIndex > 0) {
        goToSlide(currentSlideIndex - 1);
      }
    }
  });

  // 스크롤 진행률
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPos = window.scrollY;
    const progress = totalHeight > 0 ? (scrollPos / totalHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // GNB 헤더 그림자
    const gnbHeader = document.querySelector('.gnb-header');
    if (gnbHeader) {
      if (scrollPos > 30) {
        gnbHeader.classList.add('scrolled');
      } else {
        gnbHeader.classList.remove('scrolled');
      }
    }
  });

  // 섹션 뷰포트 감지
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = slideSections.indexOf(entry.target);
        if (index !== -1) {
          updateSlideState(index);
        }
      }
    });
  }, { threshold: 0.5 });

  slideSections.forEach(section => observer.observe(section));
}

/* --------------------------------------------------------------------------
   2. 9:16 쇼츠(Shorts) 세로형 영상 플레이어 & 폴백 시뮬레이터
   -------------------------------------------------------------------------- */
function initShortsPlayer() {
  const video = document.getElementById('shortsVideo');
  const fallbackCover = document.getElementById('shortsFallback');
  const centerPlayBtn = document.getElementById('shortsCenterPlayBtn');
  const progressFill = document.getElementById('shortsProgressFill');
  const likeBtn = document.getElementById('shortsLikeBtn');
  const likeCountSpan = document.getElementById('shortsLikeCount');
  const soundBtn = document.getElementById('shortsSoundBtn');
  const soundIcon = document.getElementById('shortsSoundIcon');
  const shareBtn = document.getElementById('shortsShareBtn');
  const commentBtn = document.getElementById('shortsCommentBtn');
  const screen = document.getElementById('shortsScreen');
  const fileNotice = document.getElementById('shortsFileNotice');

  let isPlaying = false;
  let isMuted = true;
  let isLiked = false;
  let currentLikes = 14500;
  let isRealVideo = false;
  let simTime = 0;
  const simDuration = 15; // 15 seconds loop
  let simInterval = null;

  // 비디오 파일 존재 여부 검사
  if (video) {
    video.addEventListener('canplay', () => {
      // 실제 비디오 파일 로드 성공 시
      isRealVideo = true;
      video.style.display = 'block';
      if (fallbackCover) fallbackCover.style.display = 'none';
      if (fileNotice) {
        fileNotice.innerHTML = `
          <div class="notice-icon">🎥</div>
          <p><strong>실제 영상 연동 완료!</strong> 고맙다옹 세로 숏폼 영상(shorts.mp4)이 정상적으로 재생됩니다.</p>
        `;
        fileNotice.style.background = 'rgba(78, 135, 101, 0.2)';
        fileNotice.style.borderColor = '#4E8765';
      }
    });

    video.addEventListener('error', () => {
      // 비디오 파일이 없을 때 (현재 상태)
      isRealVideo = false;
      video.style.display = 'none';
      if (fallbackCover) fallbackCover.style.display = 'block';
    });

    video.addEventListener('timeupdate', () => {
      if (isRealVideo && video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;
      }
    });
  }

  // 재생 / 일시정지 토글
  function togglePlay() {
    isPlaying = !isPlaying;

    if (isRealVideo && video) {
      if (isPlaying) {
        video.play();
        if (centerPlayBtn) centerPlayBtn.style.opacity = '0';
      } else {
        video.pause();
        if (centerPlayBtn) {
          centerPlayBtn.style.opacity = '1';
          centerPlayBtn.innerHTML = '▶';
        }
      }
    } else {
      // 가상 시뮬레이션 모드
      if (isPlaying) {
        if (centerPlayBtn) centerPlayBtn.style.opacity = '0';
        clearInterval(simInterval);
        simInterval = setInterval(() => {
          simTime += 0.1;
          if (simTime >= simDuration) simTime = 0;
          const pct = (simTime / simDuration) * 100;
          if (progressFill) progressFill.style.width = `${pct}%`;
        }, 100);
      } else {
        if (centerPlayBtn) {
          centerPlayBtn.style.opacity = '1';
          centerPlayBtn.innerHTML = '▶';
        }
        clearInterval(simInterval);
      }
    }
  }

  if (centerPlayBtn) {
    centerPlayBtn.addEventListener('click', togglePlay);
  }
  if (screen) {
    screen.addEventListener('click', (e) => {
      // 사이드 버튼 클릭이 아닌 경우만 토글
      if (!e.target.closest('.shorts-side-actions') && !e.target.closest('.shorts-progress-bar-container')) {
        togglePlay();
      }
    });
  }

  // 좋아요 버튼 & 하트 파티클 인터랙션
  if (likeBtn) {
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isLiked = !isLiked;
      likeBtn.classList.toggle('liked', isLiked);

      if (isLiked) {
        currentLikes++;
        createFloatingHeart(screen);
        createFloatingHeart(screen);
      } else {
        currentLikes--;
      }

      if (likeCountSpan) {
        likeCountSpan.textContent = (currentLikes / 1000).toFixed(1) + 'k';
      }
    });
  }

  // 화면 더블 클릭 시 하트 스폰
  if (screen) {
    screen.addEventListener('dblclick', (e) => {
      createFloatingHeart(screen, e.offsetX, e.offsetY);
      if (!isLiked && likeBtn) {
        likeBtn.click();
      }
    });
  }

  function createFloatingHeart(container, x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    const icons = ['❤️', '🐾', '✨', '😻'];
    heart.textContent = icons[Math.floor(Math.random() * icons.length)];
    
    const posX = x !== undefined ? x : 160 + (Math.random() * 60 - 30);
    const posY = y !== undefined ? y : 360 + (Math.random() * 60 - 30);
    
    heart.style.left = `${posX}px`;
    heart.style.top = `${posY}px`;

    container.appendChild(heart);
    setTimeout(() => {
      heart.remove();
    }, 1200);
  }

  // 사운드 토글
  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isMuted = !isMuted;
      if (video) video.muted = isMuted;
      if (soundIcon) {
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
      }
      showToast(isMuted ? '음소거되었습니다.' : '소리가 켜졌습니다.');
    });
  }

  // 공유 버튼
  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navigator.share) {
        navigator.share({
          title: "이마트24 PL '고맙다옹' 길고양이 책임 급여 키트",
          text: "길고양이와의 따뜻한 한 끼, 뒷정리까지 책임지는 이마트24 고맙다옹 쇼츠!",
          url: window.location.href,
        }).catch(() => {});
      } else {
        showToast('공유 링크가 클립보드에 복사되었습니다!');
      }
    });
  }

  // 댓글 버튼
  if (commentBtn) {
    commentBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('💬 바이럴 댓글 320개: "이마트24 기획 대박이다", "길냥이 챙길 때 필수템!"');
    });
  }
}

/* --------------------------------------------------------------------------
   3. 제품 라인업 탭 전환 및 앞/뒷면 뷰어 (꼬마냥 vs 어른냥)
   -------------------------------------------------------------------------- */
function initProductShowcase() {
  const kittenTab = document.getElementById('tabKitten');
  const adultTab = document.getElementById('tabAdult');
  const showcaseContainer = document.getElementById('productShowcaseBox');
  const productTitle = document.getElementById('productTitle');
  const productPrice = document.getElementById('productPrice');
  const productTag = document.getElementById('productTag');
  const productImg = document.getElementById('productMainImg');
  const btnViewFront = document.getElementById('btnViewFront');
  const btnViewBack = document.getElementById('btnViewBack');
  const partKibbleDesc = document.getElementById('partKibbleDesc');

  let currentLineup = 'kitten'; // 'kitten' | 'adult'
  let currentView = 'front';    // 'front' | 'back'

  const productData = {
    kitten: {
      tag: '1세 미만 자묘용 (Kitten)',
      title: '고맙다옹 꼬마냥 밥물세트',
      price: '2,500원',
      kibbleDesc: '소화 흡수가 빠른 고단백 자묘 전용 키튼 건식 사료 (80g) + 안심 씰링',
      themeClass: 'kitten-theme',
      frontImg: 'image (1).png',
      backImg: 'image (2).png'
    },
    adult: {
      tag: '1세 이상 성묘용 (Adult)',
      title: '고맙다옹 어른냥 밥물세트',
      price: '2,800원',
      kibbleDesc: '면역력 강화 및 요로 건강 케어 성묘 전용 균형 사료 (80g) + 안심 씰링',
      themeClass: 'adult-theme',
      frontImg: 'image (1).png',
      backImg: 'image (2).png'
    }
  };

  function updateProductUI() {
    const data = productData[currentLineup];
    if (productTitle) productTitle.textContent = data.title;
    if (productPrice) productPrice.innerHTML = `${data.price} <span>/ 1세트</span>`;
    if (productTag) productTag.textContent = data.tag;
    if (partKibbleDesc) partKibbleDesc.textContent = data.kibbleDesc;

    if (showcaseContainer) {
      showcaseContainer.classList.remove('kitten-theme', 'adult-theme');
      showcaseContainer.classList.add(data.themeClass);
    }

    if (productImg) {
      productImg.src = currentView === 'front' ? data.frontImg : data.backImg;
      productImg.alt = `${data.title} ${currentView === 'front' ? '구성품 분해 뷰' : '패키지 앞/뒷면 및 주의사항'}`;
    }

    // Toggle button active states
    if (btnViewFront && btnViewBack) {
      btnViewFront.classList.toggle('active', currentView === 'front');
      btnViewBack.classList.toggle('active', currentView === 'back');
    }
  }

  if (kittenTab) {
    kittenTab.addEventListener('click', () => {
      currentLineup = 'kitten';
      kittenTab.classList.add('active');
      if (adultTab) adultTab.classList.remove('active');
      updateProductUI();
    });
  }

  if (adultTab) {
    adultTab.addEventListener('click', () => {
      currentLineup = 'adult';
      adultTab.classList.add('active');
      if (kittenTab) kittenTab.classList.remove('active');
      updateProductUI();
    });
  }

  if (btnViewFront) {
    btnViewFront.addEventListener('click', () => {
      currentView = 'front';
      updateProductUI();
    });
  }

  if (btnViewBack) {
    btnViewBack.addEventListener('click', () => {
      currentView = 'back';
      updateProductUI();
    });
  }
}

/* --------------------------------------------------------------------------
   4. 페르소나 5단계 고객 여정 인터랙티브 스텝퍼
   -------------------------------------------------------------------------- */
function initPersonaJourney() {
  const stepTabs = document.querySelectorAll('.step-tab-btn');
  const stepBadge = document.getElementById('journeyStepBadge');
  const stepTitle = document.getElementById('journeyStepTitle');
  const stepDesc = document.getElementById('journeyStepDesc');
  const stepTip = document.getElementById('journeyStepTip');

  const journeyData = [
    {
      step: '1단계',
      title: '우연한 만남 — 길고양이 발견',
      desc: '학교나 아르바이트를 마치고 원룸촌으로 돌아가던 중, 골목길 화단 근처에서 길고양이를 마주칩니다. 안쓰러운 마음에 그냥 지나치기 어렵지만, 사료나 식기를 가지고 있지 않습니다.',
      tip: '💡 김서연의 고민: "한 번 챙겨주고 싶은데 가방에 사료도 없고 그릇도 없네..."'
    },
    {
      step: '2단계',
      title: '접근성 — 근처 이마트24 방문',
      desc: '골목길과 주거지 동선에 바로 위치한 가까운 이마트24 매장에 들러 반려동물 코너로 직행합니다. 대용량(1~3kg) 사료 대신 1회용 올인원 키트인 \'고맙다옹\'을 발견합니다.',
      tip: '💡 이마트24의 경쟁력: 주거 상권 매출 75% 집약 인프라로 즉각적인 구매 해결!'
    },
    {
      step: '3단계',
      title: '맞춤 선택 — 꼬마냥 vs 어른냥',
      desc: '만난 고양이의 크기와 연령대를 떠올려 꼬마냥(키튼용 2,500원) 또는 어른냥(성묘용 2,800원) 중 적합한 제품을 망설임 없이 고릅니다.',
      tip: '💡 부담 없는 2천원대 단가로 20대 대학생의 구매 심리 장벽을 최소화했습니다.'
    },
    {
      step: '4단계',
      title: '책임 급여 — 사료·물 제공 및 안전거리 관찰',
      desc: '상단 사료 볼과 하단 물 볼을 개봉하여 바닥에 놓아줍니다. 슬리브 뒷면 안내에 따라 고양이가 불안해하지 않도록 두 발짝 뒤로 물러나 편안하게 먹는 모습을 지켜봅니다.',
      tip: '💡 3대 수칙: 주거지 현관 앞을 피하고 안전거리(1~2m)를 유지하여 고양이와 교감합니다.'
    },
    {
      step: '5단계',
      title: '클린 회수 — 잔여물과 용기 정리 및 귀가',
      desc: '식사가 끝난 후 남은 사료와 플라스틱 볼을 동봉된 접이식 정리봉투에 쏙 담아 밀봉한 뒤 주변을 깨끗하게 정리하고 귀가합니다.',
      tip: '💡 완벽한 클린 피딩: 길거리에 쓰레기를 남기지 않아 주민 민원과 갈등을 사전에 방지합니다.'
    }
  ];

  stepTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      stepTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const data = journeyData[index];
      if (stepBadge) stepBadge.textContent = data.step;
      if (stepTitle) stepTitle.textContent = data.title;
      if (stepDesc) stepDesc.textContent = data.desc;
      if (stepTip) stepTip.textContent = data.tip;
    });
  });
}

/* --------------------------------------------------------------------------
   5. 매대 인터랙티브 핫스팟 (image_1024.png)
   -------------------------------------------------------------------------- */
function initShelfHotspots() {
  const pins = document.querySelectorAll('.hotspot-pin');
  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const tooltip = pin.querySelector('.hotspot-tooltip');
      if (tooltip) {
        showToast(`📍 ${tooltip.textContent}`);
      }
    });
  });
}



/* --------------------------------------------------------------------------
   7. 고해상도 이미지 라이트박스 (Lightbox)
   -------------------------------------------------------------------------- */
function initLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  const imgEl = document.getElementById('lightboxImg');
  const zoomableImgs = document.querySelectorAll('.zoomable-img');

  zoomableImgs.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      if (overlay && imgEl) {
        imgEl.src = img.src;
        imgEl.alt = img.alt || '확대 이미지';
        overlay.classList.add('open');
      }
    });
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      overlay.classList.remove('open');
    });
  }
}

/* --------------------------------------------------------------------------
   8. 토스트 알림 유틸리티
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(20, 20, 22, 0.9);
      color: #FFF;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 3000;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      border: 1px solid rgba(255, 184, 0, 0.4);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}
