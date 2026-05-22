import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { PALETTE, extColor, formatBytes, CSS } from '../utils/theme';

export default function Treemap({ data, width, height, onHover, onDrillDown }) {
  const svgRef = useRef(null);

  const render = useCallback(() => {
    if (!data || width <= 0 || height <= 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // ── Build hierarchy ──────────────────────────────────────────────────
    const root = d3.hierarchy(data)
      .sum(d => d.size ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.treemap()
      .size([width, height])
      .paddingOuter(4)
      .paddingTop(d => (d.depth === 1 ? 20 : 2))
      .paddingInner(1.5)
      .round(true)(root);

    // ── Color: top-level folders get palette colors; files use ext color ─
    const folderColors = {};
    (root.children ?? []).forEach((child, i) => {
      folderColors[child.data.id] = PALETTE[i % PALETTE.length];
    });

    function nodeColor(d) {
      if (d.data.isFolder) {
        let cur = d;
        while (cur.parent && cur.parent !== root) cur = cur.parent;
        return folderColors[cur.data.id] ?? PALETTE[0];
      }
      return extColor(d.data.name);
    }

    // ── Defs: clip paths ──────────────────────────────────────────────────
    const defs = svg.append('defs');

    // ── Draw folder labels (non-leaf groups) ─────────────────────────────
    const groups = root.descendants().filter(d => d.depth > 0 && d.children);

    svg.selectAll('.folder-bg')
      .data(groups)
      .join('rect')
      .attr('class', 'folder-bg')
      .attr('x', d => d.x0).attr('y', d => d.y0)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill', d => {
        const color = folderColors[d.data.id] ?? PALETTE[0];
        return d3.color(color)?.copy({ opacity: 0.07 }) ?? 'rgba(255,255,255,0.04)';
      })
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('click', (event, d) => onDrillDown?.(d.data));

    const MIN_LABEL_W = 52;
    const labelGroups = groups.filter(d => (d.x1 - d.x0) >= MIN_LABEL_W);

    labelGroups.forEach((d, i) => {
      defs.append('clipPath')
        .attr('id', `flc-${i}`)
        .append('rect')
        .attr('x', d.x0).attr('y', d.y0)
        .attr('width', d.x1 - d.x0)
        .attr('height', 20);
    });

    svg.selectAll('.folder-label')
      .data(labelGroups)
      .join('text')
      .attr('class', 'folder-label')
      .attr('x', d => d.x0 + 5)
      .attr('y', d => d.y0 + 14)
      .attr('font-size', 10)
      .attr('font-family', CSS.mono)
      .attr('fill', '#94a3b8')
      .attr('fill-opacity', 0.7)
      .attr('pointer-events', 'none')
      .attr('clip-path', (d, i) => `url(#flc-${i})`)
      .text(d => {
        const w = d.x1 - d.x0;
        const label = `📁 ${d.data.name}`;
        const max = Math.floor(w / 6.5);
        return label.length > max ? label.slice(0, max - 1) + '…' : label;
      });

    // ── Draw leaves ───────────────────────────────────────────────────────
    const leaves = root.leaves();
    const cell = svg.selectAll('.cell')
      .data(leaves)
      .join('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    cell.append('rect')
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('fill', nodeColor)
      .attr('fill-opacity', 0.75)
      .attr('rx', 2)
      .style('cursor', 'default')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('fill-opacity', 1)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5);
        onHover?.({
          name: d.data.name,
          size: d.value ?? d.data.size,
          mimeType: d.data.mimeType,
          path: buildPath(d),
        });
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill-opacity', 0.75).attr('stroke', null);
        onHover?.(null);
      });

    // Labels for leaves with enough space
    leaves.forEach((d, i) => {
      defs.append('clipPath')
        .attr('id', `lc-${i}`)
        .append('rect')
        .attr('width', Math.max(0, d.x1 - d.x0))
        .attr('height', Math.max(0, d.y1 - d.y0));
    });

    cell.each(function (d, i) {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      if (w < 48 || h < 16) return;
      const g = d3.select(this);
      const fontSize = Math.min(11, Math.max(8, w / 12));
      const name = d.data.name;
      const maxChars = Math.floor((w - 6) / (fontSize * 0.6));
      const label = name.length > maxChars ? name.slice(0, maxChars - 1) + '…' : name;

      g.append('text')
        .attr('x', 3).attr('y', fontSize + 2)
        .attr('font-size', fontSize)
        .attr('font-family', CSS.mono)
        .attr('fill', '#fff')
        .attr('fill-opacity', 0.88)
        .attr('pointer-events', 'none')
        .attr('clip-path', `url(#lc-${i})`)
        .text(label);

      if (h > 30 && w > 64) {
        g.append('text')
          .attr('x', 3).attr('y', fontSize * 2 + 4)
          .attr('font-size', Math.max(8, fontSize - 1))
          .attr('font-family', CSS.mono)
          .attr('fill', '#fff')
          .attr('fill-opacity', 0.5)
          .attr('pointer-events', 'none')
          .attr('clip-path', `url(#lc-${i})`)
          .text(formatBytes(d.value ?? d.data.size));
      }
    });
  }, [data, width, height, onHover, onDrillDown]);

  useEffect(() => { render(); }, [render]);

  return <svg ref={svgRef} width={width} height={height} style={{ display: 'block' }} />;
}

function buildPath(node) {
  const parts = [];
  let cur = node;
  while (cur.parent) { parts.unshift(cur.data.name); cur = cur.parent; }
  return '/' + parts.join('/');
}
