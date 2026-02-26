// ==============================
// BLOG — Blog Grid & Article Detail
// ==============================

import { dispatch } from '../store.js';
import { showToast } from '../utils/helpers.js';

let blogArticles = [];
let currentShowPage = null; // Will be set via setBlogNavigation

/**
 * Set the showPage callback to avoid circular imports
 */
export function setBlogNavigation(showPageFn) {
    currentShowPage = showPageFn;
}

/**
 * Initialize the blog — fetch articles, render cards, bind click events
 */
export async function initBlog() {
    try {
        const response = await fetch('data/blog-articles.json');
        blogArticles = await response.json();
    } catch (err) {
        console.warn('Could not load blog articles:', err);
        blogArticles = [];
    }

    renderBlogCards();
}

/**
 * Render blog cards from JSON data into the blog grid
 */
function renderBlogCards() {
    const grid = document.querySelector('.blog-grid');
    if (!grid || blogArticles.length === 0) return;

    grid.innerHTML = '';

    blogArticles.forEach((article, index) => {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.style.animationDelay = `${index * 80}ms`;
        card.dataset.slug = article.slug;
        card.innerHTML = `
            <div class="blog-card__image" style="background: ${article.thumbnail};">
                <div class="blog-card__image-overlay"></div>
                <span class="blog-card__read-badge">${article.readTime}</span>
            </div>
            <div class="blog-card__content">
                <span class="blog-card__tag">${article.tag}</span>
                <h3 class="blog-card__title">${article.title}</h3>
                <p class="blog-card__excerpt">${article.excerpt}</p>
                <div class="blog-card__meta">
                    <span>${article.date}</span>
                    <span>${article.readTime}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => showArticle(article.slug));
        card.style.cursor = 'pointer';
        grid.appendChild(card);
    });
}

/**
 * Show a full article by slug
 */
export function showArticle(slug) {
    const article = blogArticles.find(a => a.slug === slug);
    if (!article) return;

    const section = document.getElementById('blogArticleSection');
    if (!section) return;

    // Build the article HTML
    section.innerHTML = `
        <!-- Hero Banner with Thumbnail Background -->
        <div class="article-hero" style="background: ${article.thumbnail};">
            <div class="article-hero__overlay"></div>
            <div class="article-hero__content">
                <button class="article-hero__back" id="articleBackBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Blog
                </button>
                <span class="article-hero__tag">${article.tag}</span>
                <h1 class="article-hero__title">${article.title}</h1>
                <div class="article-hero__meta">
                    <span class="article-hero__author">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        ${article.author}
                    </span>
                    <span class="article-hero__date">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${article.date}
                    </span>
                    <span class="article-hero__read-time">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${article.readTime}
                    </span>
                </div>
            </div>
        </div>

        <!-- Article Body -->
        <div class="article-body">
            <div class="article-body__container">
                <!-- Progress Bar -->
                <div class="article-progress">
                    <div class="article-progress__bar" id="articleProgressBar"></div>
                </div>

                <!-- Content -->
                <div class="article-content" id="articleContent">
                    ${renderArticleContent(article.content)}
                </div>

                <!-- Share & Actions -->
                <div class="article-footer">
                    <div class="article-footer__share">
                        <span class="article-footer__label">Share this article</span>
                        <div class="article-footer__buttons">
                            <button class="article-footer__btn" title="Copy link" id="articleCopyLink">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Related Articles -->
                <div class="article-related">
                    <h2 class="article-related__title">Related Articles</h2>
                    <div class="article-related__grid">
                        ${renderRelatedArticles(article.id)}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Navigate to article page
    dispatch({ type: 'SET_PAGE', payload: 'blogArticle' });
    if (currentShowPage) currentShowPage('blogArticle');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Bind events
    const backBtn = document.getElementById('articleBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            dispatch({ type: 'SET_PAGE', payload: 'blog' });
            if (currentShowPage) currentShowPage('blog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const copyBtn = document.getElementById('articleCopyLink');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.origin + '/#blog/' + slug)
                .then(() => showToast('Link copied to clipboard!'))
                .catch(() => showToast('Could not copy link', 'error'));
        });
    }

    // Scroll-reveal animation for article content blocks
    initScrollReveal();

    // Reading progress bar
    initReadingProgress();

    // Related article clicks
    section.querySelectorAll('.related-card').forEach(card => {
        card.addEventListener('click', () => {
            const relatedSlug = card.dataset.slug;
            if (relatedSlug) showArticle(relatedSlug);
        });
    });
}

/**
 * Render article content blocks to HTML
 */
function renderArticleContent(content) {
    return content.map((block, i) => {
        const delay = i * 60;
        switch (block.type) {
            case 'heading':
                return `<h2 class="article-content__heading reveal-block" style="--reveal-delay: ${delay}ms">${block.text}</h2>`;
            case 'paragraph':
                return `<p class="article-content__paragraph reveal-block" style="--reveal-delay: ${delay}ms">${block.text}</p>`;
            case 'quote':
                return `<blockquote class="article-content__quote reveal-block" style="--reveal-delay: ${delay}ms">
                    <svg class="article-content__quote-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                    <p>${block.text}</p>
                </blockquote>`;
            case 'list':
                return `<ul class="article-content__list reveal-block" style="--reveal-delay: ${delay}ms">
                    ${block.items.map(item => `<li>${item}</li>`).join('')}
                </ul>`;
            default:
                return '';
        }
    }).join('');
}

/**
 * Render related articles (exclude current)
 */
function renderRelatedArticles(currentId) {
    const related = blogArticles.filter(a => a.id !== currentId).slice(0, 3);
    return related.map(article => `
        <article class="related-card" data-slug="${article.slug}">
            <div class="related-card__image" style="background: ${article.thumbnail};"></div>
            <div class="related-card__content">
                <span class="related-card__tag">${article.tag}</span>
                <h4 class="related-card__title">${article.title}</h4>
                <span class="related-card__meta">${article.date} · ${article.readTime}</span>
            </div>
        </article>
    `).join('');
}

/**
 * Initialize scroll-reveal for content blocks
 */
function initScrollReveal() {
    const blocks = document.querySelectorAll('.reveal-block');
    if (!blocks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    blocks.forEach(block => observer.observe(block));
}

/**
 * Reading progress bar
 */
function initReadingProgress() {
    const bar = document.getElementById('articleProgressBar');
    if (!bar) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${Math.min(100, progress)}%`;
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
}
