const express = require('express');
const marked = require('marked');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs');

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

    const html = marked.parse(markdownText);
    console.log('Generated HTML:', html); // 打印生成的HTML内容

    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const img = await page.screenshot({ type: 'png' });
        const imgBuffer = Buffer.from(img, 'base64');
        res.send(imgBuffer);
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