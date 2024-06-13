/**
 * 解析lrc,得到一个对象数组
 * 每行歌词对象的格式：{ time: startTime, line: content }
 */
function parseLRC() {
  const results = []; // 歌词对象数组
  const lines = lrc.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split("]");
    const obj = {
      time: parseTime(parts[0].substring(1)),
      content: parts[1],
    };
    results.push(obj);
  }
  return results;
}

/**
 * 解析时间字符串，得到一个数字（秒）
 * @param {String} timeStr 时间字符串
 * @returns
 */
function parseTime(timeStr) {
  const parts = timeStr.split(":");
  return +parts[0] * 60 + +parts[1];
}

const lrcData = parseLRC();

// 获取需要的dom
const doms = {
  audio: document.querySelector("audio"),
  ul: document.querySelector(".container ul"),
  container: document.querySelector(".container"),
};

function findIndex() {
  // 播放器当前时间
  const curTime = doms.audio.currentTime;
  // 二分搜索
  let left = 0,
    right = lrcData.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (lrcData[mid].time === curTime) {
      return mid;
    } else if (lrcData[mid].time < curTime) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return left - 1;
}

/**
 * 创建歌词元素 li
 */
function createLRCElement() {
  const frag = document.createDocumentFragment(); // 创建文档片段用来收集批量修改
  for (let i = 0; i < lrcData.length; i++) {
    const li = document.createElement("li");
    li.textContent = lrcData[i].content;
    frag.appendChild(li); // 改动了DOM树
  }
  doms.ul.appendChild(frag);
}

// init
createLRCElement();

/**
 * 设置ul元素的偏移量
 */
const containerHeight = doms.container.clientHeight; // 容器高度
const liHeight = doms.ul.children[0].clientHeight; // 单个li的高度
const maxOffset = doms.ul.clientHeight - containerHeight;
function setOffset() {
  const index = findIndex();
  let offset = (index + 1 / 2) * liHeight - (containerHeight * 1) / 2;
  offset = offset < 0 ? 0 : offset > maxOffset ? maxOffset : offset;

  doms.ul.style.transform = `translateY(-${offset}px)`;

  doms.ul.querySelector(".active")?.classList.remove("active");
  doms.ul.children[index]?.classList.add("active");
}

doms.audio.addEventListener("timeupdate", setOffset);
