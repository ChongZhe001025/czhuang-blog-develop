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
    const headingRefs = useRef({});
    const sidebarRef = useRef(null); // 新增 Ref 來監聽側邊欄

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
            target.scrollIntoView({ behavior: "smooth", block: "start" });
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
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollTop(true); // 新增：當滾動超過 300px 顯示回到頂部按鈕
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                                    <button onClick={() => scrollToHeading(heading.id)}>
                                        {heading.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {/* 主要內容區域 */}
                <article className="content">
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
                </article>
            </div>
            {showScrollTop && (
                <button className="scroll-to-top" onClick={scrollToTop}>▲</button> // 新增：回到頂部按鈕
            )}

            {/* 樣式 */}
            <style jsx>{`
                /* 主要佈局 */
                .post-layout {
                    display: flex;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                /* 漢堡按鈕 */
                .hamburger-menu {
                    display: none;
                    position: fixed;
                    top: 50%;
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

                .hamburger-menu:hover {
                    background: #ccc; /* 淺灰 hover 效果 */
                    transform: translateY(-50%) scale(1.05); /* 略微放大 */
                }

                /* 側邊欄（桌面模式） */
                .sidebar {
                    position: fixed;
                    top: 50%;
                    left: 20px;
                    transform: translateY(-50%);
                    width: 220px;
                    height: auto;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.3);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease-in-out;
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

                /* 平板和手機模式 */
                @media (max-width: 1270px) {
                    .hamburger-menu {
                        display: block;
                    }

                    .sidebar {
                        position: fixed;
                        top: 0px;
                        left: -250px;
                        width: 250px;
                        height: 100vh;
                        background: #f8f8f8; /* 取消玻璃擬態 */
                        padding: 20px;
                        transform: translateX(0);
                        transition: left 0.4s ease-in-out;
                        box-shadow: 4px 0px 10px rgba(0, 0, 0, 0.2);
                        z-index: 20; /* 確保側邊欄的值比漢堡按鈕高 */
                    }

                    .sidebar.open {
                        left: 0;
                    }

                    .content {
                        margin-left: 0;
                        padding: 20px;
                    }
                }

                .scroll-to-top {
                    position: fixed;
                    bottom: 30px;
                    right: 10px;
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
