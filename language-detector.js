// 语言检测和自动重定向脚本
(function() {
    'use strict';
    
    // 支持的语言映射
    const languageMap = {
        'en': 'index.html',
        'zh-CN': 'index-zh.html',
        'zh-TW': 'index-zh-tw.html',
        'ja': 'index-ja.html',
        'es': 'index-es.html'
    };
    
    // 获取用户首选语言
    function getUserLanguage() {
        // 方法1: 从navigator.language获取
        let userLang = navigator.language || navigator.userLanguage;
        
        // 方法2: 从navigator.languages获取（更准确）
        if (navigator.languages && navigator.languages.length > 0) {
            userLang = navigator.languages[0];
        }
        
        // 标准化语言代码
        userLang = userLang.toLowerCase().trim();
        
        // 处理语言代码变体
        if (userLang.startsWith('zh')) {
            if (userLang.includes('tw') || userLang.includes('hk')) {
                return 'zh-TW';
            } else {
                return 'zh-CN';
            }
        }
        
        // 提取主要语言代码
        const mainLang = userLang.split('-')[0];
        
        // 检查是否支持该语言
        if (languageMap[mainLang]) {
            return mainLang;
        }
        
        // 默认返回英语
        return 'en';
    }
    
    // 检查当前页面是否匹配用户语言
    function shouldRedirect() {
        const currentPath = window.location.pathname;
        const userLang = getUserLanguage();
        const targetPage = languageMap[userLang];
        
        // 如果当前页面不是用户首选语言，且不是已经选择了特定语言
        if (currentPath.includes('index.html') && !currentPath.includes(targetPage.replace('index', ''))) {
            return targetPage;
        }
        
        return null;
    }
    
    // 执行重定向
    function redirectToLanguage() {
        const targetPage = shouldRedirect();
        
        if (targetPage && targetPage !== 'index.html') {
            // 添加延迟，避免闪烁
            setTimeout(function() {
                window.location.href = targetPage;
            }, 100);
        }
    }
    
    // 检查是否应该跳过自动重定向（用户之前手动选择过）
    function shouldSkipRedirect() {
        // 检查URL参数
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('lang') === 'manual') {
            return true;
        }
        
        // 检查localStorage（用户之前手动选择过语言）
        const manualLanguage = localStorage.getItem('manualLanguage');
        if (manualLanguage) {
            return true;
        }
        
        return false;
    }
    
    // 主函数
    function initLanguageDetection() {
        console.log('🔍 Language detector initialized');
        console.log('🌐 User language:', getUserLanguage());
        console.log('📍 Current path:', window.location.pathname);
        
        // 如果用户手动选择过语言，跳过自动重定向
        if (shouldSkipRedirect()) {
            console.log('⏭️ Skipping redirect - user manually selected language');
            return;
        }
        
        // 执行语言检测和重定向
        const targetPage = shouldRedirect();
        if (targetPage) {
            console.log('🔄 Redirecting to:', targetPage);
            redirectToLanguage();
        } else {
            console.log('✅ No redirect needed');
        }
    }
    
    // 页面加载完成后执行
    function runDetection() {
        try {
            initLanguageDetection();
        } catch (error) {
            console.error('❌ Language detection error:', error);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDetection);
    } else {
        runDetection();
    }
    
    // 备用方案：如果DOMContentLoaded没有触发，使用window.onload
    window.addEventListener('load', function() {
        if (!window.languageDetector || !window.languageDetector.getUserLanguage) {
            console.log('🔄 Fallback: Running language detection on window.load');
            runDetection();
        }
    });
    
    // 暴露函数供外部调用
    window.languageDetector = {
        getUserLanguage: getUserLanguage,
        redirectToLanguage: redirectToLanguage
    };
})();
