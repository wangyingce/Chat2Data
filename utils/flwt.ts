import fs from 'fs/promises';

export class Flwts {
  static async writeToFile(content: string) {
    try {
      let fileContent = await fs.readFile('nmspclst.txt', 'utf8');
      if (fileContent.indexOf(content)>-1) {
        console.log('pdf已存在不写入');
      }else{
        await fs.writeFile('nmspclst.txt', fileContent+content+',', 'utf8');
        console.log('文件写入');
      }
    } catch (error) {
      console.error('在写入文件时发生错误:', error);
    }
  }
  static async readFileContent() {
    try {
      const content = await fs.readFile('nmspclst.txt', 'utf8');
      const fileContent = content.split('.pdf,').filter(item => item.trim() !== '');
      return fileContent;
    } catch (error) {
      console.error('读取文件时发生错误:', error);
      return [];
    }
  }
}