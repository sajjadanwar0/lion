import fs from 'fs';
import path from 'path';
import { listFiles } from './listFiles.js';

/**
 * @param {string} filePath
 * @param {string} link
 * @param {string} rootDir
 */
function rootDirResolve(filePath, link, rootDir = process.cwd()) {
  if (link.startsWith('//') || link.startsWith('http')) {
    return '';
    // we do not handle remote files (yet)
  }
  if (link.startsWith('/')) {
    return path.join(rootDir, link);
  }
  return path.relative(rootDir, path.join(path.dirname(filePath), link));
}

/**
 * Rewrites all relative links of markdown content to absolute links.
 * Also includes images. See: https://github.com/tcort/markdown-link-extractor/blob/master/index.js
 * @param {string} mdContent - contents of .md file to parse
 * @param {string} filePath - local filesystem path of md file, like '/path/to/lion/packages/my-component/docs/myClass.md'
 * @param {object} options - configurantion object
 * @param {string} options.gitHubUrl - root github url for the absolute result links
 * @param {string} options.gitRootDir - root github directory to generate relative urls to it
 * @returns {string} adjusted contents of input md file (mdContent)
 */
function rewriteLinksInMdContent(mdContent, filePath, { gitHubUrl, gitRootDir }) {
  /**
   * @param {string} href
   */
  const rewrite = href => {
    const relativeUrl = rootDirResolve(filePath, href, gitRootDir);
    if (relativeUrl) {
      const commitSha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA : 'master';
      const githubWithCommitShaUrl = new URL(`blob/${commitSha}/`, gitHubUrl).href;
      const newUrl = new URL(relativeUrl, githubWithCommitShaUrl).href;
      return newUrl;
    }
    return href;
  };

  /**
   * @param {string} href
   * @param {string} title
   * @param {string} text
   */
  const mdLink = (href, title, text) => `[${text}](${rewrite(href)}${title ? ` ${title}` : ''})`;

  /** @type {string[]} */
  const resultLinks = [];
  // /^!?\[(label)\]\(href(?:\s+(title))?\s*\)/
  const linkPattern = '!?\\[(.*)\\]\\(([^|\\s]*)( +(.*))?\\s*\\)'; // eslint-disable-line
  const matches = mdContent.match(new RegExp(linkPattern, 'g')) || [];

  matches.forEach(link => {
    let newLink = '';
    const parts = link.match(new RegExp(linkPattern));
    if (parts) {
      newLink = mdLink(parts[2], parts[3], parts[1]);
    }
    resultLinks.push(newLink);
  });

  // Now that we have our rewritten links, stitch back together the desired result
  const tokenPattern = /!?\[.*\]\([^|\s]*(?: +.*)?\s*\)/;
  const tokens = mdContent.split(new RegExp(tokenPattern, 'g'));

  /** @type {string[]} */
  const resultTokens = [];
  tokens.forEach((token, i) => {
    resultTokens.push(token + (resultLinks[i] || ''));
  });
  const resultContent = resultTokens.join('');
  return resultContent;
}

/**
 * @typedef {object} PublishDocsOptions
 * @property {string} projectDir
 * @property {string} gitHubUrl
 * @property {string} gitRootDir
 * @property {string} copyPattern
 */

export class PublishDocs {
  options = {
    projectDir: process.cwd(),
    gitHubUrl: '',
    gitRootDir: process.cwd(),
    copyPattern: '',
    copyTarget: 'docs/assets/',
  };

  /**
   * @param {Partial<PublishDocsOptions>} options
   */
  constructor(options) {
    this.setOptions(options);
  }

  /**
   * @param {Partial<PublishDocsOptions>} options
   */
  setOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  async copyAssets() {
    if (
      !this.options.projectDir ||
      !this.options.gitRootDir ||
      !this.options.copyPattern ||
      !this.options.copyTarget
    ) {
      throw new Error(
        `You need to provide a valid projectDir (given ${this.options.projectDir}), gitRootDir (given ${this.options.gitRootDir}), copyPattern (given ${this.options.copyPattern}) & copyTarget (given ${this.options.copyTarget})`,
      );
    }

    const targetDir = path.join(this.options.projectDir, this.options.copyTarget);
    const assets = await listFiles(this.options.copyPattern, this.options.gitRootDir);
    for (const asset of assets) {
      await fs.promises.mkdir(targetDir, { recursive: true });
      await fs.promises.copyFile(asset, path.join(targetDir, path.basename(asset)));
    }
  }

  async execute() {
    if (!this.options.projectDir || !this.options.gitHubUrl || !this.options.gitRootDir) {
      throw new Error('You need to provide projectDir, githubUrl & githubRootDir');
    }

    const files = await listFiles('**/*.md', this.options.projectDir);

    if (this.options.copyPattern) {
      await this.copyAssets();
    }

    for (const file of files) {
      const fileContent = await fs.promises.readFile(file, 'utf8');
      if (fileContent.includes('[=> See Source <=](')) {
        const matches = fileContent.match(/\[=> See Source <=\]\((.*?)\)/);
        if (matches) {
          if (matches.length !== 2) {
            throw new Error('you can only define one source file');
          }
          const rawImportFilePath = matches[1];
          const importFilePath = path.join(path.dirname(file), rawImportFilePath);
          let newFileContent = await fs.promises.readFile(importFilePath, 'utf8');

          newFileContent = rewriteLinksInMdContent(newFileContent, importFilePath, {
            gitHubUrl: this.options.gitHubUrl,
            gitRootDir: this.options.gitRootDir,
          });

          await fs.promises.writeFile(file, newFileContent);
        }
      }
    }
  }
}
