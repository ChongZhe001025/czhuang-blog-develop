import * as React from "react";
import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Layout } from "../components";
import data from "../data/blog.json";

const Post = ({ location, pageContext }) => {
    const { slug } = pageContext;
    const postEdge = data.allPosts.edges.find((edge) => edge.node.slug === slug);
    const post = postEdge ? postEdge.node : null;

    const [content, setContent] = useState("");
    const [headings, setHeadings] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 控制側邊欄開關
    const [showScrollTop, setShowScrollTop] = useState(false); // 新增：控制回到頂部按鈕的狀態
    const [scrollBtnBottom, setScrollBtnBottom] = useState(30); // 新增：動態調整按鈕與底部距離，避免與 footer 重疊
    const [scrollBtnRight, setScrollBtnRight] = useState(10); // 新增：對齊文章內容右側
    const [activeHeadingId, setActiveHeadingId] = useState(null); // 新增：目前章節
    const headingRefs = useRef({});
    const sidebarRef = useRef(null); // 新增 Ref 來監聽側邊欄
    const contentRef = useRef(null); // 文章內容容器，用於定位回到頂部按鈕

    useEffect(() => {
        if (post && post.html) {
            fetch(post.html)
                .then((res) => res.text())
                .then((data) => {
                    setContent(data);
                    extractHeadings(data);
                })
                .catch((err) => console.error("Failed to load content:", err));
        }
    }, [post]);

    // 只提取 h2 標題
    const extractHeadings = (markdown) => {
        const headingRegex = /^##\s+(.+)$/gm;
        const matches = [...markdown.matchAll(headingRegex)];
        const parsedHeadings = matches.map((match) => ({
            text: match[1],
            id: match[1].toLowerCase().replace(/\s+/g, "-"),
        }));

        setHeadings(parsedHeadings);
        parsedHeadings.forEach((heading) => {
            headingRefs.current[heading.id] = React.createRef();
        });
    };

    // 滾動到指定標題
    const scrollToHeading = (id) => {
        const target = headingRefs.current[id]?.current;
        if (target) {
            // 取得固定於頂部的導覽或整個 header 高度，避免被遮住
            const headerEl = document.querySelector('.site-head') || document.querySelector('.site-nav');
            const fixedTopHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
            const extraGap = 8; // 與導覽保持一點距離，避免貼齊

            const targetTop = target.getBoundingClientRect().top + window.scrollY;
            const scrollTop = Math.max(0, targetTop - fixedTopHeight - extraGap);
            window.scrollTo({ top: scrollTop, behavior: 'smooth' });
            // 立即高亮所點擊的章節，避免過渡期間顯示為上一個
            setActiveHeadingId(id);
            setIsSidebarOpen(false); // 滾動後自動關閉側邊欄（在手機模式下）
        }
    };

    // 監聽點擊空白處來關閉側邊欄
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        const updateScrollUI = () => {
            // 顯示／隱藏「回到頂部」按鈕
            setShowScrollTop(window.scrollY > 200);

            // 動態調整避免與 footer 重疊
            const footer = document.querySelector('.site-foot');
            if (footer) {
                const rect = footer.getBoundingClientRect();
                // 若 footer 進入視窗，計算重疊高度，並加到預設 bottom 空隙
                const overlap = Math.max(0, window.innerHeight - rect.top);
                setScrollBtnBottom(30 + overlap);
            } else {
                setScrollBtnBottom(30);
            }

            // 讓按鈕水平對齊文章內容的右側
            const container = contentRef.current || document.querySelector('.content');
            if (container) {
                const cRect = container.getBoundingClientRect();
                // 與內容右側保持 10px 內距，同時不得小於 10px
                const rightGap = Math.max(10, window.innerWidth - cRect.right + 10);
                setScrollBtnRight(rightGap);
            } else {
                setScrollBtnRight(10);
            }

            // 計算目前章節（考慮固定頂部導覽高度）
        const headerEl = document.querySelector('.site-head') || document.querySelector('.site-nav');
        const fixedTop = headerEl ? headerEl.getBoundingClientRect().height : 0;
        const gap = 8;
        const activationOffset = 16; // 容忍距離，避免剛好落在頂部邊界時亮起上一個
            if (headings && headings.length > 0) {
                let currentId = headings[0].id;
                for (let i = 0; i < headings.length; i++) {
                    const h = headings[i];
                    const el = headingRefs.current[h.id]?.current || document.getElementById(h.id);
                    if (!el) continue;
            const top = el.getBoundingClientRect().top - fixedTop - gap;
            if (top <= activationOffset) {
                        currentId = h.id;
                    } else {
                        break;
                    }
                }
                setActiveHeadingId(currentId);
            } else {
                setActiveHeadingId(null);
            }
        };

        window.addEventListener("scroll", updateScrollUI);
        window.addEventListener("resize", updateScrollUI);
        // 初始執行一次，確保正確位置
        updateScrollUI();

        return () => {
            window.removeEventListener("scroll", updateScrollUI);
            window.removeEventListener("resize", updateScrollUI);
        };
    }, [headings]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" }); // 新增：平滑滾動回到頂部
    };

    

    if (!post) {
        return (
            <Layout>
                <div className="post-container">
                    <h1>Post not found</h1>
                    <p>Sorry, the post you are looking for does not exist.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Helmet>
                <title>{post.title}</title>
                <style type="text/css">{post.codeinjection_styles || ""}</style>
            </Helmet>

            {/* 漢堡選單按鈕（手機和平板時顯示） */}
            <button className="hamburger-menu" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            »
            </button>

            <div className="post-layout">
                {/* 側邊欄（桌面模式固定，手機模式變成可開關的菜單） */}
                {headings.length > 0 && (
                    <aside ref={sidebarRef} className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                        <ul>
                            {headings.map((heading) => (
                                <li key={heading.id}>
                                    <button
                                        onClick={() => scrollToHeading(heading.id)}
                                        className={activeHeadingId === heading.id ? 'active' : ''}
                                        aria-current={activeHeadingId === heading.id ? 'true' : undefined}
                                    >
                                        {heading.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {/* 主要內容區域 */}
                <article className="content" ref={contentRef}>
                    <section className="post-full-content">
                        <h1 className="content-title">{post.title}</h1>
                        <section className="content-body load-external-scripts">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({ node, children }) => {
                                        const id = children.toString().toLowerCase().replace(/\s+/g, "-");
                                        return (
                                            <h2 id={id} ref={headingRefs.current[id]}>
                                                {children}
                                            </h2>
                                        );
                                    },
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </section>
                    </section>
                    {showScrollTop && (
                        <button
                            className="scroll-to-top"
                            onClick={scrollToTop}
                            style={{ bottom: `${scrollBtnBottom}px`, right: `${scrollBtnRight}px` }}
                        >
                            ▲
                        </button>
                    )}
                </article>
            </div>

            {/* 樣式 */}
            <style jsx>{`
                /* 主要佈局 */
                .post-layout {
                    display: flex;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    position: relative; /* 讓行動版側欄以此為定位範圍，只在文章畫面內出現 */
                }
                /* 讓所有 H2 在捲動至視窗頂部時，預留固定導覽高度 */
                .content h2 { scroll-margin-top: calc(var(--site-head-offset, 0px) + 8px); }

                /* 漢堡按鈕 */
                .hamburger-menu {
                    display: none;
                    position: fixed;
                    top: 50%;
                    left: 10px;
                    transform: translateY(-50%); /* 讓按鈕垂直置中 */
                    background: #ddd; /* 淺灰色背景 */
                    color: black; /* 文字顏色 */
                    border: none;
                    width: 40px; /* 長方形寬度 */
                    height: 40px; /* 長方形高度 */
                    font-size: 30px; /* 調整 icon 大小 */
                    cursor: pointer;
                    border-radius: 10px; /* 設定圓角 */
                    z-index: 10;
                    transition: background 0.3s ease, transform 0.2s ease;
                    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.5); /* 強化陰影 */
                }

                /* 文章容器：提供絕對定位的參考 */
                .content {
                    position: relative;
                }

                .hamburger-menu:hover {
                    background: #ccc; /* 淺灰 hover 效果 */
                    transform: translateY(-50%) scale(1.05); /* 略微放大 */
                }

                /* 側邊欄（桌機/平板）：固定於視窗，不受捲動影響，垂直置中且高度自動 */
                .sidebar {
                    position: fixed;
                    top: calc(var(--site-head-offset, 0px) + (100vh - var(--site-head-offset, 0px)) / 2);
                    left: max(20px, calc((100vw - 1200px) / 2 + 20px));
                    width: 240px;
                    height: auto; /* 隨內容自動增高 */
                    max-height: calc(100vh - var(--site-head-offset, 0px) - 40px); /* 不超出視窗 */
                    transform: translateY(-50%); /* 垂直置中 */
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease-in-out;
                    z-index: 5;
                }

                /* 桌機/平板：為固定側欄預留空間，避免內容被覆蓋 */
                @media (min-width: 769px) {
                    .content { margin-left: 280px; }
                }

                /* 側邊欄內部樣式 */
                .sidebar ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    width: 100%;
                }

                .sidebar li {
                    margin: 5px 0;
                }

                .sidebar button {
                    background: none;
                    border: none;
                    text-align: left;
                    color: #333;
                    cursor: pointer;
                    font-size: 15px;
                    padding: 8px 8px;
                    display: block;
                    width: 100%;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .sidebar button:hover {
                    background: rgba(255, 255, 255, 0.4);
                    color: #000;
                    transform: translateX(5px);
                }

                /* 目前章節高亮 */
                .sidebar button.active {
                    background: rgba(0, 0, 0, 0.08);
                    color: #000;
                    font-weight: 600;
                }

                /* 手機模式：側欄固定於視窗，使用漢堡切換 */
                @media (max-width: 768px) {
                    .hamburger-menu {
                        display: block;
                    }

                    .sidebar {
            position: fixed;                                   /* 固定在視窗，隨捲動可見 */
            top: calc(var(--site-head-offset, 0px) + 10px);    /* 位於 header 下方 */
                        left: 0;
                        width: 260px;
                        height: auto;
                        max-height: calc(100vh - var(--site-head-offset, 0px) - 20px); /* 不超出可視高度 */
                        background: #f8f8f8;
                        padding: 20px;
                        transform: translateX(-110%);                      /* 預設收起，隱於左側 */
                        transition: transform 0.35s ease-in-out;
                        box-shadow: 4px 0px 10px rgba(0, 0, 0, 0.2);
                        z-index: 20;                                       /* 高於文章內容與按鈕 */
                        overflow: auto;                                     /* 內容過長可捲動 */
                    }

                    .sidebar.open {
                        transform: translateX(0);
                    }

                    .content { margin-left: 0; padding: 20px; }
                }

                .scroll-to-top {
                    position: fixed; /* 固定在視窗上 */
                    bottom: 30px;
                    right: 10px;
                    z-index: 25; /* 避免被側邊欄或其他元素遮住 */
                    background: #ddd; /* 淺灰色背景 */
                    color: black;
                    border: none;
                    width: 40px; /* 設定正方形寬度 */
                    height: 40px; /* 設定正方形高度 */
                    font-size: 20px;
                    cursor: pointer;
                    border-radius: 10px; /* 設定圓角 */
                    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.5); /* 強化陰影 */
                    transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .scroll-to-top:hover {
                    background: #ccc;
                    transform: scale(1.05); /* 略微放大 */
                    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3); /* 增強陰影 */
                }

            `}</style>
        </Layout>
    );
};

Post.propTypes = {
    location: PropTypes.object.isRequired,
};

export default Post;
