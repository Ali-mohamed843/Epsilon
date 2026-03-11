import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react-native';

const BRAND = '#6e226e';

const SentimentWordCloud = ({ percentage, words = [], height = 420 }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const positiveWords = useMemo(() => words.filter((w) => w.sentiment === 'positive'), [words]);
  const negativeWords = useMemo(() => words.filter((w) => w.sentiment === 'negative'), [words]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoomLevel(1);

  const buildHtml = (wordList, color, bgColor, zoom) => {
    const safeWords = JSON.stringify(
      wordList.map((w) => ({ text: w.text.trim(), size: w.value }))
    );

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: ${bgColor}; overflow: hidden; touch-action: none; }
  #wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  #cloud {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
    will-change: transform;
  }
</style>
</head>
<body>
<div id="wrapper">
  <div id="cloud"></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min.js"></script>
<script>
  const words = ${safeWords};
  const W = window.innerWidth;
  const H = window.innerHeight;

  const maxVal = Math.max(...words.map(w => w.size), 1);
  const minVal = Math.min(...words.map(w => w.size), 1);
  const sc = d3.scaleSqrt().domain([minVal, maxVal]).range([11, 46]);

    function wordColor(d) {
    const intensity = d.originalSize / maxVal;
    if ("${color}" === "#10B981") {
      // Clear green shades: from #34D399 (light) to #059669 (dark)
      const r = Math.round(52 - intensity * 47);
      const g = Math.round(211 - intensity * 61);
      const b = Math.round(153 - intensity * 48);
      return \`rgb(\${r}, \${g}, \${b})\`;
    } else {
      // Clear red shades: from #F87171 (light) to #DC2626 (dark)
      const r = Math.round(248 - intensity * 28);
      const g = Math.round(113 - intensity * 75);
      const b = Math.round(113 - intensity * 75);
      return \`rgb(\${r}, \${g}, \${b})\`;
    }
  }

  const layout = d3.layout.cloud()
    .size([W, H])
    .words(words.map(w => ({ text: w.text, size: sc(w.size), originalSize: w.size })))
    .padding(4)
    .rotate(() => 0)
    .font("'Segoe UI', 'Arial', sans-serif")
    .fontSize(d => d.size)
    .on("end", draw);

  layout.start();

  function draw(drawnWords) {
    const svg = d3.select("#cloud")
      .append("svg")
      .attr("width", W)
      .attr("height", H);

    svg.append("g")
      .attr("transform", \`translate(\${W / 2},\${H / 2})\`)
      .selectAll("text")
      .data(drawnWords)
      .enter()
      .append("text")
      .style("font-size", d => d.size + "px")
      .style("font-family", "'Segoe UI', 'Arial', sans-serif")
      .style("font-weight", d => d.originalSize >= 5 ? "700" : d.originalSize >= 3 ? "600" : "500")
      .style("fill", wordColor)
      .attr("text-anchor", "middle")
      .attr("transform", d => \`translate(\${d.x},\${d.y})\`)
      .text(d => d.text);
  }

  // ── Pan & Pinch-to-zoom ──
  const cloud = document.getElementById('cloud');
  let scale = ${zoom};
  let panX = 0;
  let panY = 0;

  // Pinch state
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let pinchStartX = 0;
  let pinchStartY = 0;
  let pinchStartPanX = 0;
  let pinchStartPanY = 0;

  // Pan state
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panStartOffsetX = 0;
  let panStartOffsetY = 0;

  function applyTransform() {
    cloud.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + scale + ')';
  }

  function getDist(t) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getMid(t) {
    return {
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    };
  }

  applyTransform();

  document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPanning = false;
      pinchStartDist = getDist(e.touches);
      pinchStartScale = scale;
      const mid = getMid(e.touches);
      pinchStartX = mid.x;
      pinchStartY = mid.y;
      pinchStartPanX = panX;
      pinchStartPanY = panY;
    } else if (e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      isPanning = true;
      panStartX = e.touches[0].clientX;
      panStartY = e.touches[0].clientY;
      panStartOffsetX = panX;
      panStartOffsetY = panY;
    }
  }, { passive: false });

  document.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDist(e.touches);
      const ratio = dist / pinchStartDist;
      const newScale = Math.min(Math.max(pinchStartScale * ratio, 0.3), 5);

      // Pan follows pinch midpoint
      const mid = getMid(e.touches);
      const dx = mid.x - pinchStartX;
      const dy = mid.y - pinchStartY;

      scale = newScale;
      panX = pinchStartPanX + dx;
      panY = pinchStartPanY + dy;
      applyTransform();
    } else if (e.touches.length === 1 && isPanning) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panStartX;
      const dy = e.touches[0].clientY - panStartY;
      panX = panStartOffsetX + dx;
      panY = panStartOffsetY + dy;
      applyTransform();
    }
  }, { passive: false });

  document.addEventListener('touchend', function(e) {
    if (e.touches.length < 2) {
      isPanning = false;

      // Snap back if zoomed out below 1
      if (scale <= 1) {
        scale = Math.max(scale, 0.5);
        panX = 0;
        panY = 0;
        cloud.style.transition = 'transform 0.25s ease';
        applyTransform();
        setTimeout(function() { cloud.style.transition = 'none'; }, 260);
      }

      // Send zoom level back
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ zoom: scale }));
      }
    }
  });
</script>
</body>
</html>
    `;
  };

  const positiveHtml = useMemo(
  () => buildHtml(positiveWords, '#10B981', '#ffffff', zoomLevel),
  [positiveWords, zoomLevel]
);
const negativeHtml = useMemo(
  () => buildHtml(negativeWords, '#EF4444', '#ffffff', zoomLevel),
  [negativeWords, zoomLevel]
);

  const cloudHeight = height - 120;

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 }}>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#1e293b' }}>
          Comments Sentiment
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            onPress={handleZoomOut}
            activeOpacity={0.7}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: zoomLevel <= 0.5 ? '#f1f5f9' : '#6e226e10',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: zoomLevel <= 0.5 ? 0.4 : 1,
            }}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut size={16} color={zoomLevel <= 0.5 ? '#94A3B8' : BRAND} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            activeOpacity={0.7}
            style={{
              paddingHorizontal: 8,
              height: 32,
              borderRadius: 8,
              backgroundColor: zoomLevel === 1 ? '#f1f5f9' : '#6e226e10',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            <RotateCcw size={12} color={zoomLevel === 1 ? '#94A3B8' : BRAND} />
            <Text style={{
              fontSize: 11,
              fontWeight: '600',
              color: zoomLevel === 1 ? '#94A3B8' : BRAND,
              marginLeft: 4,
            }}>
              {Math.round(zoomLevel * 100)}%
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleZoomIn}
            activeOpacity={0.7}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: zoomLevel >= 3 ? '#f1f5f9' : '#6e226e10',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: zoomLevel >= 3 ? 0.4 : 1,
            }}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn size={16} color={zoomLevel >= 3 ? '#94A3B8' : BRAND} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#f1f5f9' }}>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#10B981' }}>Positive</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#10B981', marginTop: 2 }}>
              {percentage?.positive ?? 0}%
            </Text>
          </View>
          <View style={{ height: cloudHeight }}>
            {positiveWords.length > 0 ? (
              <WebView
                key={`pos-${zoomLevel}`}
                source={{ html: positiveHtml }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                scrollEnabled={false}
                scalesPageToFit={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                originWhitelist={['*']}
                javaScriptEnabled
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.zoom) setZoomLevel(Math.round(data.zoom * 100) / 100);
                  } catch {}
                }}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>No data</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#EF4444' }}>Negative</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#EF4444', marginTop: 2 }}>
              {percentage?.negative ?? 0}%
            </Text>
          </View>
          <View style={{ height: cloudHeight }}>
            {negativeWords.length > 0 ? (
              <WebView
                key={`neg-${zoomLevel}`}
                source={{ html: negativeHtml }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                scrollEnabled={false}
                scalesPageToFit={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                originWhitelist={['*']}
                javaScriptEnabled
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.zoom) setZoomLevel(Math.round(data.zoom * 100) / 100);
                  } catch {}
                }}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>No data</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default SentimentWordCloud;