const express = require('express');
const marked = require('marked');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = 3000;

// 配置CORS选项
app.use(cors({
    origin: '*', // 允许所有域名访问
    optionsSuccessStatus: 200 // 一些旧版浏览器不支持 204
}));
app.use(express.json()); // 用于解析JSON请求体

app.post('/generate-image', async (req, res) => {
    const markdownText = req.body.markdown;
    if (!markdownText) {
        return res.status(400).send('No markdown text provided');
    }

    // 使用marked库将Markdown文本转换为HTML
    const html = marked.parse(markdownText);
    console.log('Generated HTML:', html); // 打印生成的HTML内容

    let browser;
    try {
        // 启动Puppeteer浏览器实例
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // 设置页面内容
        await page.setContent(html);
        
        // 等待页面上的图片元素加载完成
        const images = await page.$$('img');
        const imageLoadingPromises = images.map(image => {
            return page.waitForResponse(response => {
                return response.url() === image.getAttribute('src') && response.status() === 200;
            });
        });
        await Promise.all([...imageLoadingPromises]);
        
        // 使用 JavaScript 的 setTimeout 函数来实现等待效果
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒确保所有资源加载
        
        // 截图并获取图片的Buffer
        const img = await page.screenshot({ type: 'png' });
        const imgBuffer = Buffer.from(img, 'base64');
        
        // 将图片Buffer作为响应发送
        res.writeHead(200, {
            'Content-Type': 'image/png'
        });
        res.end(imgBuffer, 'binary');
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});