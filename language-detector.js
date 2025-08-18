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
        
        console.log('🔍 Checking redirect conditions:');
        console.log('  - Current path:', currentPath);
        console.log('  - User language:', userLang);
        console.log('  - Target page:', targetPage);
        
        // 处理根目录访问 (/) 的情况
        if (currentPath === '/' || currentPath === '/index.html') {
            // 如果用户语言不是英语，需要重定向
            if (userLang !== 'en') {
                console.log('  ✅ Root path detected, redirecting to:', targetPage);
                return targetPage;
            } else {
                console.log('  ✅ Root path detected, user prefers English, no redirect needed');
                return null;
            }
        }
        
        // 处理其他index页面的情况
        if (currentPath.includes('index.html') && !currentPath.includes(targetPage.replace('index', ''))) {
            console.log('  ✅ Index page detected, redirecting to:', targetPage);
            return targetPage;
        }
        
        console.log('  ❌ No redirect conditions met');
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
        console.log('🔗 Current URL:', window.location.href);
        console.log('📁 Document ready state:', document.readyState);
        
        // 如果用户手动选择过语言，跳过自动重定向
        if (shouldSkipRedirect()) {
            console.log('⏭️ Skipping redirect - user manually selected language');
            return;
        }
        
        // 执行语言检测和重定向
        const targetPage = shouldRedirect();
        if (targetPage) {
            console.log('🔄 Redirecting to:', targetPage);
            console.log('⏰ Redirect will happen in 100ms...');
            redirectToLanguage();
        } else {
            console.log('✅ No redirect needed');
        }
    }
    
    // 页面加载完成后执行
    function runDetection() {
        try {
            console.log('🚀 Running language detection...');
            initLanguageDetection();
        } catch (error) {
            console.error('❌ Language detection error:', error);
            console.error('Error stack:', error.stack);
        }
    }
    
    console.log('📜 Language detector script loaded, document ready state:', document.readyState);
    
    if (document.readyState === 'loading') {
        console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎯 DOMContentLoaded fired, running detection...');
            runDetection();
        });
    } else {
        console.log('⚡ Document already loaded, running detection immediately...');
        runDetection();
    }
    
    // 备用方案：如果DOMContentLoaded没有触发，使用window.onload
    window.addEventListener('load', function() {
        console.log('🌅 Window load event fired');
        if (!window.languageDetector || !window.languageDetector.getUserLanguage) {
            console.log('🔄 Fallback: Running language detection on window.load');
            runDetection();
        } else {
            console.log('✅ Language detector already initialized');
        }
    });
    
    // 暴露函数供外部调用
    window.languageDetector = {
        getUserLanguage: getUserLanguage,
        redirectToLanguage: redirectToLanguage
    };
})();
