import mistune
import imgkit
from PIL import Image
import os
import re
import uuid
import shutil
import requests


# 创建临时目录用于存放处理过程中的文件
TEMP_DIR = "temp_render"
os.makedirs(TEMP_DIR, exist_ok=True)


# markdown解析为HTML
def markdown_to_html(markdown_text):
    renderer = mistune.HTMLRenderer()
    markdown = mistune.Markdown(renderer=renderer)
    html_text = markdown(markdown_text)
    return html_text


# 下载网络图片到本地临时目录并返回本地路径
def download_network_image(image_url):
    temp_image_uuid = str(uuid.uuid4())
    temp_image_path = os.path.join(TEMP_DIR, f"{temp_image_uuid}.png")

    response = requests.get(image_url)
    if response.status_code == 200:
        with open(temp_image_path, 'wb') as f:
            f.write(response.content)
        return temp_image_path
    else:
        raise Exception(f"下载网络图片失败，URL: {image_url}，状态码: {response.status_code}")


# 处理本地图片路径（这里包括从网络下载后保存到本地的图片路径），调整图片大小并保存到临时目录
def process_local_image(image_path, new_width, new_height):
    image = Image.open(image_path)
    image = image.resize((new_width, new_height))
    temp_image_uuid = str(uuid.uuid4())
    temp_image_path = os.path.join(TEMP_DIR, f"{temp_image_uuid}.png")
    image.save(temp_image_path)
    return temp_image_path


# 在HTML中替换图片路径为处理后的临时图片路径
def replace_image_paths_in_html(html_text, image_path_mapping):
    for old_path, new_path in image_path_mapping.items():
        html_text = html_text.replace(old_path, new_path)
    return html_text


# 渲染HTML为图片
def html_to_image(html_text, output_image_path):
    # Remove fixed width and height to allow content to determine size
    options = {
        'format': 'png'  # Ensure the output format is PNG
    }
    # Add CSS to ensure the content fits the image size
    css = """
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        img {
            max-width: 100%;
            height: auto;
        }
    </style>
    """
    # Combine CSS with HTML
    html_with_css = css + html_text
    imgkit.from_string(html_with_css, output_image_path, options=options) 


# 清理临时目录
def clean_temp_directory():
    shutil.rmtree(TEMP_DIR)


if __name__ == "__main__":
    # 读取本地Markdown文本文件的路径
    md_file_path = './markdown_render/python/demo.md'

    try:
        with open(md_file_path, encoding='utf-8') as f:
            markdown_text = f.read()

        # 将markdown解析为HTML
        html_text = markdown_to_html(markdown_text)

        # 查找Markdown中所有网络图片URL链接
        image_urls = re.findall(r'\!\[.*?\]\((.*?)\)', markdown_text)

        image_path_mapping = {}
        for image_url in image_urls:
            # 下载网络图片到本地临时目录
            local_image_path = download_network_image(image_url)
            # 处理每张图片，调整大小并保存到临时目录
            new_image_path = process_local_image(local_image_path, 400, 300)
            image_path_mapping[image_url] = new_image_path

        # 在HTML中替换图片路径
        html_text = replace_image_paths_in_html(html_text, image_path_mapping)

        # 生成输出图片路径
        output_image_path = "output_image.png"

        # 渲染HTML为图片
        html_to_image(html_text, output_image_path)

        # 清理临时目录
        clean_temp_directory()
    except FileNotFoundError:
        print(f"文件未找到，请检查输入的路径是否正确：{md_file_path}")
    except Exception as e:
        print(f"处理过程中出现错误：{e}")