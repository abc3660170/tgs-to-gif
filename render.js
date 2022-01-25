import { join } from 'path';
import tempy from 'tempy';
import { readFromFile } from './utils.js';


let lottieScript;

const getHtml = async function ({ animationData, background, width, height }) {
    if (!lottieScript) {
        lottieScript = await readFromFile('./node_modules/lottie-web/build/player/lottie.min.js');
    }

    return `
<html>
<head>
  <meta charset="UTF-8">

  <script>${lottieScript}</script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
        
    body {
      background: ${background};
    
      ${width ? 'width: ' + width + 'px;' : ''}
      ${height ? 'height: ' + height + 'px;' : ''}
    
      overflow: hidden;
    }
  </style>
</head>

<body>

<div id="root"></div>

<script>
  const animationData = ${JSON.stringify(animationData)}
  let animation = null
  let duration
  let numFrames

  function onReady () {
    animation = lottie.loadAnimation({
      container: document.getElementById('root'),
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: animationData
    })

    duration = animation.getDuration()
    numFrames = animation.getDuration(true)

    var div = document.createElement('div')
    div.className = 'ready'
    document.body.appendChild(div)
  }

  document.addEventListener('DOMContentLoaded', onReady)
</script>

</body>
</html>
`;
}

export default async function (browser, animationData, options = {}) {
    const {
        background = 'transparent',
        width = undefined,
        height = undefined,
        fps = ~~animationData.fr,
    } = options;

    const html = await getHtml({ animationData, background, width, height });
    const fpsRatio = ~~animationData.fr / fps;

    const page = await browser.newPage();

    page.on('console', console.log.bind(console));
    page.on('error', console.error.bind(console));

    await page.setContent(html);
    await page.waitForSelector('.ready');

    const duration = await page.evaluate(() => duration);
    const outputNumFrames = Math.ceil(fps * duration);

    const pageFrame = page.mainFrame();
    const rootHandle = await pageFrame.$('#root');

    const dir = tempy.directory();
    const files = [];
    files.length = outputNumFrames;
    for (let frame = 0; frame < outputNumFrames; ++frame) {
        const filePath = join(dir, `file-${frame}.png`);
        await page.evaluate((frame) => animation.goToAndStop(frame, true), frame * fpsRatio);
        await rootHandle.screenshot({ omitBackground: true, type: 'png', path: filePath });
        files[frame] = filePath;
    }
    return { dir, files, pattern: join(dir, 'file-*.png') };
};
