(function() {
    'use strict';

    const CONFIG = {
        downloads: {
            stable: {
                name: 'ffh4x-panel-v2.4.1.apk',
                url: 'https://github.com/ffh4x/panel/releases/download/v2.4.1/ffh4x-panel-v2.4.1.apk',
                size: '42 MB',
                version: 'v2.4.1'
            },
            beta: {
                name: 'ffh4x-panel-v2.5.0-beta.apk',
                url: 'https://github.com/ffh4x/panel/releases/download/v2.5.0-beta/ffh4x-panel-v2.5.0-beta.apk',
                size: '48 MB',
                version: 'v2.5.0-beta'
            }
        },
        hash: {
            stable: 'a7f3c2e9b1d4f8e5c6a9b2d3e7f1a4c8b9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f'
        }
    };

    const state = {
        isDownloading: false,
        currentTab: 'aimbot'
    };

    const els = {};

    function qs(sel, ctx = document) { return ctx.querySelector(sel); }
    function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }
    function on(el, evt, fn, opts) { el.addEventListener(evt, fn, opts); }
    function off(el, evt, fn) { el.removeEventListener(evt, fn); }

    function initElements() {
        els.downloadBtn = qs('#downloadBtn');
        els.versionBadge = qs('#versionBadge');
        els.phoneScreen = qs('#phoneScreen');
        els.tabBtns = qsa('.tab-btn');
        els.panelContents = qsa('.panel-content');
        els.downloadTriggers = qsa('.download-trigger');
        els.toastContainer = qs('#toastContainer');
    }

    function showToast(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Fechar notificação">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toast));

        els.toastContainer.appendChild(toast);

        setTimeout(() => removeToast(toast), duration);

        return toast;
    }

    function removeToast(toast) {
        toast.style.animation = 'slideIn 0.2s ease-in reverse';
        setTimeout(() => toast.remove(), 200);
    }

    function animateCounters() {
        const counters = qsa('.stat-value[data-target]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.target);
                    const isDecimal = el.dataset.target.includes('.');
                    const duration = 1500;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = target * eased;
                        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current) + (target >= 1000 ? '+' : '');
                        if (progress < 1) requestAnimationFrame(updateCounter);
                    }

                    requestAnimationFrame(updateCounter);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5, rootMargin: '0px 0px -50px 0px' });

        counters.forEach(el => observer.observe(el));
    }

    function setupTabs() {
        els.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('aria-controls');
                if (!tabId) return;

                els.tabBtns.forEach(b => {
                    b.setAttribute('aria-selected', 'false');
                    b.classList.remove('active');
                });
                els.panelContents.forEach(p => p.hidden = true);

                btn.setAttribute('aria-selected', 'true');
                btn.classList.add('active');
                qs(`#${tabId}`).hidden = false;

                state.currentTab = tabId.replace('-panel', '');
            });
        });
    }

    function setupPhonePreviewInteractions() {
        const sliders = qsAll('.slider', els.phoneScreen);
        sliders.forEach(slider => {
            slider.addEventListener('input', () => {
                const valueEl = slider.parentElement.querySelector('.slider-value');
                if (valueEl) {
                    const unit = slider.max >= 100 ? (slider.max <= 360 ? '°' : (slider.max <= 500 ? 'm' : '')) : '';
                    valueEl.textContent = slider.value + unit;
                }
            });
        });

        const toggles = qsAll('.toggle input', els.phoneScreen);
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                toggle.parentElement.querySelector('.toggle-slider').classList.toggle('active', toggle.checked);
            });
        });

        const saveBtn = qs('.btn-ghost', els.phoneScreen);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => showToast('Configuração salva no painel!', 'success'));
        }
    }

    function qsAll(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

    function triggerDownload(version) {
        if (state.isDownloading) return;
        state.isDownloading = true;

        const dl = CONFIG.downloads[version];
        if (!dl) {
            showToast('Versão não encontrada', 'error');
            state.isDownloading = false;
            return;
        }

        const btn = qs(`[data-download="${version}"]`);
        if (btn) {
            btn.disabled = true;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `
                <svg class="spinner" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1" stroke-linecap="round"/>
                </svg>
                <span>Preparando...</span>
            `;
        }

        setTimeout(() => {
            const link = document.createElement('a');
            link.href = dl.url;
            link.download = dl.name;
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast(`Download iniciado: ${dl.name}`, 'success');

            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }

            state.isDownloading = false;

            if ('navigator' in window && 'share' in navigator && navigator.canShare && navigator.canShare({ files: [] })) {
                showToast('Dica: toque no arquivo baixado para instalar', 'info', 6000);
            }
        }, 800);
    }

    function setupDownloadButtons() {
        els.downloadTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const version = btn.dataset.download;
                triggerDownload(version);
            });
        });
    }

    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = qs(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = qs('.header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    function setupParallax() {
        const phoneMockup = qs('.phone-mockup');
        if (!phoneMockup) return;

        let ticking = false;
        function updateParallax() {
            const scrolled = window.scrollY;
            const rate = scrolled * 0.08;
            phoneMockup.style.transform = `translateY(${rate}px)`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    function setupIntersectionAnimations() {
        const animatedElements = qsa('.feature-card, .download-card, .step-card, .changelog-item, .faq-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    function setupHeaderScroll() {
        const header = qs('.header');
        let lastScroll = 0;
        let ticking = false;

        function updateHeader() {
            const currentScroll = window.scrollY;
            if (currentScroll > 100) {
                header.style.background = 'rgba(10, 15, 13, 0.95)';
                header.style.borderBottomColor = 'var(--border-bright)';
            } else {
                header.style.background = 'rgba(10, 15, 13, 0.85)';
                header.style.borderBottomColor = 'var(--border)';
            }
            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    function setupCopyHash() {
        qsa('.btn-copy').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const codeEl = btn.closest('code');
                if (!codeEl) return;

                try {
                    await navigator.clipboard.writeText(codeEl.textContent.trim());
                    btn.textContent = 'Copiado!';
                    btn.style.background = 'var(--accent)';
                    showToast('Hash copiado para a área de transferência', 'success');
                    setTimeout(() => {
                        btn.textContent = 'Copiar';
                        btn.style.background = '';
                    }, 2000);
                } catch {
                    showToast('Erro ao copiar', 'error');
                }
            });
        });
    }

    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                qsa('.toast').forEach(removeToast);
            }
        });
    }

    function setupThemeToggle() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        function handleChange(e) {
            document.documentElement.style.setProperty('--bg', e.matches ? '#0a0f0d' : '#f0f7f3');
        }
        mediaQuery.addEventListener ? mediaQuery.addEventListener('change', handleChange) : mediaQuery.addListener(handleChange);
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }

    function boot() {
        initElements();
        animateCounters();
        setupTabs();
        setupPhonePreviewInteractions();
        setupDownloadButtons();
        setupSmoothScroll();
        setupParallax();
        setupIntersectionAnimations();
        setupHeaderScroll();
        setupCopyHash();
        setupKeyboardNavigation();
        setupThemeToggle();

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .spinner { animation: spin 1s linear infinite; }
        `;
        document.head.appendChild(style);

        console.log('%c ffh4x Panel by mu ', 'background: linear-gradient(135deg, #00ff88, #00cc6a); color: #0a0f0d; font-weight: 700; font-size: 14px; padding: 4px 12px; border-radius: 4px;');
        console.log('%c Site carregado com sucesso. Painel pronto para download.', 'color: #8ab89c; font-size: 12px;');
    }

    init();
})();